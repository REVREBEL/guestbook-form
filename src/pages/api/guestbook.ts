/**
 * Guestbook Form Submission Endpoint
 * 
 * POST /guestbook-form/api/guestbook
 * 
 * This endpoint receives form submissions directly from the Webflow form
 * in the Designer, processes the data, and submits it to the Webflow CMS.
 * 
 * FIELD MAPPING RULES:
 * ---------------------
 * 1. full_name → "name" (required CMS field) AND "first-name" (custom field)
 * 2. edit-code → Auto-generated 6-character alphanumeric code
 * 3. slug → Auto-generated 10-character alphanumeric code
 * 4. active → Always set to true on creation
 * 5. date_added → Current timestamp
 * 6. All other fields → One-to-one mapping with hyphenation
 * 
 * EDIT FUNCTIONALITY:
 * -------------------
 * Users receive an email after submission containing:
 * - Email address
 * - Slug
 * - Edit code
 * 
 * To edit their entry later, users must provide all three values:
 * - email (matches email-address field)
 * - slug (unique identifier)
 * - edit-code (secret code)
 * 
 * All three must match to unlock edit access.
 */

import type { APIRoute } from 'astro';
import { WebflowClient } from 'webflow-api';

/**
 * Generates a random alphanumeric code
 * @param length - Length of the code to generate
 * @returns Random alphanumeric string
 */
function generateCode(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Maps form field names to CMS field slugs
 */
function mapFormDataToCMS(formData: FormData, isUpdate: boolean = false) {
  const fullName = formData.get('full_name') as string;
  const email = formData.get('email') as string;
  const location = formData.get('guestbook_location') as string;
  const firstMet = formData.get('guestbook_first_met') as string;
  const relationship = formData.get('guestbook_relationship') as string;
  const message = formData.get('guestbook_message') as string;

  // Generate codes only for new entries
  const slug = isUpdate 
    ? (formData.get('slug') as string) 
    : generateCode(10);
  
  const editCode = isUpdate 
    ? (formData.get('edit_code') as string) 
    : generateCode(6);

  // Build CMS payload
  const fieldData: Record<string, any> = {
    // Required CMS fields
    name: fullName,  // Required "name" field
    slug: slug,      // Required "slug" field (10-char code)
    
    // Custom fields
    'first-name': fullName,        // full_name also goes to first-name
    'email-address': email,         // email → email-address
    'edit-code': editCode,          // Auto-generated 6-char code
    'active': true,                 // Always true on creation/update
    'date-added': new Date().toISOString(), // Current timestamp
  };

  // One-to-one field mappings (optional fields)
  if (location) {
    fieldData['location'] = location; // guestbook_location → location
  }
  
  if (firstMet) {
    fieldData['memory'] = firstMet; // guestbook_first_met → memory
  }
  
  if (relationship) {
    fieldData['tag-1'] = relationship; // guestbook_relationship → tag-1
  }
  
  if (message) {
    fieldData['message'] = message; // guestbook_message → message
  }

  return {
    isArchived: false,
    isDraft: false,
    fieldData
  };
}

/**
 * Verifies edit credentials
 * Returns the item ID if credentials match, null otherwise
 */
async function verifyEditCredentials(
  client: WebflowClient,
  collectionId: string,
  email: string,
  slug: string,
  editCode: string
): Promise<string | null> {
  try {
    // List all live items (we'll need to filter client-side since API doesn't support all our filters)
    const response = await client.collections.items.listItemsLive(collectionId, {
      limit: 100
    });

    // Find matching item
    const matchingItem = response.items?.find((item: any) => {
      const fieldData = item.fieldData || {};
      return (
        fieldData['email-address'] === email &&
        fieldData['slug'] === slug &&
        fieldData['edit-code'] === editCode
      );
    });

    return matchingItem?.id || null;
  } catch (error) {
    console.error('Error verifying edit credentials:', error);
    return null;
  }
}

/**
 * POST handler for form submissions
 */
export const POST: APIRoute = async ({ request, locals, redirect }) => {
  // Get API token from environment
  const token = locals?.runtime?.env?.WEBFLOW_CMS_SITE_API_TOKEN || import.meta.env.WEBFLOW_CMS_SITE_API_TOKEN;
  
  if (!token) {
    console.error('Missing WEBFLOW_CMS_SITE_API_TOKEN');
    return new Response(JSON.stringify({ 
      error: 'Server configuration error' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Initialize Webflow client
  const baseUrl = locals?.runtime?.env?.WEBFLOW_API_HOST || import.meta.env.WEBFLOW_API_HOST;
  const client = new WebflowClient({
    accessToken: token,
    ...(baseUrl && { baseUrl })
  });

  try {
    // Parse form data
    const formData = await request.formData();
    
    // Get collection ID (required)
    const collectionId = formData.get('collection_id') as string;
    if (!collectionId) {
      return new Response(JSON.stringify({ 
        error: 'Missing collection_id' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate required fields
    const fullName = formData.get('full_name') as string;
    const email = formData.get('email') as string;
    
    if (!fullName || !email) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: full_name and email are required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if this is an edit request (has edit credentials)
    const editSlug = formData.get('edit_slug') as string;
    const editCode = formData.get('edit_code') as string;
    
    let itemId: string | null = null;
    let isUpdate = false;

    // If edit credentials provided, verify them
    if (editSlug && editCode) {
      itemId = await verifyEditCredentials(client, collectionId, email, editSlug, editCode);
      
      if (!itemId) {
        return new Response(JSON.stringify({ 
          error: 'Invalid edit credentials. Please check your email, slug, and edit code.' 
        }), { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      isUpdate = true;
      // Preserve the existing slug and edit code for updates
      formData.set('slug', editSlug);
      formData.set('edit_code', editCode);
    }

    // Map form data to CMS format
    const cmsPayload = mapFormDataToCMS(formData, isUpdate);

    // Submit to Webflow CMS
    let result;
    if (isUpdate && itemId) {
      // Update existing item
      result = await client.collections.items.updateItem(collectionId, itemId, cmsPayload);
    } else {
      // Create new item
      result = await client.collections.items.createItem(collectionId, cmsPayload);
    }

    // TODO: Send email with edit credentials
    // Email should contain:
    // - Email: cmsPayload.fieldData['email-address']
    // - Slug: cmsPayload.fieldData['slug']
    // - Edit Code: cmsPayload.fieldData['edit-code']
    // 
    // Implementation note: Add email service integration here
    // (e.g., SendGrid, Mailgun, Resend, etc.)

    // Return success response
    return new Response(JSON.stringify({ 
      success: true,
      message: isUpdate ? 'Entry updated successfully' : 'Entry created successfully',
      data: {
        id: result.id,
        slug: cmsPayload.fieldData.slug,
        editCode: cmsPayload.fieldData['edit-code'],
        // Don't expose email in response for security
      }
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Guestbook submission error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(JSON.stringify({ 
      error: 'Failed to process submission',
      details: errorMessage
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

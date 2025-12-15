/**
 * Guestbook Form Submission Endpoint
 * 
 * POST /guestbook-form/api/guestbook
 * 
 * This endpoint receives form submissions directly from the Webflow form
 * in the Designer, processes the data, and submits it to the Webflow CMS.
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
    fieldData['location'] = location;
  }
  
  if (firstMet) {
    fieldData['memory'] = firstMet;
  }
  
  if (relationship) {
    fieldData['tag-1'] = relationship;
  }
  
  if (message) {
    fieldData['message'] = message;
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
    const response = await client.collections.items.listItemsLive(collectionId, {
      limit: 100
    });

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
export const POST: APIRoute = async ({ request, locals }) => {
  // ✅ USE THE WRITE TOKEN
  const token = 
    locals?.runtime?.env?.WEBFLOW_CMS_SITE_API_TOKEN_WRITE || 
    import.meta.env.WEBFLOW_CMS_SITE_API_TOKEN_WRITE ||
    locals?.runtime?.env?.WEBFLOW_CMS_SITE_API_TOKEN || 
    import.meta.env.WEBFLOW_CMS_SITE_API_TOKEN;
  
  if (!token) {
    console.error('Missing WEBFLOW_CMS_SITE_API_TOKEN_WRITE');
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

    // Check if this is an edit request
    const editSlug = formData.get('edit_slug') as string;
    const editCode = formData.get('edit_code') as string;
    
    let itemId: string | null = null;
    let isUpdate = false;

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
      formData.set('slug', editSlug);
      formData.set('edit_code', editCode);
    }

    // Map form data to CMS format
    const cmsPayload = mapFormDataToCMS(formData, isUpdate);

    // Submit to Webflow CMS
    let result;
    if (isUpdate && itemId) {
      result = await client.collections.items.updateItem(collectionId, itemId, cmsPayload);
    } else {
      result = await client.collections.items.createItem(collectionId, cmsPayload);
    }

    // Return success response
    return new Response(JSON.stringify({ 
      success: true,
      message: isUpdate ? 'Entry updated successfully' : 'Entry created successfully',
      data: {
        id: result.id,
        slug: cmsPayload.fieldData.slug,
        editCode: cmsPayload.fieldData['edit-code'],
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

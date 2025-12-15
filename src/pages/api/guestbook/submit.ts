/**
 * Form submission endpoint for Webflow forms
 * 
 * This endpoint receives form submissions directly from Webflow forms
 * and processes them server-side, then redirects back with success/error.
 */

import type { APIRoute } from 'astro';
import { WebflowClient } from 'webflow-api';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  // ✅ USE THE WRITE TOKEN FIRST, FALL BACK TO READ TOKEN
  const token = 
    locals?.runtime?.env?.WEBFLOW_CMS_SITE_API_TOKEN_WRITE || 
    import.meta.env.WEBFLOW_CMS_SITE_API_TOKEN_WRITE ||
    locals?.runtime?.env?.WEBFLOW_CMS_SITE_API_TOKEN || 
    import.meta.env.WEBFLOW_CMS_SITE_API_TOKEN;
    
  if (!token) {
    return new Response('Missing API token', { status: 500 });
  }

  const baseUrl = locals?.runtime?.env?.WEBFLOW_API_HOST || import.meta.env.WEBFLOW_API_HOST;
  const client = new WebflowClient({
    accessToken: token,
    ...(baseUrl && { baseUrl })
  });

  try {
    // Parse form data
    const formData = await request.formData();
    
    const collectionId = formData.get('collection_id') as string;
    const itemId = formData.get('itemId') as string | null;
    
    // Extract form fields
    const fullName = formData.get('full_name') as string;
    const email = formData.get('email') as string;
    const location = formData.get('guestbook_location') as string;
    const firstMet = formData.get('guestbook_first_met') as string;
    const relationship = formData.get('guestbook_relationship') as string;
    const message = formData.get('guestbook_message') as string;

    // Validate required fields
    if (!fullName || !email) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Generate slug and edit code
    const slug = Math.random().toString(36).substring(2, 12);
    const editCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Prepare CMS payload
    const payload = {
      isArchived: false,
      isDraft: false,
      fieldData: {
        name: fullName,
        slug: slug,
        'first-name': fullName,
        'email-address': email,
        'edit-code': editCode,
        'active': true,
        ...(location && { 'location': location }),
        ...(firstMet && { 'memory': firstMet }),
        ...(relationship && { 'tag-1': relationship }),
        ...(message && { 'guestbook-message': message })
      }
    };

    // Create or update item
    let result;
    if (itemId?.trim()) {
      result = await client.collections.items.updateItem(collectionId, itemId, payload);
    } else {
      result = await client.collections.items.createItem(collectionId, payload);
    }

    // Redirect back with success
    const returnUrl = formData.get('returnUrl') as string || '/guestbook?success=true';
    return redirect(returnUrl);

  } catch (error) {
    console.error('Form submission error:', error);
    const returnUrl = (await request.formData()).get('returnUrl') as string || '/guestbook?error=true';
    return redirect(returnUrl);
  }
};

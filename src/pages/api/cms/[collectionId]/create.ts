/**
 * API Route: Create CMS Item
 * POST /api/cms/[collectionId]/create
 * 
 * Creates a new item in the specified Webflow CMS collection
 */

import type { APIRoute } from 'astro';
import { WebflowClient } from 'webflow-api';

export const POST: APIRoute = async ({ params, request, locals }) => {
  // ✅ USE THE WRITE TOKEN FIRST, FALL BACK TO READ TOKEN
  const token = 
    locals?.runtime?.env?.WEBFLOW_CMS_SITE_API_TOKEN_WRITE || 
    import.meta.env.WEBFLOW_CMS_SITE_API_TOKEN_WRITE ||
    locals?.runtime?.env?.WEBFLOW_CMS_SITE_API_TOKEN || 
    import.meta.env.WEBFLOW_CMS_SITE_API_TOKEN;
  
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Missing WEBFLOW_CMS_SITE_API_TOKEN_WRITE' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const baseUrl = locals?.runtime?.env?.WEBFLOW_API_HOST || import.meta.env.WEBFLOW_API_HOST;
  const client = new WebflowClient({
    accessToken: token,
    ...(baseUrl && { baseUrl })
  });

  const { collectionId } = params;
  
  if (!collectionId) {
    return new Response(
      JSON.stringify({ error: 'Collection ID is required' }), 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse request body
    const body = await request.json();
    
    // Extract optional cmsLocaleId from query params
    const url = new URL(request.url);
    const cmsLocaleId = url.searchParams.get('cmsLocaleId') || undefined;

    // Create the item
    const result = await client.collections.items.createItem(
      collectionId,
      {
        fieldData: body.fieldData,
        isArchived: body.isArchived || false,
        isDraft: body.isDraft || false,
        ...(cmsLocaleId && { cmsLocaleId })
      }
    );

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating CMS item:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create item',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

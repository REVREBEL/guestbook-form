/**
 * API Route: Update CMS Item
 * PATCH /api/cms/[collectionId]/[itemId]
 * 
 * Updates an existing item in the specified Webflow CMS collection
 */

import type { APIRoute } from 'astro';
import { WebflowClient } from 'webflow-api';

export const PATCH: APIRoute = async ({ params, request, locals }) => {
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

  const { collectionId, itemId } = params;
  
  if (!collectionId || !itemId) {
    return new Response(
      JSON.stringify({ error: 'Collection ID and Item ID are required' }), 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse request body
    const body = await request.json();
    
    // Extract optional cmsLocaleId from query params
    const url = new URL(request.url);
    const cmsLocaleId = url.searchParams.get('cmsLocaleId') || undefined;

    // Update the item
    const result = await client.collections.items.updateItem(
      collectionId,
      itemId,
      {
        fieldData: body.fieldData,
        isArchived: body.isArchived,
        isDraft: body.isDraft,
        ...(cmsLocaleId && { cmsLocaleId })
      }
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating CMS item:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to update item',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const GET: APIRoute = async ({ params, locals }) => {
  // ✅ READ operations can use the read token
  const token = 
    locals?.runtime?.env?.WEBFLOW_CMS_SITE_API_TOKEN || 
    import.meta.env.WEBFLOW_CMS_SITE_API_TOKEN;
    
  if (!token) return new Response('Missing token', { status: 500 });

  const baseUrl = locals?.runtime?.env?.WEBFLOW_API_HOST || import.meta.env.WEBFLOW_API_HOST;
  const client = new WebflowClient({
    accessToken: token,
    ...(baseUrl && { baseUrl })
  });
  
  const { collectionId, itemId } = params;

  try {
    const item = await client.collections.items.getItemLive(collectionId!, itemId!);
    return new Response(JSON.stringify(item), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};

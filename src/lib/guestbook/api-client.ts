/**
 * Webflow CMS API Client for Guestbook
 * 
 * This module handles all interactions with the Webflow CMS API for creating
 * and updating guestbook entries.
 * 
 * Environment Variables Required:
 * - WEBFLOW_CMS_SITE_API_TOKEN: Your Webflow CMS API token
 * - WEBFLOW_API_HOST (optional): Custom API host for development
 */

import type { 
  GuestbookFormData, 
  CreateGuestbookResponse, 
  UpdateGuestbookResponse,
  GuestbookCMSItem 
} from './types';
import { slugify, formatDate } from './utils';

/**
 * Maps form data to the Webflow CMS API payload format
 */
function mapFormDataToCMSPayload(data: GuestbookFormData) {
  // Generate slug if not provided
  const slug = data.slug?.trim() || slugify(data.guestbook_name);
  
  // Prepare fieldData object with correct CMS field slugs
  const fieldData: GuestbookCMSItem['fieldData'] = {
    name: data.guestbook_name,
    slug: slug,
  };

  // Add optional custom fields (using CMS field slugs)
  if (data.guestbook_id !== undefined) {
    fieldData['guestbook-id'] = data.guestbook_id;
  }
  
  if (data.full_name) {
    fieldData['first-name'] = data.full_name;
  }
  
  if (data.email) {
    fieldData['email-address'] = data.email;
  }
  
  if (data.profile_image) {
    // For image fields, Webflow expects either a fileId or a URL
    // If it's a URL, we'll store it as-is (this may need adjustment based on your upload strategy)
    fieldData['photo'] = {
      fileId: '', // You may need to upload the image first and get a fileId
      url: data.profile_image,
      alt: data.full_name || 'Profile image'
    };
  }
  
  if (data.guestbook_first_meeting) {
    fieldData['memory'] = data.guestbook_first_meeting;
  }
  
  if (data.guestbook_location) {
    fieldData['location'] = data.guestbook_location;
  }
  
  if (data.guestbook_relationship) {
    fieldData['tag-1'] = data.guestbook_relationship;
  }
  
  if (data.date_added) {
    fieldData['memory-date'] = formatDate(data.date_added);
  }
  
  if (data.guestbook_edit_code) {
    fieldData['guestbook-edit-code'] = data.guestbook_edit_code;
  }
  
  if (data.active !== undefined) {
    fieldData['active'] = data.active;
  }
  
  if (data.edit_code) {
    fieldData['edit-code'] = data.edit_code;
  }

  return {
    isArchived: data.archived || false,
    isDraft: data.draft || false,
    fieldData,
  };
}

/**
 * Creates a new guestbook entry in the Webflow CMS
 */
export async function createGuestbookItem(
  data: GuestbookFormData
): Promise<CreateGuestbookResponse> {
  const payload = mapFormDataToCMSPayload(data);
  
  const url = `/api/cms/${data.collectionId}/create${data.localeId ? `?cmsLocaleId=${data.localeId}` : ''}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create guestbook item: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Updates an existing guestbook entry in the Webflow CMS
 */
export async function updateGuestbookItem(
  data: GuestbookFormData
): Promise<UpdateGuestbookResponse> {
  if (!data.itemId) {
    throw new Error('Item ID is required for updates');
  }

  const payload = mapFormDataToCMSPayload(data);
  
  const url = `/api/cms/${data.collectionId}/${data.itemId}${data.localeId ? `?cmsLocaleId=${data.localeId}` : ''}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update guestbook item: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Creates or updates a guestbook entry based on whether itemId is provided
 */
export async function saveGuestbookItem(
  data: GuestbookFormData
): Promise<CreateGuestbookResponse | UpdateGuestbookResponse> {
  if (data.itemId?.trim()) {
    return updateGuestbookItem(data);
  } else {
    return createGuestbookItem(data);
  }
}

/**
 * Example JSON payloads for reference
 */
export const EXAMPLE_PAYLOADS = {
  create: {
    isArchived: false,
    isDraft: false,
    fieldData: {
      name: 'John Doe',
      slug: 'john-doe',
      'first-name': 'John Doe',
      'email-address': 'john@example.com',
      'memory': 'We met at the wedding',
      'location': 'New York',
      'tag-1': 'Friend',
      'memory-date': '2024-01-15T00:00:00.000Z',
      'active': true,
      'guestbook-edit-code': 'abc123',
    }
  },
  update: {
    isArchived: false,
    isDraft: false,
    fieldData: {
      name: 'John Doe',
      slug: 'john-doe',
      'first-name': 'John Doe Updated',
      'email-address': 'john.updated@example.com',
      'memory': 'We met at the wedding (updated)',
      'location': 'New York',
      'tag-1': 'Best Friend',
      'memory-date': '2024-01-15T00:00:00.000Z',
      'active': true,
    }
  }
};

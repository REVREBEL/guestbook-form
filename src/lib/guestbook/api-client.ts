/**
 * Webflow CMS API Client for Guestbook
 * 
 * FIELD MAPPING (see WEBFLOW-CMS-FIELD-MAPPING-RULES.md):
 * - full_name → name (required) AND first-name (custom)
 * - slug → slug (required, auto-generated 10-digit code)
 * - edit_code → edit-code (auto-generated 6-char code)
 * - active → active (auto-set to true)
 * - email → email-address
 * - guestbook_location → location
 * - guestbook_first_meeting → memory
 * - guestbook_relationship → tag-1
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
import { formatDate } from './utils';

/**
 * Maps form data to the Webflow CMS API payload format
 * Following the strict field mapping rules
 */
function mapFormDataToCMSPayload(data: GuestbookFormData) {
  // Prepare fieldData object with correct CMS field slugs
  const fieldData: GuestbookCMSItem['fieldData'] = {
    // REQUIRED FIELDS
    name: data.full_name, // full_name populates the required "name" field
    slug: data.slug, // Auto-generated 10-digit code
  };

  // CUSTOM FIELDS (one-to-one mapping with hyphen conversion)
  
  // full_name also goes to first-name custom field
  fieldData['first-name'] = data.full_name;
  
  // email → email-address
  if (data.email) {
    fieldData['email-address'] = data.email;
  }
  
  // edit_code → edit-code (auto-generated 6-char code)
  if (data.edit_code) {
    fieldData['edit-code'] = data.edit_code;
  }
  
  // active (auto-set to true on creation)
  if (data.active !== undefined) {
    fieldData['active'] = data.active;
  }
  
  // guestbook_location → location (one-to-one)
  if (data.guestbook_location) {
    fieldData['location'] = data.guestbook_location;
  }
  
  // guestbook_first_meeting → memory (one-to-one)
  if (data.guestbook_first_meeting) {
    fieldData['memory'] = data.guestbook_first_meeting;
  }
  
  // guestbook_relationship → tag-1 (one-to-one)
  if (data.guestbook_relationship) {
    fieldData['tag-1'] = data.guestbook_relationship;
  }
  
  // Optional numeric field
  if (data.guestbook_id !== undefined) {
    fieldData['guestbook-id'] = data.guestbook_id;
  }
  
  // Image field
  if (data.profile_image) {
    fieldData['photo'] = {
      fileId: '',
      url: data.profile_image,
      alt: data.full_name || 'Profile image'
    };
  }
  
  // Date field
  if (data.date_added) {
    fieldData['memory-date'] = formatDate(data.date_added);
  }
  
  // Legacy edit code field (if exists)
  if (data.guestbook_edit_code) {
    fieldData['guestbook-edit-code'] = data.guestbook_edit_code;
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
      // Required fields
      name: 'John Doe', // from full_name
      slug: 'a1b2c3d4e5', // auto-generated 10-digit code
      
      // Custom fields
      'first-name': 'John Doe', // from full_name
      'email-address': 'john@example.com', // from email
      'edit-code': 'Xy9K2m', // auto-generated 6-char code
      'active': true, // auto-set
      'memory': 'We met at the wedding', // from guestbook_first_meeting
      'location': 'New York', // from guestbook_location
      'tag-1': 'Friend', // from guestbook_relationship
      'memory-date': '2024-01-15T00:00:00.000Z', // from date_added
    }
  },
  update: {
    isArchived: false,
    isDraft: false,
    fieldData: {
      name: 'John Doe Updated',
      slug: 'a1b2c3d4e5', // unchanged
      'first-name': 'John Doe Updated',
      'email-address': 'john.updated@example.com',
      'edit-code': 'Xy9K2m', // unchanged
      'active': true,
      'memory': 'We met at the wedding (updated)',
      'location': 'New York',
      'tag-1': 'Best Friend',
      'memory-date': '2024-01-15T00:00:00.000Z',
    }
  }
};

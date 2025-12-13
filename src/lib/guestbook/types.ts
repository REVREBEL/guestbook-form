/**
 * Guestbook CMS Types
 * 
 * Based on the Webflow CMS Guestbook collection schema
 */

export interface GuestbookFormData {
  // System/meta fields (top-level)
  guestbook_name: string; // CMS Name field (required)
  slug?: string; // CMS slug (auto-generated if empty)
  collectionId: string; // The CMS collection ID
  localeId?: string; // Locale ID (optional)
  itemId?: string; // If present, update; else create
  archived?: boolean;
  draft?: boolean;
  
  // Custom fields (CMS fieldData)
  guestbook_id?: number;
  full_name: string;
  email: string;
  profile_image?: string; // Image URL
  guestbook_first_meeting?: string;
  guestbook_location?: string;
  guestbook_relationship?: string;
  date_added?: string; // ISO 8601 date string
  guestbook_edit_code?: string;
  active?: boolean;
  edit_code?: string;
}

export interface GuestbookCMSItem {
  id: string;
  cmsLocaleId?: string;
  lastPublished?: string;
  lastUpdated?: string;
  createdOn?: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: {
    name: string; // guestbook_name
    slug: string;
    'guestbook-id'?: number;
    'first-name'?: string; // full_name
    'email-address'?: string; // email
    'photo'?: {
      fileId: string;
      url: string;
      alt?: string | null;
    };
    'memory'?: string; // guestbook_first_meeting
    'location'?: string; // guestbook_location
    'tag-1'?: string; // guestbook_relationship
    'memory-date'?: string; // date_added
    'guestbook-edit-code'?: string;
    'active'?: boolean;
    'edit-code'?: string;
  };
}

export interface CreateGuestbookResponse {
  id: string;
  cmsLocaleId?: string;
  lastPublished?: string | null;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: GuestbookCMSItem['fieldData'];
}

export interface UpdateGuestbookResponse extends CreateGuestbookResponse {}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  data?: CreateGuestbookResponse | UpdateGuestbookResponse;
  errors?: ValidationError[];
}

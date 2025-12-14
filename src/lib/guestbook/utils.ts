/**
 * Utility functions for Guestbook form handling
 * 
 * FIELD MAPPING RULES (see WEBFLOW-CMS-FIELD-MAPPING-RULES.md):
 * - full_name → name (required CMS field) AND first-name (custom field)
 * - slug → auto-generated 10-digit alphanumeric code
 * - edit_code → auto-generated 6-character alphanumeric code
 * - active → auto-set to true on creation
 * - All other underscores → hyphens in CMS field slugs
 */

import type { GuestbookFormData, ValidationError } from './types';

/**
 * Generates a random alphanumeric code
 * @param length - Length of the code to generate
 * @param caseSensitive - If false, only uses lowercase letters
 */
export function generateRandomCode(length: number, caseSensitive: boolean = false): string {
  const chars = caseSensitive 
    ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    : 'abcdefghijklmnopqrstuvwxyz0123456789';
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a URL-safe slug (10-digit alphanumeric code)
 * NOTE: This is NOT derived from text - it's a random identifier
 */
export function generateSlug(): string {
  return generateRandomCode(10, false); // lowercase + numbers only
}

/**
 * Generates a 6-character edit code
 */
export function generateEditCode(): string {
  return generateRandomCode(6, true); // case-sensitive alphanumeric
}

/**
 * Parses a boolean value from various input types
 */
export function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on';
  }
  if (typeof value === 'number') return value !== 0;
  return false;
}

/**
 * Formats a date to ISO 8601 string
 * If no date provided, returns current timestamp
 */
export function formatDate(date?: string | Date): string {
  if (!date) return new Date().toISOString();
  if (date instanceof Date) return date.toISOString();
  
  // Try to parse string date
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
}

/**
 * Validates required fields in the form data
 * Checks against CMS collection constraints
 */
export function validateGuestbookForm(data: Partial<GuestbookFormData>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Collection ID required
  if (!data.collectionId?.trim()) {
    errors.push({ field: 'collectionId', message: 'Collection ID is required' });
  }

  // Full name required and max 256 chars (CMS constraint)
  if (!data.full_name?.trim()) {
    errors.push({ field: 'full_name', message: 'Full name is required' });
  } else if (data.full_name.length > 256) {
    errors.push({ 
      field: 'full_name', 
      message: 'Full name must be less than 256 characters' 
    });
  }

  // Email required and valid format
  if (!data.email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Email is not valid' });
  }

  return errors;
}

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Extracts form data from a FormData object or form element
 * Auto-generates required fields for new items
 */
export function extractFormData(formElement: HTMLFormElement): Partial<GuestbookFormData> {
  const formData = new FormData(formElement);
  
  // Get values
  const fullName = formData.get('full_name')?.toString() || '';
  const itemId = formData.get('Item ID')?.toString() || formData.get('itemId')?.toString() || undefined;
  const isNewItem = !itemId;
  
  const data: Partial<GuestbookFormData> = {
    // System/meta fields
    collectionId: formData.get('collection_id')?.toString() || formData.get('collectionId')?.toString() || '',
    localeId: formData.get('Locale ID')?.toString() || formData.get('localeId')?.toString() || undefined,
    itemId: itemId,
    archived: parseBoolean(formData.get('Archived') || formData.get('archived')),
    draft: parseBoolean(formData.get('Draft') || formData.get('draft')),
    
    // Core fields
    guestbook_name: fullName, // This becomes the CMS "name" field
    full_name: fullName, // This becomes "first-name" custom field
    email: formData.get('email')?.toString() || '',
    
    // Auto-generated fields (only for new items)
    slug: isNewItem ? generateSlug() : (formData.get('slug')?.toString() || ''),
    edit_code: isNewItem ? generateEditCode() : (formData.get('edit_code')?.toString() || formData.get('edit-code')?.toString() || ''),
    active: isNewItem ? true : parseBoolean(formData.get('active')),
    
    // Optional custom fields
    guestbook_id: formData.get('guestbook_id') ? parseInt(formData.get('guestbook_id')!.toString(), 10) : undefined,
    profile_image: formData.get('profile_image')?.toString() || undefined,
    guestbook_first_meeting: formData.get('guestbook_first_met')?.toString() || formData.get('guestbook_first_meeting')?.toString() || undefined,
    guestbook_location: formData.get('guestbook_location')?.toString() || undefined,
    guestbook_relationship: formData.get('guestbook_relationship')?.toString() || undefined,
    date_added: formData.get('date_added')?.toString() || undefined,
    guestbook_edit_code: formData.get('guestbook_edit_code')?.toString() || undefined,
  };
  
  return data;
}

/**
 * Reads all form values directly from input elements by ID or name
 * This is useful when FormData doesn't work properly with Webflow components
 */
export function readFormValuesByIds(formElement: HTMLFormElement): Partial<GuestbookFormData> {
  const getValue = (id: string, name?: string): string => {
    // Try by ID first
    let element = formElement.querySelector(`#${id}`) as HTMLInputElement | HTMLTextAreaElement | null;
    
    // If not found and name provided, try by name
    if (!element && name) {
      element = formElement.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
    }
    
    return element?.value || '';
  };

  const getCheckboxValue = (id: string): boolean => {
    const element = formElement.querySelector(`#${id}`) as HTMLInputElement | null;
    return element?.checked || false;
  };

  // Get values
  const fullName = getValue('full_name', 'full_name');
  const itemId = getValue('Item ID', 'itemId') || getValue('itemId') || undefined;
  const isNewItem = !itemId;

  const data: Partial<GuestbookFormData> = {
    // System/meta fields
    collectionId: getValue('collection_id', 'collection_id') || getValue('Collection ID') || getValue('collectionId'),
    localeId: getValue('Locale ID', 'localeId') || undefined,
    itemId: itemId,
    archived: getCheckboxValue('Archived') || getCheckboxValue('archived'),
    draft: getCheckboxValue('Draft') || getCheckboxValue('draft'),
    
    // Core fields
    guestbook_name: fullName, // This becomes the CMS "name" field
    full_name: fullName, // This becomes "first-name" custom field
    email: getValue('email', 'email'),
    
    // Auto-generated fields (only for new items)
    slug: isNewItem ? generateSlug() : (getValue('slug', 'slug') || ''),
    edit_code: isNewItem ? generateEditCode() : (getValue('edit-code', 'edit_code') || getValue('edit_code') || ''),
    active: isNewItem ? true : getCheckboxValue('active'),
    
    // Optional custom fields
    guestbook_id: getValue('guestbook_id', 'guestbook_id') ? parseInt(getValue('guestbook_id', 'guestbook_id'), 10) : undefined,
    profile_image: getValue('profile_image', 'profile_image') || undefined,
    guestbook_first_meeting: getValue('guestbook_first_met', 'guestbook_first_met') || getValue('guestbook_first_meeting', 'guestbook_first_meeting') || undefined,
    guestbook_location: getValue('guestbook_location', 'guestbook_location') || undefined,
    guestbook_relationship: getValue('guestbook_relationship', 'guestbook_relationship') || undefined,
    date_added: getValue('date_added', 'date_added') || undefined,
    guestbook_edit_code: getValue('guestbook_edit_code', 'guestbook_edit_code') || undefined,
  };
  
  return data;
}

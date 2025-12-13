/**
 * Utility functions for Guestbook form handling
 */

import type { GuestbookFormData, ValidationError } from './types';

/**
 * Generates a URL-safe slug from a string
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
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
 */
export function validateGuestbookForm(data: Partial<GuestbookFormData>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.guestbook_name?.trim()) {
    errors.push({ field: 'guestbook_name', message: 'Name is required' });
  }

  if (!data.collectionId?.trim()) {
    errors.push({ field: 'collectionId', message: 'Collection ID is required' });
  }

  if (!data.full_name?.trim()) {
    errors.push({ field: 'full_name', message: 'Full name is required' });
  }

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
 */
export function extractFormData(formElement: HTMLFormElement): Partial<GuestbookFormData> {
  const formData = new FormData(formElement);
  
  return {
    // System/meta fields
    guestbook_name: formData.get('guestbook_name')?.toString() || '',
    slug: formData.get('slug')?.toString() || '',
    collectionId: formData.get('Collection ID')?.toString() || formData.get('collectionId')?.toString() || '',
    localeId: formData.get('Locale ID')?.toString() || formData.get('localeId')?.toString() || undefined,
    itemId: formData.get('Item ID')?.toString() || formData.get('itemId')?.toString() || undefined,
    archived: parseBoolean(formData.get('Archived') || formData.get('archived')),
    draft: parseBoolean(formData.get('Draft') || formData.get('draft')),
    
    // Custom fields
    guestbook_id: formData.get('guestbook_id') ? parseInt(formData.get('guestbook_id')!.toString(), 10) : undefined,
    full_name: formData.get('full_name')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    profile_image: formData.get('profile_image')?.toString() || undefined,
    guestbook_first_meeting: formData.get('guestbook_first_meeting')?.toString() || undefined,
    guestbook_location: formData.get('guestbook_location')?.toString() || undefined,
    guestbook_relationship: formData.get('guestbook_relationship')?.toString() || undefined,
    date_added: formData.get('date_added')?.toString() || undefined,
    guestbook_edit_code: formData.get('guestbook_edit_code')?.toString() || undefined,
    active: parseBoolean(formData.get('active')),
    edit_code: formData.get('edit-code')?.toString() || formData.get('edit_code')?.toString() || undefined,
  };
}

/**
 * Reads all form values directly from input elements by ID
 * This is useful when FormData doesn't work properly with Webflow components
 */
export function readFormValuesByIds(formElement: HTMLFormElement): Partial<GuestbookFormData> {
  const getValue = (id: string): string => {
    const element = formElement.querySelector(`#${id}`) as HTMLInputElement | HTMLTextAreaElement | null;
    return element?.value || '';
  };

  const getCheckboxValue = (id: string): boolean => {
    const element = formElement.querySelector(`#${id}`) as HTMLInputElement | null;
    return element?.checked || false;
  };

  return {
    // System/meta fields
    guestbook_name: getValue('guestbook_name'),
    slug: getValue('slug'),
    collectionId: getValue('Collection ID') || getValue('collectionId'),
    localeId: getValue('Locale ID') || getValue('localeId') || undefined,
    itemId: getValue('Item ID') || getValue('itemId') || undefined,
    archived: getCheckboxValue('Archived') || getCheckboxValue('archived'),
    draft: getCheckboxValue('Draft') || getCheckboxValue('draft'),
    
    // Custom fields
    guestbook_id: getValue('guestbook_id') ? parseInt(getValue('guestbook_id'), 10) : undefined,
    full_name: getValue('full_name'),
    email: getValue('email'),
    profile_image: getValue('profile_image') || undefined,
    guestbook_first_meeting: getValue('guestbook_first_meeting') || undefined,
    guestbook_location: getValue('guestbook_location') || undefined,
    guestbook_relationship: getValue('guestbook_relationship') || undefined,
    date_added: getValue('date_added') || undefined,
    guestbook_edit_code: getValue('guestbook_edit_code') || undefined,
    active: getCheckboxValue('active'),
    edit_code: getValue('edit-code') || getValue('edit_code') || undefined,
  };
}

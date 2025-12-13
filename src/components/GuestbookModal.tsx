/**
 * Guestbook Modal Component
 * 
 * A simple dialog container for the Webflow-generated GuestbookForm component.
 * The form is fully styled by Webflow, so this is just a minimal wrapper.
 */

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { DevLinkProvider } from '../site-components/DevLinkProvider';
import { GuestbookForm } from '../site-components/GuestbookForm';
import { saveGuestbookItem } from '../lib/guestbook/api-client';
import { validateGuestbookForm, extractFormData, readFormValuesByIds } from '../lib/guestbook/utils';
import type { FormStatus } from '../lib/guestbook/types';

interface GuestbookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId?: string;
  localeId?: string;
  itemId?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function GuestbookModal({
  open,
  onOpenChange,
  collectionId,
  localeId,
  itemId,
  onSuccess,
  onError
}: GuestbookModalProps) {
  const [status, setStatus] = useState<FormStatus>({ type: 'idle' });
  const formRef = useRef<HTMLFormElement | null>(null);
  
  // Use env var as fallback
  const finalCollectionId = collectionId || import.meta.env.GUESTBOOK_COLLECTION_ID || '69383a09bbf502930bf620a3';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    formRef.current = form;
    
    setStatus({ type: 'loading', message: 'Submitting...' });

    try {
      // Extract form data - try both methods
      let formData = extractFormData(form);
      
      // If extractFormData didn't work well, try reading by IDs
      if (!formData.full_name || !formData.email) {
        formData = readFormValuesByIds(form);
      }
      
      // Set collection ID and locale ID from props if not in form
      formData.collectionId = formData.collectionId || finalCollectionId;
      formData.localeId = formData.localeId || localeId;
      formData.itemId = formData.itemId || itemId;

      // Validate form data
      const errors = validateGuestbookForm(formData);
      if (errors.length > 0) {
        setStatus({
          type: 'error',
          message: 'Please fix the following errors:',
          errors
        });
        return;
      }

      // Submit to API
      const result = await saveGuestbookItem(formData as any);

      setStatus({
        type: 'success',
        message: itemId ? 'Guestbook entry updated successfully!' : 'Guestbook entry created successfully!',
        data: result
      });

      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      // Optionally close modal after success
      setTimeout(() => {
        onOpenChange(false);
        setStatus({ type: 'idle' });
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setStatus({
        type: 'error',
        message: errorMessage
      });
      
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-auto h-auto p-0 border-0 bg-transparent shadow-none">
        <DialogTitle className="sr-only">
          {itemId ? 'Edit Guestbook Entry' : 'Add Guestbook Entry'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Fill out the form to {itemId ? 'update your' : 'add a new'} guestbook entry
        </DialogDescription>
        
        <DevLinkProvider>
          {/* Hidden fields for system data */}
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="collectionId" value={finalCollectionId} />
            {localeId && <input type="hidden" name="localeId" value={localeId} />}
            {itemId && <input type="hidden" name="itemId" value={itemId} />}
            
            <GuestbookForm
              guestbookCollectionIdCollectionIdVariable={finalCollectionId}
              formComponentRuntimeProps={{
                onSubmit: handleSubmit as any
              }}
              buttonRuntimeProps={{
                disabled: status.type === 'loading'
              }}
              buttonLabelText={
                status.type === 'loading' 
                  ? 'Submitting...' 
                  : (itemId ? 'Update Entry' : 'Submit Entry')
              }
              userMessagesSuccessMessageText={
                status.type === 'success' ? status.message : undefined
              }
              userMessagesErrorMessageText={
                status.type === 'error' ? status.message : undefined
              }
            />
          </form>
        </DevLinkProvider>
      </DialogContent>
    </Dialog>
  );
}

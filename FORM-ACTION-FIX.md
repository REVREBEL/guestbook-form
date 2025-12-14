/**
 * Guestbook Modal Component
 * 
 * IMPORTANT: This component intercepts the Webflow form submission
 * and handles it with JavaScript. If you want native form submission,
 * use the guestbook-native.astro page instead.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { DevLinkProvider } from '../site-components/DevLinkProvider';
import { GuestbookForm } from '../site-components/GuestbookForm';
import { baseUrl } from '../lib/base-url';

interface GuestbookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId?: string;
  itemId?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function GuestbookModal({
  open,
  onOpenChange,
  collectionId,
  itemId,
  onSuccess,
  onError
}: GuestbookModalProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const formRef = useRef<HTMLFormElement | null>(null);
  
  const finalCollectionId = collectionId || '69383a09bbf502930bf620a3';

  useEffect(() => {
    if (!open) return;

    // Find the Webflow-generated form
    const form = document.getElementById('wf-form-Guestbook-Form') as HTMLFormElement;
    if (!form) {
      console.error('Form not found: wf-form-Guestbook-Form');
      return;
    }

    formRef.current = form;

    // CRITICAL: Override form attributes to prevent default behavior
    form.method = 'post';
    form.action = `${baseUrl}/api/guestbook`;
    
    // Remove any existing action handlers
    form.onsubmit = null;

    console.log('Form configured:', {
      id: form.id,
      method: form.method,
      action: form.action,
      baseUrl: baseUrl
    });

    const handleSubmit = async (e: SubmitEvent) => {
      console.log('Form submit intercepted');
      e.preventDefault();
      e.stopPropagation();
      
      setStatus('loading');
      setMessage('Submitting...');

      try {
        // Get form data
        const formData = new FormData(form);
        
        // Add collection ID
        formData.append('collection_id', finalCollectionId);
        
        // If updating, add item ID
        if (itemId) {
          formData.append('item_id', itemId);
        }

        // Log form data for debugging
        console.log('Form data:', Object.fromEntries(formData.entries()));

        // Submit to API
        const response = await fetch(`${baseUrl}/api/guestbook`, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Submission failed');
        }

        setStatus('success');
        setMessage(itemId ? 'Entry updated successfully!' : 'Entry created successfully!');

        if (onSuccess) {
          onSuccess(result);
        }

        // Close modal after 2 seconds
        setTimeout(() => {
          onOpenChange(false);
          setStatus('idle');
          setMessage('');
          form.reset();
        }, 2000);

      } catch (error) {
        console.error('Submission error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        
        setStatus('error');
        setMessage(errorMessage);
        
        if (onError && error instanceof Error) {
          onError(error);
        }
      }
    };

    // Attach submit handler
    form.addEventListener('submit', handleSubmit as EventListener);

    // Cleanup
    return () => {
      form.removeEventListener('submit', handleSubmit as EventListener);
    };
  }, [open, finalCollectionId, itemId, onSuccess, onError, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          {itemId ? 'Edit Guestbook Entry' : 'Add Guestbook Entry'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Fill out the form to {itemId ? 'update your' : 'add a new'} guestbook entry
        </DialogDescription>
        
        {/* Status Messages */}
        {status !== 'idle' && (
          <div className={`p-4 rounded-lg mb-4 ${
            status === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
            status === 'error' ? 'bg-red-100 text-red-800 border border-red-300' :
            'bg-blue-100 text-blue-800 border border-blue-300'
          }`}>
            <p className="font-medium">{message}</p>
          </div>
        )}
        
        <DevLinkProvider>
          <div className="guestbook-form-wrapper">
            <GuestbookForm
              guestbookCollectionIdCollectionIdVariable={finalCollectionId}
              buttonLabelText={
                status === 'loading' 
                  ? 'Submitting...' 
                  : (itemId ? 'Update Entry' : 'Sign Guestbook')
              }
              buttonRuntimeProps={{
                disabled: status === 'loading'
              }}
            />
          </div>
        </DevLinkProvider>

        <style>{`
          /* Fix for missing labels */
          .guestbook-form-wrapper label {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            margin-bottom: 8px;
          }

          /* Prevent blue color on completed fields */
          .guestbook-form-wrapper input:valid,
          .guestbook-form-wrapper textarea:valid,
          .guestbook-form-wrapper select:valid {
            color: inherit !important;
            border-color: var(--input) !important;
          }

          /* Fix dropdown behavior - prevent bumping */
          .guestbook-form-wrapper select {
            position: relative !important;
            z-index: 1 !important;
          }

          .guestbook-form-wrapper select:focus {
            z-index: 10 !important;
          }

          /* Ensure dropdown options are visible */
          .guestbook-form-wrapper select option {
            background-color: var(--background) !important;
            color: var(--foreground) !important;
            padding: 8px !important;
          }

          /* Fix for htmlFor="Phone" label issue */
          .guestbook-form-wrapper label[for="Phone"] {
            display: block !important;
          }

          /* Reset Webflow form success/error messages */
          .w-form-done,
          .w-form-fail {
            display: none !important;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}

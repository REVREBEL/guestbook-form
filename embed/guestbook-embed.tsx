/**
 * Guestbook External Embed Entry Point
 * 
 * This file provides a mount function that can be used to embed the Guestbook button
 * on external pages (outside the Webflow Cloud app).
 * 
 * Usage:
 * 
 * 1. Build this file and bundle it for external use
 * 2. Include the bundled script on your external page
 * 3. Call the mount function:
 * 
 * ```html
 * <div id="guestbook-button"></div>
 * <script>
 *   mountGuestbookButton(document.getElementById('guestbook-button'), {
 *     buttonText: 'Sign Our Guestbook',
 *     collectionId: 'your-collection-id', // Optional if GUESTBOOK_COLLECTION_ID is set
 *     baseUrl: 'https://your-site.webflow.io/guestbook-form', // Important: set your deployed app URL
 *     onSuccess: (data) => console.log('Entry created:', data),
 *     onError: (error) => console.error('Error:', error)
 *   });
 * </script>
 * ```
 * 
 * IMPORTANT: When calling API endpoints from external pages, you MUST include the
 * baseUrl that points to your deployed Webflow Cloud app.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { DevLinkProvider } from '../src/site-components/DevLinkProvider';
import { GuestbookFormButton } from '../src/site-components/GuestbookFormButton';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../src/components/ui/dialog';
import { GuestbookForm } from '../src/site-components/GuestbookForm';
import { saveGuestbookItem } from '../src/lib/guestbook/api-client';
import { validateGuestbookForm, extractFormData, readFormValuesByIds } from '../src/lib/guestbook/utils';
import type { FormStatus } from '../src/lib/guestbook/types';

// Import styles - these need to be bundled with the embed
import '../src/site-components/global.css';
import '../generated/webflow.css';
import '../src/styles/global.css';

interface MountProps {
  buttonText?: string;
  collectionId?: string;
  localeId?: string;
  itemId?: string;
  baseUrl?: string; // Required for external embeds - the deployed app URL
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Wrapper component that manages the button and modal state
 */
function GuestbookEmbed({
  buttonText = 'Sign Guestbook',
  collectionId,
  localeId,
  itemId,
  baseUrl = '', // Default to empty, but should be set for external use
  onSuccess,
  onError
}: MountProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [status, setStatus] = React.useState<FormStatus>({ type: 'idle' });
  const formRef = React.useRef<HTMLFormElement | null>(null);
  
  // Use env var as fallback
  const finalCollectionId = collectionId || import.meta.env.GUESTBOOK_COLLECTION_ID || '69383a09bbf502930bf620a3';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    formRef.current = form;
    
    setStatus({ type: 'loading', message: 'Submitting...' });

    try {
      // Extract form data
      let formData = extractFormData(form);
      
      // Try reading by IDs if extraction didn't work
      if (!formData.full_name || !formData.email) {
        formData = readFormValuesByIds(form);
      }
      
      // Set props
      formData.collectionId = formData.collectionId || finalCollectionId;
      formData.localeId = formData.localeId || localeId;
      formData.itemId = formData.itemId || itemId;

      // Validate
      const errors = validateGuestbookForm(formData);
      if (errors.length > 0) {
        setStatus({
          type: 'error',
          message: 'Please fix the following errors:',
          errors
        });
        return;
      }

      // IMPORTANT: For external embeds, we need to prepend the baseUrl to API calls
      // This is handled by overriding the fetch function temporarily
      const originalFetch = window.fetch;
      if (baseUrl) {
        window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
          const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
          const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : url;
          return originalFetch(fullUrl, init);
        };
      }

      try {
        // Submit to API
        const result = await saveGuestbookItem(formData as any);

        setStatus({
          type: 'success',
          message: itemId ? 'Entry updated successfully!' : 'Entry created successfully!',
          data: result
        });

        if (onSuccess) {
          onSuccess(result);
        }

        setTimeout(() => {
          setIsModalOpen(false);
          setStatus({ type: 'idle' });
        }, 2000);

      } finally {
        // Restore original fetch
        if (baseUrl) {
          window.fetch = originalFetch;
        }
      }

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
    <DevLinkProvider>
      <div>
        <GuestbookFormButton
          buttonLabelText={buttonText}
          buttonRuntimeProps={{
            onClick: handleClick
          }}
        />
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-none w-auto h-auto p-0 border-0 bg-transparent shadow-none">
            <DialogTitle className="sr-only">
              {itemId ? 'Edit Guestbook Entry' : 'Add Guestbook Entry'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Fill out the form to {itemId ? 'update your' : 'add a new'} guestbook entry
            </DialogDescription>
            
            {/* Form */}
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
          </DialogContent>
        </Dialog>
      </div>
    </DevLinkProvider>
  );
}

/**
 * Mount function to render the Guestbook button into a DOM element
 * 
 * @param element - The DOM element to render into
 * @param props - Configuration props for the embed
 * 
 * @example
 * ```js
 * mountGuestbookButton(document.getElementById('guestbook'), {
 *   buttonText: 'Sign Guestbook',
 *   collectionId: 'your-collection-id', // Optional if env var is set
 *   baseUrl: 'https://patricia-lanning.webflow.io/guestbook-form',
 *   onSuccess: (data) => console.log('Created:', data)
 * });
 * ```
 */
export function mountGuestbookButton(element: HTMLElement, props: MountProps = {}) {
  if (!element) {
    console.error('mountGuestbookButton: Invalid element provided');
    return;
  }

  // Warn if baseUrl is not set for external embeds
  if (!props.baseUrl && window.location.origin !== element.ownerDocument.location.origin) {
    console.warn(
      'mountGuestbookButton: baseUrl is not set. API calls may fail on external pages. ' +
      'Please provide the full URL to your deployed Webflow Cloud app.'
    );
  }

  const root = createRoot(element);
  root.render(<GuestbookEmbed {...props} />);
  
  return {
    unmount: () => root.unmount(),
    updateProps: (newProps: Partial<MountProps>) => {
      root.render(<GuestbookEmbed {...props} {...newProps} />);
    }
  };
}

// Make it available globally for script tag usage
if (typeof window !== 'undefined') {
  (window as any).mountGuestbookButton = mountGuestbookButton;
}

export default mountGuestbookButton;

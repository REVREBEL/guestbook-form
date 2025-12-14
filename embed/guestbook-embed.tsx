/**
 * Guestbook External Embed Entry Point
 * 
 * This file provides a mount function that can be used to embed the Guestbook button
 * on external pages (outside the Webflow Cloud app).
 * 
 * Usage:
 * 
 * 1. Build this file and bundle it for external use: npm run build:embed
 * 2. Deploy your app to Webflow Cloud
 * 3. Add custom code embed to your Webflow page:
 * 
 * ```html
 * <div id="guestbook-button"></div>
 * <script src="https://your-site.webflow.io/your-app/guestbook-embed.iife.js"></script>
 * ```
 * 
 * All configuration (collection ID, base URL) is read from environment variables at build time.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { DevLinkProvider } from '../src/site-components/DevLinkProvider';
import { GuestbookFormButton } from '../src/site-components/GuestbookFormButton';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { GuestbookForm } from '../src/site-components/GuestbookForm';
import { saveGuestbookItem } from '../src/lib/guestbook/api-client';
import { validateGuestbookForm, extractFormData, readFormValuesByIds } from '../src/lib/guestbook/utils';
import type { FormStatus } from '../src/lib/guestbook/types';
import { XIcon } from 'lucide-react';
import { cn } from '../src/lib/utils';

/**
 * ⚠️ DO NOT IMPORT CSS FILES HERE!
 * 
 * The Devlink components (GuestbookForm, GuestbookFormButton, etc.) already
 * include their own CSS through src/site-components/global.css.
 * 
 * Importing CSS again causes:
 * - Style duplication
 * - Rendering issues  
 * - Form layout problems
 * 
 * The commented lines below are intentionally disabled:
 */
//import '../src/site-components/global.css';
//import '../generated/webflow.css';
//import '../src/styles/global.css';

// Read environment variables at build time
const DEFAULT_COLLECTION_ID = import.meta.env.GUESTBOOK_COLLECTION_ID || '69383a09bbf502930bf620a3';
const DEFAULT_BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

interface MountProps {
  buttonText?: string;
  collectionId?: string;
  localeId?: string;
  itemId?: string;
  baseUrl?: string; // Optional override - uses env var by default
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
  baseUrl,
  onSuccess,
  onError
}: MountProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [status, setStatus] = React.useState<FormStatus>({ type: 'idle' });
  const formRef = React.useRef<HTMLFormElement | null>(null);
  
  // Use provided values or fall back to env defaults
  const finalCollectionId = collectionId || DEFAULT_COLLECTION_ID;
  const finalBaseUrl = baseUrl || DEFAULT_BASE_URL;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Button clicked, opening modal...');
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    console.log('Modal open state changed:', isModalOpen);
  }, [isModalOpen]);

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

      // For external embeds, we need to prepend the baseUrl to API calls
      const originalFetch = window.fetch;
      if (finalBaseUrl) {
        window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
          const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
          const fullUrl = url.startsWith('/') ? `${finalBaseUrl}${url}` : url;
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
        if (finalBaseUrl) {
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
      {/* Button container - isolated and doesn't affect page */}
      <div style={{ display: 'inline-block', width: 'auto' }}>
        <GuestbookFormButton
          buttonLabelText={buttonText}
          buttonRuntimeProps={{
            onClick: handleClick
          }}
        />
      </div>
        
      {/* Dialog Portal - renders directly to body, completely isolated */}
      {isModalOpen && (
        <DialogPrimitive.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogPrimitive.Portal container={document.body}>
            {/* Overlay */}
            <DialogPrimitive.Overlay
              data-guestbook-overlay
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 999999,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                animation: 'fadeIn 200ms ease-out'
              }}
            />
            
            {/* Content */}
            <DialogPrimitive.Content
              data-guestbook-content
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999999,
                maxWidth: 'calc(100% - 2rem)',
                animation: 'zoomIn 200ms ease-out',
                isolation: 'isolate'
              }}
            >
              {/* Hidden accessibility titles */}
              <DialogPrimitive.Title style={{ display: 'none' }}>
                {itemId ? 'Edit Guestbook Entry' : 'Add Guestbook Entry'}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description style={{ display: 'none' }}>
                Fill out the form to {itemId ? 'update your' : 'add a new'} guestbook entry
              </DialogPrimitive.Description>
              
              {/* Form with wrapper that neutralizes the component's outer styles */}
              <div 
                data-guestbook-form-wrapper
                style={{
                  width: 'auto',
                  maxWidth: 'none',
                  margin: 0,
                  padding: 0,
                  isolation: 'isolate'
                }}
              >
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
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      )}
    </DevLinkProvider>
  );
}

/**
 * Mount function to render the Guestbook button into a DOM element
 * 
 * @param element - The DOM element to render into
 * @param props - Optional configuration props (overrides env defaults)
 * 
 * @example
 * ```js
 * // Minimal usage (uses env variables)
 * mountGuestbookButton(document.getElementById('guestbook'));
 * 
 * // With custom options
 * mountGuestbookButton(document.getElementById('guestbook'), {
 *   buttonText: 'Sign Guestbook',
 *   onSuccess: (data) => console.log('Created:', data)
 * });
 * ```
 */
export function mountGuestbookButton(element: HTMLElement, props: MountProps = {}) {
  if (!element) {
    console.error('mountGuestbookButton: Invalid element provided');
    return;
  }

  console.log('Mounting guestbook button with config:', {
    collectionId: props.collectionId || DEFAULT_COLLECTION_ID,
    baseUrl: props.baseUrl || DEFAULT_BASE_URL
  });

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
  (window as any).GuestbookEmbed = {
    mountGuestbookButton,
    // Export the defaults for debugging
    DEFAULT_COLLECTION_ID,
    DEFAULT_BASE_URL
  };
  
  // Add CSS for animations and layout resets
  if (!document.getElementById('guestbook-embed-styles')) {
    const style = document.createElement('style');
    style.id = 'guestbook-embed-styles';
    style.textContent = `
      /* Animations */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes zoomIn {
        from { 
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.95);
        }
        to { 
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
      
      /* Ensure button container doesn't affect page layout */
      #guestbook-button-container {
        display: inline-block !important;
        width: auto !important;
        max-width: none !important;
        margin: 0 !important;
      }
      
      /* Reset styles for the guestbook form wrapper elements inside modal ONLY */
      [data-guestbook-content] .component_section-guestbook-form,
      [data-guestbook-overlay] ~ * .component_section-guestbook-form {
        all: unset !important;
        display: block !important;
        width: auto !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      [data-guestbook-content] .guestbook_form-padding {
        width: auto !important;
        max-width: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      
      [data-guestbook-content] .guestbook_inner-form-container {
        width: auto !important;
        max-width: none !important;
        margin: 0 !important;
      }
      
      /* Ensure modal doesn't affect body or page elements */
      body:has([data-guestbook-overlay]) {
        overflow: hidden !important;
      }
      
      /* Isolate all modal elements */
      [data-guestbook-overlay],
      [data-guestbook-content] {
        contain: layout style paint !important;
      }
    `;
    document.head.appendChild(style);
  }
}

export default mountGuestbookButton;

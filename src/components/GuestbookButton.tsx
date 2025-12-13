/**
 * Guestbook Button Component
 * 
 * A clickable button that opens the Guestbook modal when clicked.
 * Uses the Webflow-generated GuestbookFormButton component for styling.
 */

import React, { useState } from 'react';
import { DevLinkProvider } from '../site-components/DevLinkProvider';
import { GuestbookFormButton } from '../site-components/GuestbookFormButton';
import { GuestbookModal } from './GuestbookModal';

interface GuestbookButtonProps {
  buttonText?: string;
  collectionId?: string;
  localeId?: string;
  itemId?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function GuestbookButton({
  buttonText = 'Sign Guestbook',
  collectionId, // Will use env var as fallback in modal
  localeId,
  itemId,
  onSuccess,
  onError
}: GuestbookButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
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
        
        <GuestbookModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          collectionId={collectionId}
          localeId={localeId}
          itemId={itemId}
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>
    </DevLinkProvider>
  );
}

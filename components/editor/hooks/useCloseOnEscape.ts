'use client';

import { useEffect } from 'react';

interface UseCloseOnEscapeOptions {
  isOpen: boolean;
  onClose: () => void;
}

export function useCloseOnEscape({ isOpen, onClose }: UseCloseOnEscapeOptions): void {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
}

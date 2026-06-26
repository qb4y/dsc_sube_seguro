import * as React from 'react';

/**
 * ShareButton — from subeseguro-ds@1.0.0.
 */
export interface ShareButtonProps {
  /** WhatsApp share URL */
  shareUrl: string;
  /** Whether the user has already shared */
  shared?: boolean;
  onClick?: () => void;
}

export declare const ShareButton: React.ComponentType<ShareButtonProps>;

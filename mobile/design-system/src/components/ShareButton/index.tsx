import React from 'react';
import { Share2, ChevronRight } from 'lucide-react';
import { tokens } from '../../tokens';

export interface ShareButtonProps {
  /** WhatsApp share URL */
  shareUrl: string;
  /** Whether the user has already shared */
  shared?: boolean;
  onClick?: () => void;
}

export function ShareButton({ shareUrl, shared, onClick }: ShareButtonProps) {
  return (
    <a
      href={shareUrl}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      style={{
        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12,
        padding: '15px 16px', borderRadius: 14,
        background: shared ? tokens.colorSurfaceElevated : tokens.colorBrand,
        color: shared ? tokens.colorText : tokens.colorBackground,
        fontWeight: 800, fontSize: 14.5,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
      }}
    >
      <Share2 size={19} />
      {shared ? 'Viaje compartido ✓' : 'Comparte tu viaje con un contacto'}
      {!shared && <ChevronRight size={18} style={{ marginLeft: 'auto' }} />}
    </a>
  );
}

export default ShareButton;

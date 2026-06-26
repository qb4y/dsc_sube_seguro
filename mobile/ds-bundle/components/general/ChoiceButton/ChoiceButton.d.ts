import * as React from 'react';

/**
 * ChoiceButton — from subeseguro-ds@1.0.0.
 */
export interface ChoiceButtonProps {
  active: boolean;
  /** Hex color for the active state */
  color: string;
  /** Lucide icon component */
  Icon?: LucideIcon;
  label: string;
  onClick?: () => void;
}

export declare const ChoiceButton: React.ComponentType<ChoiceButtonProps>;

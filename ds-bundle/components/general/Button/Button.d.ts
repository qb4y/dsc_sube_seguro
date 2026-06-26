import * as React from 'react';

/**
 * Button — from subeseguro-ds@1.0.0.
 * @replaces button
 */
export interface ButtonProps {
  /** Visual style */
  variant?: "primary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}

export declare const Button: React.ComponentType<ButtonProps>;

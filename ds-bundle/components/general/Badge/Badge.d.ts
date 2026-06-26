import * as React from 'react';

/**
 * Badge — from subeseguro-ds@1.0.0.
 */
export interface BadgeProps {
  /** Traffic-light verdict */
  verdict: "green" | "amber" | "red";
  /** Override the default label (Seguro / Precaución / Riesgo) */
  label?: string;
}

export declare const Badge: React.ComponentType<BadgeProps>;

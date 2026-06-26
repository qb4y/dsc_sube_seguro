import * as React from 'react';

/**
 * VerdictCard — from subeseguro-ds@1.0.0.
 */
export interface VerdictCardProps {
  verdict: "green" | "amber" | "red";
  /** Vehicle plate number */
  placa: string;
}

export declare const VerdictCard: React.ComponentType<VerdictCardProps>;

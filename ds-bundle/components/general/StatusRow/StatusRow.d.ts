import * as React from 'react';

/**
 * StatusRow — from subeseguro-ds@1.0.0.
 */
export interface StatusRowProps {
  verdict: "green" | "amber" | "red";
  title: string;
  /** Primary status label (e.g. "VIGENTE", "VENCIDO") */
  big: string;
  /** Secondary line (e.g. insurer name) */
  sub?: string;
  /** Explanatory note */
  note?: string;
}

export declare const StatusRow: React.ComponentType<StatusRowProps>;

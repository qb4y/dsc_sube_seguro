import * as React from 'react';

/**
 * MatchConfirm — from subeseguro-ds@1.0.0.
 */
export interface MatchConfirmProps {
  match: boolean;
  onMatch: (value: boolean) => void;
}

export declare const MatchConfirm: React.ComponentType<MatchConfirmProps>;

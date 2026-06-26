import * as React from 'react';

/**
 * PlateInput — from subeseguro-ds@1.0.0.
 */
export interface PlateInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  loading?: boolean;
  placeholder?: string;
}

export declare const PlateInput: React.ComponentType<PlateInputProps>;

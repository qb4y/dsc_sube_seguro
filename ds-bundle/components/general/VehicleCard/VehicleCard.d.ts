import * as React from 'react';

/**
 * VehicleCard — from subeseguro-ds@1.0.0.
 */
export interface VehicleCardProps {
  vehicle: VehicleInfo;
  /** null = no answer yet, true = matches, false = mismatch */
  match: boolean;
  onMatch: (value: boolean) => void;
}

export declare const VehicleCard: React.ComponentType<VehicleCardProps>;

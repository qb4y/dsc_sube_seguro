/**
 * Renders a list of Check items as StatusRow components.
 * Bridges the backend Check model to the DS StatusRow interface.
 */
import React from 'react';
import { View } from 'react-native';
import { StatusRow } from './StatusRow';
import { toVerdict } from '../lib/colores';
import type { Check } from '../api/verificar';

export function CheckList({ checks }: { checks: Check[] }) {
  return (
    <View>
      {checks.map((c) => (
        <StatusRow
          key={c.clave}
          verdict={toVerdict(c.color)}
          title={c.etiqueta}
          big={c.detalle}
          sub={`${c.fuente} · ${c.consultado_en}`}
        />
      ))}
    </View>
  );
}

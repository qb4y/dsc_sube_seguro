import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusRow } from './StatusRow';
import { toVerdict } from '../lib/colores';
import { tokens, radius } from '../lib/tokens';
import type { Check } from '../api/verificar';

export function CheckList({ checks }: { checks: Check[] }) {
  return (
    <View style={styles.container}>
      {checks.map((c, i) => (
        <View
          key={c.clave}
          style={[
            styles.cellWrap,
            i === 0 && styles.first,
            i === checks.length - 1 && styles.last,
          ]}
        >
          <StatusRow
            verdict={toVerdict(c.color)}
            title={c.etiqueta}
            big={c.detalle}
            sub={`${c.fuente} · ${c.consultado_en}`}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: tokens.colorLine,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cellWrap: {},
  first: {},
  last: {
    borderBottomWidth: 0,
  },
});

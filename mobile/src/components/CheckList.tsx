import React from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { StatusRow } from './StatusRow';
import { toVerdict } from '../lib/colores';
import { tokens, radius } from '../lib/tokens';
import { useStaggeredEntrance } from '../lib/animations';
import type { Check } from '../api/verificar';

function AnimatedRow({ c, index, total }: { c: Check; index: number; total: number }) {
  const anim = useStaggeredEntrance(index, 100);
  return (
    <Animated.View
      style={[
        anim,
        index === total - 1 && styles.lastCellWrap,
      ]}
    >
      <StatusRow
        verdict={toVerdict(c.color)}
        title={c.etiqueta}
        big={c.detalle}
        sub={`${c.fuente} · ${c.consultado_en}`}
      />
    </Animated.View>
  );
}

export function CheckList({ checks }: { checks: Check[] }) {
  return (
    <View style={styles.container}>
      {checks.map((c, i) => (
        <AnimatedRow key={c.clave} c={c} index={i} total={checks.length} />
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  lastCellWrap: {},
});

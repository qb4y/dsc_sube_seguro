import { useRef, useEffect, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

/** Fade + slide up on mount. Use with Animated.View. */
export function useFadeSlideIn(delay = 0, fromY = 28) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(fromY)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 480,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        tension: 80,
        friction: 11,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] } as const;
}

/** Scale bounce in when trigger flips to true. */
export function useScaleBounce(trigger: boolean) {
  const scale = useRef(new Animated.Value(0.82)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!trigger) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 140,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [trigger]);

  return { scale, opacity } as const;
}

/** Repeating pulse (for skeleton/loading). */
export function usePulse() {
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return opacity;
}

/** Spring scale for pressable buttons. */
export function useSpringPress() {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.955,
      tension: 400,
      friction: 14,
      useNativeDriver: true,
    }).start();
  }, []);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);

  return { scale, onPressIn, onPressOut } as const;
}

/** Horizontal shake — use on error. */
export function useShake() {
  const x = useRef(new Animated.Value(0)).current;

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(x, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(x, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(x, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(x, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(x, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  return { translateX: x, shake } as const;
}

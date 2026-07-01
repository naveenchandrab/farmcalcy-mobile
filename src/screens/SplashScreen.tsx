import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { useAuthStore } from '@store/authStore';

const { width: W, height: H } = Dimensions.get('window');

// ─── Palette (sampled from reference) ────────────────────────────────────────
const DARK_GREEN = '#1B5E20'; // "Farm", "Poultry Suite", loading text, active dot
const MID_GREEN = '#2E7D32'; // "Earn more.", leaf accent
const ORANGE = '#FA7A00'; // "Calcy"
const TAGLINE_GREY = '#3A3A3A';
const WAVE_FILL = '#F2F6E9'; // bg tone behind the farm photo bottom wave

// ─── Farm band geometry (fractions of screen height) ─────────────────────────
const FARM_TOP = H * 0.58;
const FARM_H = H * 0.26;

// ─── Logo badge ──────────────────────────────────────────────────────────────
const LOGO_H = H * 0.19;
const LOGO_W = LOGO_H * 1.088; // content aspect of cropped asset (668 / 614)

// ─── Corner leaf artwork ─────────────────────────────────────────────────────
// Decorative leaf images from the design (UI/UX/Screens) that bleed off the
// top-left and top-right corners. Assets are pre-cropped to their content.

const LEFT_LEAF_W = W * 0.22;
const LEFT_LEAF_H = LEFT_LEAF_W / 1.036; // cropped asset aspect (343 / 331)

const RIGHT_LEAF_W = W * 0.195;
const RIGHT_LEAF_H = RIGHT_LEAF_W / 0.642; // cropped asset aspect (296 / 461)

// ─── Wordmark leaf accent (top-right of "Calcy") ─────────────────────────────

const LeafAccent: React.FC = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" style={styles.leafAccent}>
    <Path d="M21,3 C11,3 4,9 3,19 C3,20 4,21 5,21 C15,20 21,13 21,3 Z" fill={MID_GREEN} />
    <Path d="M6,18 Q12,12 18,8" stroke="#FFFFFF" strokeWidth="1.1" fill="none" opacity={0.85} />
  </Svg>
);

// ─── Animated loading dots ───────────────────────────────────────────────────

const LoadingDots: React.FC = () => {
  const a0 = useRef(new Animated.Value(0.3)).current;
  const a1 = useRef(new Animated.Value(1)).current;
  const a2 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(a0, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(a1, { toValue: 0.3, duration: 320, useNativeDriver: true }),
          Animated.timing(a2, { toValue: 0.3, duration: 320, useNativeDriver: true }),
        ]),
        Animated.delay(90),
        Animated.parallel([
          Animated.timing(a0, { toValue: 0.3, duration: 320, useNativeDriver: true }),
          Animated.timing(a1, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(a2, { toValue: 0.3, duration: 320, useNativeDriver: true }),
        ]),
        Animated.delay(90),
        Animated.parallel([
          Animated.timing(a0, { toValue: 0.3, duration: 320, useNativeDriver: true }),
          Animated.timing(a1, { toValue: 0.3, duration: 320, useNativeDriver: true }),
          Animated.timing(a2, { toValue: 1, duration: 320, useNativeDriver: true }),
        ]),
        Animated.delay(90),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [a0, a1, a2]);

  const dotStyle = (anim: Animated.Value) => [
    styles.dot,
    {
      opacity: anim,
      transform: [
        {
          scale: anim.interpolate({
            inputRange: [0.3, 1],
            outputRange: [0.8, 1.3],
          }),
        },
      ],
    },
  ];

  return (
    <View style={styles.loadingSection}>
      <View style={styles.dotsRow}>
        <Animated.View style={dotStyle(a0)} />
        <Animated.View style={dotStyle(a1)} />
        <Animated.View style={dotStyle(a2)} />
      </View>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

// ─── Splash screen ───────────────────────────────────────────────────────────

const SplashScreen: React.FC = () => {
  const initialize = useAuthStore(state => state.initialize);

  useEffect(() => {
    // Enforce a minimum splash display time of 2.5 s so the screen is always visible.
    // initialize() itself sets isInitializing: false, so we delay calling it.
    const id = setTimeout(() => void initialize(), 2500);
    return () => clearTimeout(id);
  }, [initialize]);

  // Bottom wave: deepest dip at ~33% width, rising toward both edges (right higher).
  const bottomWave =
    `M0,${(FARM_H * 0.75).toFixed(1)} ` +
    `Q${(W * 0.18).toFixed(1)},${(FARM_H * 0.92).toFixed(1)} ` +
    `${(W * 0.33).toFixed(1)},${(FARM_H * 0.908).toFixed(1)} ` +
    `Q${(W * 0.42).toFixed(1)},${(FARM_H * 0.9).toFixed(1)} ` +
    `${(W * 0.5).toFixed(1)},${(FARM_H * 0.831).toFixed(1)} ` +
    `Q${(W * 0.6).toFixed(1)},${(FARM_H * 0.74).toFixed(1)} ` +
    `${(W * 0.67).toFixed(1)},${(FARM_H * 0.708).toFixed(1)} ` +
    `Q${(W * 0.84).toFixed(1)},${(FARM_H * 0.64).toFixed(1)} ` +
    `${W},${(FARM_H * 0.569).toFixed(1)} ` +
    `L${W},${FARM_H} L0,${FARM_H} Z`;

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Soft full-screen background gradient (near-white → pale green) */}
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FAFCF6" />
            <Stop offset="0.4" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#EDF3E1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={W} height={H} fill="url(#bg)" />
      </Svg>

      <Image
        source={require('../assets/images/leaf-left.png') as ImageSourcePropType}
        style={styles.leafLeft}
        resizeMode="contain"
      />
      <Image
        source={require('../assets/images/leaf-right.png') as ImageSourcePropType}
        style={styles.leafRight}
        resizeMode="contain"
      />

      {/* Brand / logo area */}
      <View style={styles.brand}>
        <Image
          source={require('../assets/images/splash-logo.png') as ImageSourcePropType}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.nameRow}>
          <Text style={styles.nameFarm}>Farms</Text>
          <Text style={styles.nameCalcy}>Easy</Text>
          <LeafAccent />
        </View>

        <View style={styles.suiteRow}>
          <View style={styles.dash} />
          <Text style={styles.suite}>Poultry Suite</Text>
          <View style={styles.dash} />
        </View>

        <Text style={styles.tagline}>
          {'Manage better, '}
          <Text style={styles.taglineAccent}>Earn more.</Text>
        </Text>
      </View>

      {/* Farm photo: soft misty top fade + crisp bottom wave */}
      <View style={styles.farm}>
        <Image
          source={require('../assets/images/splash-farm.png') as ImageSourcePropType}
          style={styles.farmImg}
          resizeMode="cover"
        />
        {/* Top mist: fade the photo top back into the background */}
        <Svg width={W} height={FARM_H * 0.32} style={styles.topFade} pointerEvents="none">
          <Defs>
            <LinearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FBFCF7" stopOpacity={1} />
              <Stop offset="1" stopColor="#FBFCF7" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={W} height={FARM_H * 0.32} fill="url(#mist)" />
        </Svg>
        {/* Bottom wave back into the background */}
        <Svg
          width={W}
          height={FARM_H}
          viewBox={`0 0 ${W} ${FARM_H}`}
          style={styles.bottomWave}
          pointerEvents="none"
        >
          <Path d={bottomWave} fill={WAVE_FILL} />
        </Svg>
      </View>

      <LoadingDots />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FBFCF7',
  },
  // Corner leaf artwork
  leafLeft: {
    position: 'absolute',
    top: H * 0.04,
    left: -W * 0.03,
    width: LEFT_LEAF_W,
    height: LEFT_LEAF_H,
    opacity: 0.5,
  },
  leafRight: {
    position: 'absolute',
    top: H * 0.035,
    right: -W * 0.02,
    width: RIGHT_LEAF_W,
    height: RIGHT_LEAF_H,
    opacity: 0.5,
  },
  // Brand
  brand: {
    position: 'absolute',
    top: H * 0.235,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logo: {
    width: LOGO_W,
    height: LOGO_H,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: H * 0.011,
  },
  nameFarm: {
    fontSize: 40,
    fontWeight: '800',
    color: DARK_GREEN,
    letterSpacing: -0.5,
  },
  nameCalcy: {
    fontSize: 40,
    fontWeight: '800',
    color: ORANGE,
    letterSpacing: -0.5,
  },
  leafAccent: {
    marginTop: 2,
    marginLeft: -2,
  },
  suiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: H * 0.019,
  },
  dash: {
    width: 26,
    height: 1.5,
    marginHorizontal: 8,
    backgroundColor: DARK_GREEN,
  },
  suite: {
    fontSize: 21,
    fontWeight: '600',
    color: DARK_GREEN,
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: H * 0.006,
    fontSize: 15,
    color: TAGLINE_GREY,
    fontWeight: '500',
  },
  taglineAccent: {
    color: MID_GREEN,
    fontWeight: '700',
  },
  // Farm
  farm: {
    position: 'absolute',
    top: FARM_TOP,
    left: 0,
    width: W,
    height: FARM_H,
    overflow: 'hidden',
  },
  farmImg: {
    width: W,
    height: FARM_H,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bottomWave: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  // Loading
  loadingSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: H * 0.875,
    alignItems: 'center',
    gap: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: DARK_GREEN,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: DARK_GREEN,
  },
});

export default SplashScreen;

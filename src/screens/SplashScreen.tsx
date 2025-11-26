// src/screens/SplashScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Bienvenida: undefined;
  Home: undefined;
};

type Nav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const [msg, setMsg] = useState('Cargando…');

  // Fade-in general
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(10)).current;

  // “Respiración” del logo
  const logoScale = useRef(new Animated.Value(0.96)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // Animación inicial
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    // Loop del logo (sube/baja de tamaño + “aura” suave)
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(logoScale, {
            toValue: 1.04,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 0.96,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.35,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [fadeAnim, translateAnim, logoScale, glowOpacity]);

  // Lógica de navegación (5 segundos de splash)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setMsg('Leyendo estado…');

        const onboardingDone =
          (await AsyncStorage.getItem('onboarding_done')) === '1';
        const userToken = await AsyncStorage.getItem('user_token');

        // ⏱ Mantener el Splash visible 5 segundos
        await new Promise((r) => setTimeout(r, 5000));

        let next: keyof RootStackParamList;
        if (!onboardingDone) {
          next = 'Onboarding';
        } else if (!userToken) {
          next = 'Login';
        } else {
          next = 'Home';
        }

        if (!alive) return;
        navigation.reset({
          index: 0,
          routes: [{ name: next as never }],
        });
      } catch (e) {
        console.log('Splash error', e);
        if (!alive) return;
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' as never }],
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigation]);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7f1d1d" />

      {/* halo rojo detrás del logo */}
      <Animated.View
        pointerEvents="none"
        style={[
          s.glowCircle,
          {
            opacity: glowOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      />

      <Animated.View
        style={[
          s.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }],
          },
        ]}
      >
        {/* Marco blanco para que el logo con letras negras se vea bien */}
        <Animated.View style={[s.logoFrame, { transform: [{ scale: logoScale }] }]}>
          <View style={s.logoInner}>
            <Image
              source={require('../../assets/bunkan-logo.webp')}
              style={s.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <View style={s.textBlock}>
          <Text style={s.kanji}>文化能日墨</Text>
          <Text style={s.brand}>Bunkan Nichiboku</Text>
          <Text style={s.tagline}>Escuela de japonés y cultura japonesa</Text>
        </View>

        <View style={s.loaderRow}>
          <ActivityIndicator color="#fefce8" />
          <Text style={s.msgText}>{msg}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7f1d1d', // rojo principal Nichiboku
    alignItems: 'center',
    justifyContent: 'center',
  },

  // circulito “glow” detrás del logo
  glowCircle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(254,249,195,0.18)', // dorado suave
  },

  content: {
    width: '80%',
    maxWidth: 380,
    alignItems: 'center',
  },

  logoFrame: {
    borderRadius: 32,
    padding: 10,
    backgroundColor: '#f9fafb', // blanco para que se vean bien las letras negras del logo
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    marginBottom: 18,
  },
  logoInner: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 210,
    height: 210,
  },

  textBlock: {
    alignItems: 'center',
    marginBottom: 26,
  },
  kanji: {
    fontSize: 22,
    color: '#fef9c3',
    marginBottom: 4,
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f9fafb',
  },
  tagline: {
    marginTop: 4,
    fontSize: 12,
    color: '#e5e7eb',
    textAlign: 'center',
  },

  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  msgText: {
    fontSize: 13,
    color: '#f9fafb',
    marginLeft: 8,
  },
});

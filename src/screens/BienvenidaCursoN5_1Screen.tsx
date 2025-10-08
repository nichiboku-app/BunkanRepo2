// src/screens/BienvenidaCursoN5_1Screen.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

import SakuraFall from '../components/SakuraFall';
import { BulletItem } from '../components/ui/BulletItem';
import { GhostButton, PrimaryButton } from '../components/ui/Buttons';
import { ChipTag } from '../components/ui/ChipTag';
import { getLastLocation } from '../services/progress';

// ===== Tipos locales =====
type RootStackParamList = {
  BienvenidaCursoN5_1: undefined;
  CursoN5: undefined;
  TemaN5: undefined | { title?: string };
  EntradaActividadesN5: undefined;
  IntroJapones: undefined;
};
type Nav = NativeStackNavigationProp<RootStackParamList>;

// ===== Paleta =====
const COLORS = {
  redDeep: '#6A0F16',
  redGradA: '#7A1117',
  redGradB: '#B32424',
  cream: 'rgba(255, 255, 255, 0.94)',
  gold: '#C8A046',
  goldSoft: '#E8D29A',
  goldLine: '#E6D9B8',
  subBg: 'rgba(255,255,255,0.82)',
};

// imágenes
const HERO_SRC = require('../../assets/images/imagen2.webp');
const BG_IMG = require('../../assets/images/fondo3.webp');
const SAKURA_DECOR = require('../../assets/icons/sakura1.webp');

function Decor({ source, style }: { source: any; style?: StyleProp<ViewStyle> }) {
  return (
    <View pointerEvents="none" style={style}>
      <ExpoImage source={source} style={StyleSheet.absoluteFill} contentFit="contain" />
    </View>
  );
}

/** ===== Título premium, centrado, con glow dorado y trazo ===== */
function ElegantTitle({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.titleWrap}>
      <LinearGradient
        colors={[COLORS.redGradA, COLORS.redGradB]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={s.titleOuter}
      >
        <View style={s.titleInner}>
          {/* brillo superior tipo laca */}
          <LinearGradient
            colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={s.titleSheen}
          />
          {/* “doble” capa para efecto glow + texto principal */}
          <View style={s.titleTextWrap}>
            <Text style={[s.titleText, s.titleTextGlow]}>{children}</Text>
            <Text style={s.titleText}>{children}</Text>
          </View>

          {/* Esquinas doradas tipo bracket */}
          <View style={[s.corner, s.cornerTL]} />
          <View style={[s.corner, s.cornerTR]} />
          <View style={[s.corner, s.cornerBL]} />
          <View style={[s.corner, s.cornerBR]} />

          {/* Trazo tipo pincel, centrado */}
          <LinearGradient
            colors={[COLORS.gold, COLORS.goldSoft, COLORS.gold]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.titleBrush}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

/** ===== Subtítulo ancho completo, sin iconos ===== */
function ElegantSub({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.subWrap}>
      <LinearGradient
        colors={[COLORS.gold, COLORS.goldSoft]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={s.subAccent}
      />
      <View style={s.subInner}>
        <Text style={s.subText}>{children}</Text>
      </View>
      <View style={s.subRuleTop} />
      <View style={s.subRuleBottom} />
    </View>
  );
}

export default function BienvenidaCursoN5_1Screen() {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();

  // Ancho útil (padding 20 a cada lado)
  const contentWidth = Math.max(0, width - 40);
  // Altura base con proporción vertical (3/4) y recorte ~60px
  const heroHeight = Math.max(260, Math.round(contentWidth * (3 / 4)) - 60);

  const goRoot = (route: keyof RootStackParamList, params?: any) => {
    const parent = navigation.getParent();
    if (parent) (parent as any).navigate(route as any, params);
    else (navigation as any).navigate(route as any, params);
  };

  const routeMap = {
    IntroJapones: 'IntroJapones',
    IntroJaponesScreen: 'IntroJapones',
    EntradaActividadesN5: 'EntradaActividadesN5',
    TemaN5: 'TemaN5',
    CursoN5: 'CursoN5',
    BienvenidaCursoN5_1: 'BienvenidaCursoN5_1',
  } as const;
  type RouteMapKey = keyof typeof routeMap;
  const normalizeRoute = (r?: string): keyof RootStackParamList | null =>
    r && (routeMap as Record<string, keyof RootStackParamList>)[r] ? routeMap[r as RouteMapKey] : null;

  type SavedLoc = string | { route: string; params?: any } | null;
  const handleContinue = async () => {
    try {
      const lastRaw = (await getLastLocation()) as SavedLoc;
      const lastRoute = typeof lastRaw === 'string' ? lastRaw : lastRaw?.route;
      const params = typeof lastRaw === 'string' ? undefined : lastRaw?.params;

      const normalized = normalizeRoute(lastRoute);
      if (normalized) {
        goRoot(normalized, params ?? {});
      } else {
        goRoot('EntradaActividadesN5');
      }
    } catch {
      goRoot('EntradaActividadesN5');
    }
  };

  return (
    <View style={s.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Fondo con imagen */}
      <ImageBackground source={BG_IMG} resizeMode="cover" style={StyleSheet.absoluteFillObject} />

      {/* Pétalos al fondo */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <SakuraFall count={18} baseDuration={10000} wind={36} sway={26} opacity={0.25} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Título centrado premium */}
        <ElegantTitle>Curso de Japonés N5</ElegantTitle>

        {/* Subtítulo ancho completo */}
        <ElegantSub>Presentación del nivel y acceso a tus actividades.</ElegantSub>

        {/* HERO */}
        <View style={[s.heroFrameGold, { height: heroHeight }]}>
          <ExpoImage
            source={HERO_SRC}
            style={s.heroImage}
            contentFit="cover"
            transition={250}
            onError={(err: unknown) => {
              const msg =
                err instanceof Error
                  ? err.message
                  : typeof err === 'object'
                  ? JSON.stringify(err)
                  : String(err);
              console.warn('[HERO] Error cargando imagen:', msg);
            }}
          />
        </View>

        {/* ¿Qué aprenderás? —— tarjeta blanca */}
        <View style={s.cardWhiteFull}>
          <Text style={s.cardTitle}>¿Qué aprenderás?</Text>
          <View style={{ marginTop: 6 }}>
            <BulletItem>Hiragana y Katakana completos</BulletItem>
            <BulletItem>Vocabulario esencial (saludos, familia, tiempo)</BulletItem>
            <BulletItem>Gramática básica: です／ます, これ・それ・あれ, partículas は・が・を・に</BulletItem>
            <BulletItem>Verbos en forma -ます (presente, pasado, negativo)</BulletItem>
            <BulletItem>Lectura y comprensión auditiva</BulletItem>
            <BulletItem>Entre otros 100 temas más…</BulletItem>
          </View>
          <Decor source={SAKURA_DECOR} style={s.sakuraCorner} />
        </View>

        {/* Requisitos / Método —— tarjetas blancas */}
        <View style={s.row}>
          <View style={[s.col, s.cardWhiteFull]}>
            <Text style={s.cardTitle}>Requisitos</Text>
            <BulletItem>Cero o poca base de japonés</BulletItem>
            <BulletItem>15 min diarios de estudio recomendado</BulletItem>
            <BulletItem>Cuaderno para notas ✍️</BulletItem>
          </View>

          <View style={[s.col, s.cardWhiteFull]}>
            <Text style={s.cardTitle}>Método</Text>
            <BulletItem>Actividades interactivas y mini-exámenes</BulletItem>
            <BulletItem>Audio nativo para pronunciación</BulletItem>
            <BulletItem>Gamificación: puntos y logros</BulletItem>
          </View>
        </View>

        {/* Incluye —— tarjeta blanca */}
        <View style={s.cardWhiteFull}>
          <Text style={s.cardTitle}>Incluye</Text>
          <View style={s.chips}>
            <ChipTag icon={<Ionicons name="headset" size={14} color="#A93226" />} label="Escucha" />
            <ChipTag icon={<Ionicons name="mic" size={14} color="#A93226" />} label="Pronunciación" />
            <ChipTag icon={<Ionicons name="book" size={14} color="#A93226" />} label="Lecturas" />
            <ChipTag
              icon={<MaterialCommunityIcons name="gamepad-variant-outline" size={14} color="#A93226" />}
              label="Juegos"
            />
            <ChipTag icon={<Ionicons name="stats-chart" size={14} color="#A93226" />} label="Progreso" />
          </View>
        </View>

        {/* CTA: Continuar + Entrar */}
        <View style={s.ctaCol}>
          <PrimaryButton title="Continuar donde te quedaste" onPress={handleContinue} />
          <PrimaryButton title="Entrar a las actividades N5" onPress={() => goRoot('IntroJapones')} />
        </View>

        <View style={s.actionsRow}>
          <GhostButton title="Examen diagnóstico" onPress={() => {}} style={{ flex: 1 }} />
          <GhostButton title="Comprar membresía" onPress={() => {}} style={{ flex: 1 }} />
        </View>

        <Text style={s.tip}>
          Consejo: completa 1–2 actividades por día. Tu avance y logros aparecerán aquí cuando conectemos tu perfil.
        </Text>
      </ScrollView>

      {/* Pétalos por delante — ultra sutil */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <SakuraFall count={8} baseDuration={9500} wind={40} sway={28} opacity={0.06} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ECEFF3' },
  content: { padding: 20, paddingBottom: 40, gap: 14 },

  /** ===== TÍTULO CENTRADO PREMIUM ===== */
  titleWrap: { marginTop: 55 },
  titleOuter: {
    width: '100%',
    borderRadius: 18,
    padding: 2, // marco gradiente rojo
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  titleInner: {
    backgroundColor: COLORS.cream,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0E7D4',
    alignItems: 'center',        // ⬅️ centra contenido
  },
  titleSheen: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 22,
  },
  titleTextWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Capa de “glow” dorado detrás del texto
  titleTextGlow: {
    position: 'absolute',
    color: 'transparent',
    textShadowColor: 'rgba(200,160,70,0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  titleText: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.redDeep,
    letterSpacing: 0.8,
    textAlign: 'center',         // ⬅️ texto centrado
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Esquinas doradas tipo “bracket”
  corner: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: COLORS.gold,
  },
  cornerTL: { top: 8, left: 10, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 8, right: 10, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 10, left: 10, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 10, right: 10, borderBottomWidth: 2, borderRightWidth: 2 },
  // Trazo de pincel dorado centrado
  titleBrush: {
    position: 'absolute',
    bottom: 8,
    height: 3,
    borderRadius: 3,
    opacity: 0.95,
    alignSelf: 'center',
    width: '56%',               // centrado bajo el texto
  },

  /** ===== SUBTÍTULO (ancho completo) ===== */
  subWrap: {
    position: 'relative',
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: COLORS.subBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.goldLine,
    marginTop: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  subAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 7,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  subInner: {
    paddingVertical: 12,
    paddingRight: 16,
    paddingLeft: 18 + 10, // franja + aire
  },
  subText: {
    color: '#4A4031',
    fontSize: 16.5,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  subRuleTop: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 6,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EADFBF',
  },
  subRuleBottom: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 6,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EADFBF',
  },

  // TARJETA BLANCA
  cardWhiteFull: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E6EAF0',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    overflow: 'hidden',
  },

  // HERO (marco dorado al ras + alto recortado)
  heroFrameGold: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: COLORS.gold,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  heroImage: { width: '100%', height: '100%' },

  row: { flexDirection: 'row', gap: 14 },
  col: { flex: 1 },

  cardTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },

  // CTA column
  ctaCol: { gap: 10, marginTop: 6 },

  actionsRow: { flexDirection: 'row', gap: 12 },
  tip: { color: '#444', fontSize: 12, marginTop: 8, textAlign: 'center' },

  sakuraCorner: {
    position: 'absolute',
    right: -16,
    bottom: 8,
    width: 120,
    height: 90,
    opacity: 0.85,
  },
  cardFrameOverlay: {
    left: -2, right: -2, top: -2, bottom: -2,
    opacity: 0.4,
  },
});

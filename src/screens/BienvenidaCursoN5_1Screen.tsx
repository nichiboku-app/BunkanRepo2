// src/screens/BienvenidaCursoN5_1Screen.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

import SakuraFall from '../components/SakuraFall';
import { BulletItem } from '../components/ui/BulletItem';
import { PrimaryButton } from '../components/ui/Buttons';
import { ChipTag } from '../components/ui/ChipTag';

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
  redSolid: '#B32424',
  cream: 'rgba(255, 255, 255, 0.94)',
  gold: '#C8A046',
  goldSoft: '#E8D29A',
  goldLine: '#E6D9B8',
  subBg: 'rgba(255,255,255,0.82)',
  overlay: 'rgba(0,0,0,0.25)',
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

/** ===== Botón rojo (para CTAs y tips) ===== */
function RedButton({
  title,
  onPress,
  style,
  small = false,
}: {
  title: string;
  onPress: () => void;
  style?: any;
  small?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[rb.base, small && rb.small, style]}>
      <Text style={[rb.txt, small && rb.txtSmall]}>{title}</Text>
    </TouchableOpacity>
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
          <LinearGradient
            colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={s.titleSheen}
          />
          <View style={s.titleTextWrap}>
            <Text style={[s.titleText, s.titleTextGlow]}>{children}</Text>
            <Text style={s.titleText}>{children}</Text>
          </View>

          <View style={[s.corner, s.cornerTL]} />
          <View style={[s.corner, s.cornerTR]} />
          <View style={[s.corner, s.cornerBL]} />
          <View style={[s.corner, s.cornerBR]} />

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

/** ===== Subtítulo ancho completo ===== */
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

  // Estado para tips (modal superior)
  const [tipVisible, setTipVisible] = useState(false);
  const [tipTitle, setTipTitle] = useState<string>('');
  const [tipBody, setTipBody] = useState<string>('');

  const openTip = (title: string, body: string) => {
    setTipTitle(title);
    setTipBody(body);
    setTipVisible(true);
  };

  const closeTip = () => setTipVisible(false);

  // Ancho útil (padding 20 a cada lado)
  const contentWidth = Math.max(0, width - 40);
  const heroHeight = Math.max(260, Math.round(contentWidth * (3 / 4)) - 60);

  const goRoot = (route: keyof RootStackParamList, params?: any) => {
    const parent = navigation.getParent();
    if (parent) (parent as any).navigate(route as any, params);
    else (navigation as any).navigate(route as any, params);
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

        {/* Subtítulo */}
        <ElegantSub>Presentación del nivel y acceso a tus actividades.</ElegantSub>

        {/* HERO */}
        <View style={[s.heroFrameGold, { height: heroHeight }]}>
          <ExpoImage source={HERO_SRC} style={s.heroImage} contentFit="cover" transition={250} />
        </View>

        {/* ¿Qué aprenderás? */}
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

        {/* Requisitos / Método */}
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

        {/* Incluye */}
        <View style={s.cardWhiteFull}>
          <Text style={s.cardTitle}>Incluye</Text>
          <View style={s.chips}>
            <ChipTag icon={<Ionicons name="headset" size={14} color="#A93226" />} label="Escucha" />
            <ChipTag icon={<Ionicons name="mic" size={14} color="#A93226" />} label="Pronunciación" />
            <ChipTag icon={<Ionicons name="book" size={14} color="#A93226" />} label="Lecturas" />
            <ChipTag icon={<MaterialCommunityIcons name="gamepad-variant-outline" size={14} color="#A93226" />} label="Juegos" />
            <ChipTag icon={<Ionicons name="stats-chart" size={14} color="#A93226" />} label="Progreso" />
          </View>

          {/* Instrucción pedida */}
          <Text style={s.includeHint}>
            Pulsa los <Text style={{ fontWeight: '900', color: COLORS.redSolid }}>botones rojos</Text> para ver
            <Text style={{ fontWeight: '900' }}> consejos de estudio</Text> para este nivel.
          </Text>

          {/* Botones rojos de consejos */}
          <View style={s.tipButtonsRow}>
            <RedButton
              small
              title="Consejos: ritmo"
              onPress={() =>
                openTip(
                  'Consejos de ritmo',
                  'Estudia 15–25 min diarios. Haz 1–2 actividades por sesión y repite en días alternos para consolidar.'
                )
              }
            />
            <RedButton
              small
              title="Consejos: memoria"
              onPress={() =>
                openTip(
                  'Consejos de memoria',
                  'Crea tarjetas (kana y vocabulario) y practica con intervalos espaciados. Di en voz alta cada ejemplo.'
                )
              }
            />
            <RedButton
              small
              title="Consejos: audio"
              onPress={() =>
                openTip(
                  'Consejos de audio',
                  'Escucha primero, luego repite imitando ritmo y entonación. Usa auriculares y baja la velocidad si lo necesitas.'
                )
              }
            />
          </View>
        </View>

        {/* CTA principal: Examen diagnóstico y Entrar */}
        <View style={s.ctaCol}>
          <RedButton
  title="Examen diagnóstico"
  onPress={() => goRoot('N5_Diagnostico')}
/>

          <PrimaryButton title="Entrar a las actividades N5" onPress={() => goRoot('IntroJapones')} />
        </View>

        <Text style={s.tip}>
          Consejo: completa 1–2 actividades por día. Tu avance y logros aparecerán aquí cuando conectemos tu perfil.
        </Text>
      </ScrollView>

      {/* Modal superior de tips */}
      <Modal visible={tipVisible} transparent animationType="fade" onRequestClose={closeTip}>
        <View style={m.overlay}>
          <View style={m.topSheet}>
            <Text style={m.title}>{tipTitle}</Text>
            <Text style={m.body}>{tipBody}</Text>
            <RedButton small title="Cerrar" onPress={closeTip} style={{ alignSelf: 'flex-end', marginTop: 8 }} />
          </View>
        </View>
      </Modal>

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

  /** ===== TÍTULO ===== */
  titleWrap: { marginTop: 55 },
  titleOuter: {
    width: '100%',
    borderRadius: 18,
    padding: 2,
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
    alignItems: 'center',
  },
  titleSheen: { position: 'absolute', left: 0, right: 0, top: 0, height: 22 },
  titleTextWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
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
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  corner: { position: 'absolute', width: 18, height: 18, borderColor: COLORS.gold },
  cornerTL: { top: 8, left: 10, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 8, right: 10, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 10, left: 10, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 10, right: 10, borderBottomWidth: 2, borderRightWidth: 2 },
  titleBrush: { position: 'absolute', bottom: 8, height: 3, borderRadius: 3, opacity: 0.95, alignSelf: 'center', width: '56%' },

  /** ===== SUBTÍTULO ===== */
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
  subAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 7, borderTopLeftRadius: 14, borderBottomLeftRadius: 14 },
  subInner: { paddingVertical: 12, paddingRight: 16, paddingLeft: 28 },
  subText: { color: '#4A4031', fontSize: 16.5, fontWeight: '600', letterSpacing: 0.3 },
  subRuleTop: { position: 'absolute', left: 12, right: 12, top: 6, height: StyleSheet.hairlineWidth, backgroundColor: '#EADFBF' },
  subRuleBottom: { position: 'absolute', left: 12, right: 12, bottom: 6, height: StyleSheet.hairlineWidth, backgroundColor: '#EADFBF' },

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

  includeHint: { marginTop: 10, color: '#4A4031', fontSize: 13.5 },
  tipButtonsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },

  // CTAs
  ctaCol: { gap: 10, marginTop: 10 },

  tip: { color: '#444', fontSize: 12, marginTop: 8, textAlign: 'center' },

  sakuraCorner: { position: 'absolute', right: -16, bottom: 8, width: 120, height: 90, opacity: 0.85 },
});

/** ===== Estilos botón rojo ===== */
const rb = StyleSheet.create({
  base: {
    backgroundColor: COLORS.redSolid,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8E1C1C',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  txt: { color: '#fff', fontWeight: '900', letterSpacing: 0.3, fontSize: 16 },
  small: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  txtSmall: { fontSize: 13, fontWeight: '800' },
});

/** ===== Modal superior de tips ===== */
const m = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-start', // ⬅️ se pega arriba
  },
  topSheet: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EAF0',
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: { fontSize: 16, fontWeight: '900', color: '#1A1A1A' },
  body: { marginTop: 6, fontSize: 14, color: '#3B3B3B', lineHeight: 20 },
});

// src/screens/IntroJaponesScreen.tsx
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import type { RootStackParamList as AppRoutes } from '../../types';
import { rememberLocation } from '../services/progress';

/* ===== ASSETS ===== */
const BG_FUJI      = require('../../assets/intro/imagen_fuji.webp');      // 500x350 (AR 10:7)
const FRAME_ROJO   = require('../../assets/intro/marco_rojo.webp');
const FRAME_DORADO = require('../../assets/frames/marco_dorado.webp');
const ICON_VIDEO   = require('../../assets/intro/icono_video.webp');

const ICON_SCROLL  = require('../../assets/icons/intro/icon_scroll_kanji.webp');
const ICON_BRUSH   = require('../../assets/icons/intro/icon_brush_ink.webp');
const ICON_GEISHA  = require('../../assets/icons/intro/icon_geisha_mask.webp');
const ICON_QUIZ    = require('../../assets/icons/intro/icon_quiz_book.webp');
const ICON_KOKESHI = require('../../assets/icons/intro/icon_kokeshi.webp');
const ICON_BOOK    = require('../../assets/icons/intro/icon_book_info.webp');
const PATTERN      = require('../../assets/icons/intro/bg_seigaiha.webp');

type Nav = NativeStackNavigationProp<AppRoutes>;

/* ===== KNOBS ===== */
const BG_AR          = 10 / 7;
const BG_OFFSET_Y    = 0;
const TOP_FADE       = true;
const BOTTOM_SEAM_H  = 80;
const PANEL_RADIUS   = 36;
const BTN_HEIGHT     = 116;
const CONTENT_PAD    = 12;

// 9-slice del marco rojo
const RED_CAPS = { top: 34, left: 34, bottom: 34, right: 34 };
const RED_OUTER_PADDING = 12;

export default function IntroJaponesScreen() {
  const navigation = useNavigation<Nav>();
  const go = <T extends keyof AppRoutes>(route: T, params?: AppRoutes[T]) => {
    rememberLocation('IntroJapones');
    (navigation as any).navigate(route as string, params as any);
  };

  const { width, height } = useWindowDimensions();
  const SIDE = 16;
  const GAP  = 12;

  const bgHeight = useMemo(() => Math.round(width / BG_AR), [width]);

  const visibleTop = useMemo(
    () => Math.min(bgHeight, Math.max(240, Math.floor(height * 0.48))),
    [bgHeight, height]
  );

  const CARD_W = useMemo(
    () => Math.floor((width - SIDE * 2 - GAP * 2) / 3),
    [width]
  );

  return (
    <View style={s.root} pointerEvents="box-none">
      <StatusBar translucent={false} backgroundColor="#6B0015" barStyle="light-content" />

      {/* ===== Fondo Fuji ===== */}
      <View style={{ height: visibleTop, overflow: 'hidden' }} pointerEvents="none">
        <ExpoImage
          source={BG_FUJI}
          style={{ width, height: bgHeight, position: 'absolute', top: BG_OFFSET_Y }}
          contentFit="contain"
          cachePolicy="memory-disk"
        />

        {TOP_FADE && (
          <LinearGradient
            colors={['rgba(0,0,0,0.30)', 'rgba(0,0,0,0.00)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.6 }}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, height: Math.floor(visibleTop * 0.8) }}
            pointerEvents="none"
          />
        )}

        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BOTTOM_SEAM_H }}
          pointerEvents="none"
        />
      </View>

      {/* ===== Panel blanco curvo ===== */}
      <View style={s.panelWrap}>
        <ImageBackground source={PATTERN} style={s.panel} imageStyle={s.panelImg}>
          <ScrollView contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
            <Text style={s.title}>INTRODUCCIÓN AL{'\n'}JAPONÉS</Text>
            <Text style={s.subtitle}>Escuela Bunkan Nichiboku</Text>

            {/* Subtemas (marco DORADO) */}
            <Text style={s.sectionTitle}>Subtemas principales</Text>
            <View style={[s.row, { paddingHorizontal: SIDE }]} pointerEvents="box-none">
              <FramedButtonGold
                icon={ICON_SCROLL}
                label="Orígenes del idioma"
                bg="#7A0D11"
                style={{ width: CARD_W }}
                onPress={() => go('OrigenesDelIdioma')}
              />
              <FramedButtonGold
                icon={ICON_BRUSH}
                label="Sistemas de escritura"
                bg="#C1121F"
                style={{ width: CARD_W }}
                onPress={() => go('EscrituraN5')}
              />
              <FramedButtonGold
                icon={ICON_GEISHA}
                label="Cultura básica"
                bg="#B7213F"
                style={{ width: CARD_W }}
                onPress={() => go('CulturaN5')}
              />
            </View>

            {/* Actividades (marco ROJO) */}
            <Text style={[s.sectionTitle, { marginTop: 28 }]}>Actividades</Text>
            <View style={[s.row, { paddingHorizontal: SIDE }]} pointerEvents="box-none">
              <FramedButtonRed
                icon={ICON_VIDEO}
                label="Video introductorio"
                bg="#6A2B09"
                style={{ width: CARD_W }}
                onPress={() => go('VideoIntroModal')}
              />
              <FramedButtonRed
                icon={ICON_QUIZ}
                label="Quiz cultural"
                bg="#FCB861"
                style={{ width: CARD_W }}
                onPress={() => go('QuizCultural')}
                textColor="#2B1900"
              />
              <FramedButtonRed
                icon={ICON_KOKESHI}
                label="Gif saludo japonés"
                bg="#8FB3E2"
                style={{ width: CARD_W }}
                onPress={() => go('GifSaludo')}
                textColor="#07223B"
              />
            </View>

            {/* Info */}
            <View style={[s.infoBox, { marginHorizontal: SIDE, marginTop: 28 }]}>
              <ExpoImage source={ICON_BOOK} style={s.infoIcon} contentFit="contain" />
              <Text style={s.infoText}>
                La Escuela Bunkan Nichiboku te acompaña en tu viaje al japonés con cursos desde N5
                hasta N1, actividades interactivas y una comunidad apasionada.
              </Text>
            </View>

            {/* Siguiente */}
            <Pressable
              onPress={() => go('Hiragana')}
              style={({ pressed }) => [s.nextBtn, pressed && s.pressed, { marginHorizontal: SIDE }]}
              hitSlop={12}
              accessibilityRole="button"
            >
              <Text style={s.nextBtnText}>Siguiente capítulo: Hiragana ➜</Text>
            </Pressable>
          </ScrollView>
        </ImageBackground>
      </View>
    </View>
  );
}

/* ===== Botón DORADO: Pressable como contenedor raíz ===== */
function FramedButtonGold({
  icon,
  label,
  onPress,
  bg,
  textColor = '#fff',
  style,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  bg: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={16}
      style={({ pressed }) => [
        btnGold.wrap,
        style,
        { zIndex: 1 }, // asegúralo por encima de overlays
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
      ]}
    >
      {/* Cuerpo clickeable */}
      <View
        style={[
          btnGold.body,
          { backgroundColor: bg, height: BTN_HEIGHT, padding: CONTENT_PAD, width: '100%' },
        ]}
      >
        <ExpoImage source={icon} style={btnGold.icon} contentFit="contain" />
        <Text style={[btnGold.text, { color: textColor }]}>{label}</Text>
      </View>

      {/* Marco dorado dentro del mismo Pressable pero sin capturar toques */}
      <ExpoImage
        source={FRAME_DORADO}
        style={btnGold.frame}
        contentFit="fill"
        pointerEvents="none"
      />
    </Pressable>
  );
}

/* ===== Botón ROJO (9-slice) ===== */
function FramedButtonRed({
  icon,
  label,
  onPress,
  bg,
  textColor = '#fff',
  style,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  bg: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[btnRed.wrap, style, { padding: RED_OUTER_PADDING }]} pointerEvents="box-none">
      {/* Fondo 9-slice SIN interceptar toques */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <ImageBackground
          source={FRAME_ROJO}
          resizeMode="stretch"
          capInsets={RED_CAPS}
          style={StyleSheet.absoluteFill}
          imageStyle={btnRed.frameImg}
        />
      </View>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        hitSlop={16}
        style={({ pressed }) => [
          btnRed.body,
          { backgroundColor: bg, height: BTN_HEIGHT, padding: CONTENT_PAD, width: '100%', zIndex: 1 },
          pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
        ]}
      >
        <ExpoImage source={icon} style={btnRed.icon} contentFit="contain" />
        <Text style={[btnRed.text, { color: textColor }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

/* ===== Styles ===== */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  panelWrap: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: PANEL_RADIUS,
    borderTopRightRadius: PANEL_RADIUS,
    overflow: 'hidden',
  },
  panel: { flex: 1, paddingTop: 20, paddingBottom: 20 },
  panelImg: { opacity: 0.08 },

  title: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 30,
    color: '#111',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B0015',
    marginTop: 6,
    marginBottom: 18,
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 14,
    paddingHorizontal: 16,
  },

  row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },

  infoBox: {
    backgroundColor: '#F6EFE3',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E9DFC9',
  },
  infoIcon: { width: 32, height: 32 },
  infoText: { flex: 1, color: '#3b2b1b', fontWeight: '600' },

  nextBtn: {
    marginTop: 18,
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  nextBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },

  pressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
});

const btnGold = StyleSheet.create({
  wrap: { position: 'relative', borderRadius: 16 },
  body: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  frame: { position: 'absolute', inset: 0, borderRadius: 16 },
  icon: { width: 70, height: 70, marginBottom: 6 },
  text: { fontWeight: '900', fontSize: 12, textAlign: 'center', marginTop: -2 },
});

const btnRed = StyleSheet.create({
  wrap: { position: 'relative', borderRadius: 16 },
  frameImg: { borderRadius: 16 },
  body: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  icon: { width: 70, height: 70, marginBottom: 6 },
  text: { fontWeight: '900', fontSize: 12, textAlign: 'center', marginTop: -2 },
});

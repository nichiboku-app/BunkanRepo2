// src/screens/PerfilScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import CameraIcon from '../../assets/icons/camera.svg';
import CrownIcon from '../../assets/icons/crown.svg';
import EditIcon from '../../assets/icons/edit.svg';

import dividerImg from '../../assets/icons/DividerIcon.webp';

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

import {
  getRanks,
  ProfileLive,
  Ranks,
  streamProfile,
  updateDisplayName,
} from '../services/profile';
import { pickAndSaveAvatar } from '../services/uploadAvatar';
import { awardXpCurrentUser } from '../services/xp';

// 👇 selector de país
import type { CountryCode } from 'react-native-country-picker-modal';
import CountrySelect from '../components/CountrySelect';

const { width } = Dimensions.get('window');
const BG_HEIGHT = Math.round(width * 0.62);
const CARD_RADIUS = 26;

// Avatar
const AVATAR_OUTER = 180;
const RING_WIDTH = 13;
const RING_GAP = 18;
const AVATAR_INNER = AVATAR_OUTER - 2 * (RING_WIDTH + RING_GAP);

/** Seguro contra undefined en url */
function bust(u?: string, v?: number | string) {
  if (!u) return '';
  const hasQuery = u.indexOf('?') !== -1;
  return hasQuery ? `${u}&v=${v ?? Date.now()}` : `${u}?v=${v ?? Date.now()}`;
}

/** Normaliza el código a uno válido. Evita 'XX', vacío o strings raros. */
function normalizeCCA2(code?: string | null): CountryCode {
  const c = (code ?? '').toString().trim().toUpperCase();
  if (!c || c === 'XX' || c.length !== 2) return 'MX';
  return c as CountryCode;
}

// 🔸 Mapa de iconos por id de logro (ajústalo a tus assets)
const ACH_SRC: Record<string, ImageSourcePropType> = {
  logro_n1: require('../../assets/icons/logro_n11.webp'),
  logro_n2: require('../../assets/icons/logro_n2.webp'),
  logro_n3: require('../../assets/icons/logro_n3.webp'),
  forja_destino: require('../../assets/icons/logro_n11.webp'),
};
const DEFAULT_ACH = require('../../assets/icons/logro_n1.webp');

export default function PerfilScreen() {
  const user = auth.currentUser;
  const uid = user?.uid ?? '';

  const navigation = useNavigation<any>(); // 👈 para ir a Pagos

  // ===== estado =====
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [achievements, setAchievements] = useState<{ id: string; sub?: string }[]>([]);

  const [profile, setProfile] = useState<ProfileLive | null>(null);
  const [stats, setStats] = useState<ProfileLive['stats'] | null>(null);
  const [ranks, setRanks] = useState<Ranks>({ world: null, local: null });

  // modal editar nombre
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  // selector de país
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState<CountryCode>('MX');

  const onPickCover = () => {};
  const openEditName = () => {
    setNameDraft(profile?.displayName ?? '');
    setShowNameModal(true);
  };
  const submitEditName = async () => {
    try {
      if (!uid) return;
      const trimmed = nameDraft.trim();
      if (!trimmed) {
        Alert.alert('Nombre vacío', 'Escribe un nombre para continuar.');
        return;
      }
      await updateDisplayName(uid, trimmed);
      setShowNameModal(false);
    } catch (e: any) {
      Alert.alert('Ups', e?.message ?? 'No se pudo actualizar tu nombre.');
    }
  };

  const onPickAvatar = async () => {
    try {
      if (updating) return;
      setUpdating(true);
      const url = await pickAndSaveAvatar();
      if (url) setAvatarSrc(url);
    } catch (e: any) {
      Alert.alert('Ups', e?.message ?? 'No se pudo actualizar tu foto.');
    } finally {
      setUpdating(false);
    }
  };

  // 🔥 Suscripción ÚNICA al perfil (incluye stats y avatar)
  useEffect(() => {
    if (!uid) return;
    const unsub = streamProfile(uid, (piece) => {
      setProfile((prev) => ({ ...(prev ?? { displayName: '', stats: null }), ...piece }));
      if (piece.stats !== undefined) setStats(piece.stats ?? null);

      // avatar (preferencia: photoURL > photoBase64 > auth.photoURL)
      const url = (piece as any)?.photoURL ?? auth.currentUser?.photoURL ?? null;
      const b64 = (piece as any)?.photoBase64;
      const v = (piece as any)?.avatarUpdatedAt;
      if (url) setAvatarSrc(bust(url, v));
      else if (b64) setAvatarSrc(`data:image/jpeg;base64,${b64}`);
      else setAvatarSrc(null);

      // país visible
      if ((piece as any)?.countryCode) {
        setCountryCode(normalizeCCA2((piece as any).countryCode));
      }
    });
    return unsub;
  }, [uid]);

  // 🔥 Logros en tiempo real
  useEffect(() => {
    if (!uid) return;
    const colRef = collection(db, 'Usuarios', uid, 'logros');
    const q = query(colRef, orderBy('unlockedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, sub: d.id }));
      setAchievements(rows);
    });
    return () => unsub();
  }, [uid]);

  // 🏅 ranks
  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const r = await getRanks(uid);
        setRanks(r);
      } catch {
        // noop
      }
    })();
  }, [uid, stats?.points, profile?.countryCode]);

  // % meta semanal
  const weeklyText = useMemo(() => {
    if (!stats) return '0/0';
    const prog = stats.weeklyProgress ?? 0;
    const goal = stats.weeklyGoal ?? 0;
    return `${prog}/${goal}`;
  }, [stats?.weeklyProgress, stats?.weeklyGoal]);

  // Sonido al entrar
  const soundRef = useRef<Audio.Sound | null>(null);
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
          });
          const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/enter_profile.mp3'),
            { shouldPlay: true, volume: 0.6, isLooping: false },
          );
          if (!mounted) {
            await sound.unloadAsync();
            return;
          }
          soundRef.current = sound;
        } catch (e) {
          console.warn('Error reproduciendo sonido de perfil:', e);
        }
      })();

      return () => {
        mounted = false;
        if (soundRef.current) {
          soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      };
    }, []),
  );

  // Botón dorado: lo dejamos por si lo usas en otro lado
  const add50 = async () => {
    try {
      await awardXpCurrentUser(50, { source: 'premium_button' });
      Alert.alert('OK', 'Se agregaron +50 puntos.');
    } catch (e: any) {
      Alert.alert('Ups', e?.message ?? 'No se pudo sumar XP.');
    }
  };

  // Guardar país seleccionado (siempre válido)
  const saveCountry = async (cca2: CountryCode) => {
    try {
      if (!uid) return;
      const safe = normalizeCCA2(cca2);
      setCountryCode(safe);
      await updateDoc(doc(db, 'Usuarios', uid), { countryCode: safe });
      const r = await getRanks(uid);
      setRanks(r);
    } catch (e: any) {
      Alert.alert('Ups', e?.message ?? 'No se pudo actualizar tu país.');
    }
  };

  // Código seguro que mostramos / enviamos al picker
  const safeCCA2 = normalizeCCA2(profile?.countryCode ?? countryCode);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.cc}
        showsVerticalScrollIndicator={false}
      >
        {/* ====== FONDO MONTAÑAS ====== */}
        <TouchableOpacity activeOpacity={0.9} onPress={onPickCover}>
          <ImageBackground
            source={require('../../assets/images/profile_bg.webp')}
            style={styles.bg}
            imageStyle={styles.bgImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* ====== TARJETA BLANCA + HEADER ====== */}
        <View style={styles.card}>
          {/* Avatar superpuesto */}
          <View style={styles.avatarAbs}>
            <View style={styles.avatarOuter}>
              <ImageBackground
                source={require('../../assets/images/circulo_perfil.webp')}
                style={styles.avatarOuter}
                imageStyle={{ borderRadius: AVATAR_OUTER / 2 }}
                resizeMode="cover"
              >
                <View style={styles.avatarRing}>
                  <View style={styles.avatarClip}>
                    <Image
                      source={
                        avatarSrc
                          ? { uri: avatarSrc }
                          : require('../../assets/images/avatar_placeholder.webp')
                      }
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  </View>
                </View>
              </ImageBackground>

              {/* Botón de cámara */}
              <TouchableOpacity
                onPress={onPickAvatar}
                activeOpacity={0.9}
                style={styles.camBtn}
                disabled={updating}
              >
                <View style={styles.camBtnInner}>
                  <CameraIcon width={26} height={26} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Nombre + lapicito */}
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1} onPress={openEditName}>
              {profile?.displayName || 'Sin nombre'}
            </Text>
            <TouchableOpacity
              onPress={openEditName}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <EditIcon width={22} height={22} />
            </TouchableOpacity>
          </View>

          {/* Email */}
          <Text style={styles.email} numberOfLines={1}>
            {profile?.email || user?.email || ''}
          </Text>

          {/* País (cambiar) */}
          <TouchableOpacity
            style={styles.countryBtn}
            onPress={() => setShowCountryPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.countryTxt}>País: {safeCCA2} (cambiar)</Text>
          </TouchableOpacity>

          {/* Botón premium → ir a Pagos */}
          <TouchableOpacity
            style={styles.premiumBtn}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Pagos')}
          >
            <CrownIcon width={18} height={18} />
            <Text style={styles.premiumTxt}>Obtener premium</Text>
          </TouchableOpacity>

          {/* Stats + separadores */}
          <View style={styles.statsRow}>
            <Stat label="Puntos" value={`${stats?.points ?? 0}`} />
            <View style={styles.dividerWrap}>
              <Image source={dividerImg} style={styles.dividerIcon} resizeMode="contain" />
            </View>
            <Stat label="Nivel mundial" value={ranks.world ? `#${ranks.world}` : '…'} />
            <View style={styles.dividerWrap}>
              <Image source={dividerImg} style={styles.dividerIcon} resizeMode="contain" />
            </View>
            <Stat label="Nivel local" value={ranks.local ? `#${ranks.local}` : '…'} />
          </View>

          {/* ====== BLOQUE INFERIOR (4 TARJETAS) ====== */}
          <View style={styles.bottomWrap}>
            {/* Fila 1 */}
            <View style={styles.row}>
              {/* Meta semanal */}
              <Card>
                <Image
                  source={
                    require('../../assets/icons/achievement_bg2.webp') as ImageSourcePropType
                  }
                  style={styles.bgSoft}
                  resizeMode="cover"
                />
                <Text style={styles.cardTitle}>Meta semanal</Text>

                <View style={styles.metaRow}>
                  <Image
                    source={
                      require('../../assets/icons/icono_circular.webp') as ImageSourcePropType
                    }
                    style={styles.metaCircle}
                    resizeMode="contain"
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.metaBig}>{weeklyText}</Text>
                    <Text style={styles.metaLabel}>Racha de{'\n'}estudio</Text>
                  </View>
                </View>
              </Card>

              {/* Racha de estudio */}
              <Card>
                <Image
                  source={
                    require('../../assets/icons/achievement_bg2.webp') as ImageSourcePropType
                  }
                  style={styles.bgSoft}
                  resizeMode="cover"
                />
                <Text style={styles.cardTitle}>Racha de estudio</Text>

                <View style={styles.hScroll}>
                  <IconWithLabel
                    src={require('../../assets/icons/samurai.webp') as ImageSourcePropType}
                    label="Samurai"
                  />
                  <LevelPill text={`L${Math.max(1, Math.min(9, stats?.streakCount ?? 0))}`} />
                </View>
              </Card>
            </View>

            {/* Fila 2 */}
            <View style={styles.row}>
              {/* Logros — dinámico desde Firestore */}
              <Card>
                <Image
                  source={
                    require('../../assets/icons/achievement_bg2.webp') as ImageSourcePropType
                  }
                  style={styles.bgSoft}
                  resizeMode="cover"
                />
                <Text style={styles.cardTitle}>Logros</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hScroll}
                >
                  {achievements.length === 0 ? (
                    <Text style={styles.emptyAch}>
                      Aún no tienes logros — ¡comienza una actividad!
                    </Text>
                  ) : (
                    achievements.map((a, idx) => (
                      <Achievement
                        key={`${a.id}-${idx}`}
                        src={ACH_SRC[a.id] ?? DEFAULT_ACH}
                        sub={a.sub ?? a.id}
                      />
                    ))
                  )}
                </ScrollView>
              </Card>

              {/* Juegos (placeholder) */}
              <Card>
                <Image
                  source={
                    require('../../assets/icons/achievement_bg2.webp') as ImageSourcePropType
                  }
                  style={styles.bgSoft}
                  resizeMode="cover"
                />
                <Text style={styles.cardTitle}>Juegos</Text>

                <View style={styles.gamesRow}>
                  <Image
                    source={
                      require('../../assets/icons/juego_mapache.webp') as ImageSourcePropType
                    }
                    style={styles.gameIcon}
                    resizeMode="contain"
                  />
                  <View style={styles.pointsBadge}>
                    <Image
                      source={
                        require('../../assets/icons/juegos_puntos.webp') as ImageSourcePropType
                      }
                      style={styles.pointsImg}
                      resizeMode="contain"
                    />
                    <Text style={styles.pointsTxt}>+150</Text>
                  </View>
                </View>
              </Card>
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ===== Modal editar nombre ===== */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar nombre</Text>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Tu nombre"
              style={styles.modalInput}
              maxLength={40}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity
                onPress={() => setShowNameModal(false)}
                style={[styles.modalBtn, { backgroundColor: '#eee' }]}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitEditName}
                style={[styles.modalBtn, { backgroundColor: '#c9a23a' }]}
              >
                <Text style={{ fontWeight: '700' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== Selector de país ===== */}
      {showCountryPicker && (
        <CountrySelect
          visible
          onClose={() => setShowCountryPicker(false)}
          initialCountryCode={safeCCA2}
          onSelect={(cca2) => saveCountry(cca2)}
        />
      )}
    </SafeAreaView>
  );
}

/* —————— Subcomponentes —————— */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <ImageBackground
      source={require('../../assets/icons/fondo_decorativo.webp')}
      style={styles.cardInner}
      imageStyle={styles.cardInnerImg}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

function IconWithLabel({ src, label }: { src: ImageSourcePropType; label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Image source={src} style={styles.iconMid} resizeMode="contain" />
      <Text style={styles.smallLabel}>{label}</Text>
    </View>
  );
}

function LevelPill({ text, icon }: { text: string; icon?: ImageSourcePropType }) {
  return (
    <View style={styles.levelPill}>
      {icon ? <Image source={icon} style={styles.levelIcon} resizeMode="contain" /> : null}
      <Text style={styles.levelTxt}>{text}</Text>
    </View>
  );
}

function Achievement({ src, sub }: { src: ImageSourcePropType; sub: string }) {
  return (
    <View style={styles.achItem}>
      <Image source={src} style={styles.achIcon} resizeMode="contain" />
      <Text style={styles.achSub}>{sub}</Text>
    </View>
  );
}

/* —————— Estilos —————— */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { flex: 1 },
  cc: { paddingBottom: 16, backgroundColor: '#ffffff' },

  bg: { width: '100%', height: BG_HEIGHT, backgroundColor: '#fff' },
  bgImage: {},

  card: {
    marginTop: -CARD_RADIUS,
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    backgroundColor: '#fff',
    paddingTop: AVATAR_OUTER / 2 + 20,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },

  avatarAbs: {
    position: 'absolute',
    top: -AVATAR_OUTER / 2,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  avatarOuter: {
    width: AVATAR_OUTER,
    height: AVATAR_OUTER,
    borderRadius: AVATAR_OUTER / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarRing: {
    width: AVATAR_OUTER - 2 * RING_WIDTH,
    height: AVATAR_OUTER - 2 * RING_WIDTH,
    borderRadius: (AVATAR_OUTER - 2 * RING_WIDTH) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarClip: {
    width: AVATAR_INNER,
    height: AVATAR_INNER,
    borderRadius: AVATAR_INNER / 2,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  avatarImage: {
    width: AVATAR_INNER * 1.15,
    height: AVATAR_INNER * 1.15,
    marginLeft: -(AVATAR_INNER * 0.075),
    marginTop: -(AVATAR_INNER * 0.075),
  },
  camBtn: { position: 'absolute', right: 18, bottom: 18 },
  camBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  nameRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  name: { fontSize: 24, lineHeight: 30, textAlign: 'center', fontWeight: '800', maxWidth: '90%' },
  email: { marginTop: 2, textAlign: 'center', color: '#777' },

  countryBtn: {
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#f2efe9',
  },
  countryTxt: { color: '#5a4a33', fontWeight: '700' },

  premiumBtn: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: '#c9a23a',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumTxt: { color: '#1b1200', fontWeight: '800' },

  statsRow: {
    marginTop: 16,
    backgroundColor: '#f5efe6',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dividerWrap: { width: 16, alignItems: 'center', justifyContent: 'center' },
  dividerIcon: { width: 8, height: 40 },

  stat: { flex: 1, minWidth: 0, alignItems: 'center' },
  statLabel: { color: '#7b6d5a', marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '900' },

  bottomWrap: { marginTop: 16, gap: 14 },
  row: { flexDirection: 'row', gap: 14 },

  cardInner: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    overflow: 'hidden',
    minHeight: 150,
    justifyContent: 'flex-start',
  },
  cardInnerImg: { borderRadius: 20 },
  bgSoft: { ...StyleSheet.absoluteFillObject, opacity: 0.14 },

  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
    color: '#3b2b1b',
    textAlign: 'center',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  metaCircle: { width: 64, height: 64 },
  metaBig: { fontSize: 24, fontWeight: '900', color: '#6b1f1f' },
  metaLabel: { marginTop: 4, color: '#3b2b1b' },

  hScroll: { alignItems: 'center', gap: 10, paddingRight: 4 },

  iconMid: { width: 46, height: 46 },
  smallLabel: { marginTop: 4, fontSize: 12, color: '#3b2b1b' },

  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#efe2cf',
    borderWidth: 1,
    borderColor: '#caa378',
    gap: 6,
  },
  levelIcon: { width: 20, height: 20 },
  levelTxt: { fontWeight: '800', color: '#3b2b1b' },

  achItem: {
    width: 66,
    height: 66,
    borderRadius: 12,
    backgroundColor: '#f6ead7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achIcon: { width: 40, height: 40 },
  achSub: { textAlign: 'center', fontSize: 12, marginTop: 6, color: '#3b2b1b' },

  gamesRow: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center' },
  gameIcon: { width: 56, height: 56 },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e7f6ea',
  },
  pointsImg: { width: 20, height: 20 },
  pointsTxt: { color: '#2f7a3b', fontWeight: '800' },

  emptyAch: { color: '#6b6bb6', fontStyle: 'italic', paddingHorizontal: 8 },

  modalBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '86%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  modalRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
});

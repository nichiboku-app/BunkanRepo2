// src/screens/NoticiasScreen.tsx
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../config/firebaseConfig';

// 🎉 Confeti
import ConfettiCannon from 'react-native-confetti-cannon';

// ===== Tipo de usuario para ranking =====
type UserRank = {
  id: string;
  displayName: string;
  points: number;
  logrosCount: number;
  photoBase64?: string | null;
};

const DEFAULT_AVATAR = require('../../assets/images/avatar_formal.webp');
const BG_RANKING = require('../../assets/fondoranking.jpg');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function NoticiasScreen() {
  const [users, setUsers] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🎉 Confeti: se lanza cada vez que entras a la pantalla
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000); // 3 segundos de efecto

    return () => clearTimeout(timer);
  }, []);

  // 🔥 Escuchamos todos los usuarios ordenados por stats.points
  useEffect(() => {
    const ref = collection(db, 'Usuarios');
    const q = query(ref, orderBy('stats.points', 'desc'));

    const unsub = onSnapshot(
      q,
      async (snap) => {
        const baseList: UserRank[] = snap.docs.map((d) => {
          const data: any = d.data();
          const stats = data.stats || {};
          return {
            id: d.id,
            displayName: data.displayName || 'Estudiante',
            points: stats.points ?? 0,
            logrosCount: 0,
            photoBase64: data.photoBase64 ?? null,
          };
        });

        // Contar logros (Usuarios/{uid}/logros)
        const withLogros: UserRank[] = [];
        for (const u of baseList) {
          try {
            const logrosRef = collection(db, 'Usuarios', u.id, 'logros');
            const logrosSnap = await getDocs(logrosRef);
            withLogros.push({
              ...u,
              logrosCount: logrosSnap.size,
            });
          } catch (e) {
            console.warn('Error leyendo logros de usuario', u.id, e);
            withLogros.push(u);
          }
        }

        setUsers(withLogros);
        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        console.warn('Error leyendo ranking', err);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return unsub;
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const topThree = useMemo(() => users.slice(0, 3), [users]);
  const rest = useMemo(() => users.slice(3), [users]);

  const renderRow = ({
    item,
    index,
  }: {
    item: UserRank;
    index: number;
  }) => {
    const position = index + 4; // porque 1,2,3 son topThree
    const avatarSource = item.photoBase64
      ? { uri: `data:image/png;base64,${item.photoBase64}` }
      : DEFAULT_AVATAR;

    const zebra = index % 2 === 0;

    return (
      <View
        style={[
          styles.rowCard,
          zebra && { backgroundColor: 'rgba(255,255,255,0.9)' },
        ]}
      >
        <Text style={styles.rowPosition}>{position}</Text>

        <Image source={avatarSource} style={styles.rowAvatar} />

        <View style={{ flex: 1 }}>
          <Text style={styles.rowName} numberOfLines={1}>
            {item.displayName}
          </Text>
          <Text style={styles.rowSub}>
            {item.logrosCount} logros • {item.points} pts
          </Text>
        </View>

        <View style={styles.rowPointsBadge}>
          <Text style={styles.rowPointsText}>{item.points}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ImageBackground source={BG_RANKING} style={styles.bg} resizeMode="cover">
          <View style={styles.overlay} />
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#B80C1F" />
            <Text style={styles.loadingText}>Cargando clasificación…</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BG_RANKING} style={styles.bg} resizeMode="cover">
        {/* capa suave para que se lean bien los textos */}
        <View style={styles.overlay} />

        {/* Marco shikishi */}
        <View style={styles.whiteFrame}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER */}
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerJp}>ランキング</Text>
                <Text style={styles.headerTitle}>Clasificación Bunkan</Text>
                <Text style={styles.headerSubtitle}>
                  Puntos ganados por juegos, estudios y logros.
                </Text>
              </View>
              <View style={styles.headerSeal}>
                <Text style={styles.headerSealMain}>文</Text>
                <Text style={styles.headerSealSub}>Nichiboku</Text>
              </View>
            </View>

            {/* Cinta decorativa */}
            <View style={styles.ribbon}>
              <Text style={styles.ribbonText}>TOP 3 DEL MES</Text>
            </View>

            {/* PODIO TOP 3 */}
            {topThree.length === 0 ? (
              <Text style={styles.emptyText}>
                Aún no hay puntos registrados.{'\n'}
                ¡Sé el primero en conseguir logros!
              </Text>
            ) : (
              <>
                {/* Primer lugar, súper grande */}
                {topThree[0] && (
                  <LeaderBigCard user={topThree[0]} position={1} />
                )}

                {/* Segundo y tercero en mini tarjetas tipo podio */}
                <View style={styles.podiumRow}>
                  {topThree[1] && (
                    <PodiumMiniCard user={topThree[1]} position={2} />
                  )}
                  {topThree[2] && (
                    <PodiumMiniCard user={topThree[2]} position={3} />
                  )}
                </View>
              </>
            )}

            {/* DIVISOR PARA TABLA COMPLETA */}
            {rest.length > 0 && (
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Tabla completa</Text>
                <View style={styles.dividerLine} />
              </View>
            )}

            {/* RESTO DE LA TABLA */}
            {rest.length > 0 && (
              <View style={styles.listWrapper}>
                <FlatList
                  data={rest}
                  keyExtractor={(item) => item.id}
                  renderItem={renderRow}
                  scrollEnabled={false}
                />
              </View>
            )}
          </ScrollView>
        </View>

        {/* 🎉 CONFETI SOBRE TODO: versión "normalita" (180) */}
        {showConfetti && (
          <ConfettiCannon
            count={180}
            origin={{ x: SCREEN_WIDTH / 2, y: -10 }}
            fadeOut
          />
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

/* -------- Tarjeta gigante del primer lugar -------- */

type CardProps = {
  user: UserRank;
  position: 1 | 2 | 3;
};

function LeaderBigCard({ user, position }: CardProps) {
  const avatarSource = user.photoBase64
    ? { uri: `data:image/png;base64,${user.photoBase64}` }
    : DEFAULT_AVATAR;

  return (
    <View style={styles.leaderWrapper}>
      <View style={styles.leaderOuterShadow}>
        <View style={styles.leaderInnerCard}>
          {/* cinta superior */}
          <View style={styles.leaderTopRow}>
            <View style={styles.leaderChip}>
              <Text style={styles.leaderChipText}>No. {position}</Text>
            </View>
            <Text style={styles.leaderEmoji}>👑</Text>
          </View>

          {/* avatar con laureles */}
          <View style={styles.leaderAvatarBlock}>
            <Text style={styles.laurelLeft}>❬❬❬</Text>
            <View style={styles.leaderAvatarRing}>
              <Image source={avatarSource} style={styles.leaderAvatar} />
            </View>
            <Text style={styles.laurelRight}>❭❭❭</Text>
          </View>

          <Text style={styles.leaderName} numberOfLines={1}>
            {user.displayName}
          </Text>

          <Text style={styles.leaderPoints}>{user.points} pts</Text>
          <Text style={styles.leaderLogros}>{user.logrosCount} logros</Text>
        </View>
      </View>
    </View>
  );
}

/* -------- Tarjeta pequeña para 2º y 3º -------- */

function PodiumMiniCard({ user, position }: CardProps) {
  const avatarSource = user.photoBase64
    ? { uri: `data:image/png;base64,${user.photoBase64}` }
    : DEFAULT_AVATAR;

  const emoji = position === 2 ? '🥈' : '🥉';

  return (
    <View style={styles.podiumCard}>
      <View style={styles.podiumBadge}>
        <Text style={styles.podiumBadgeText}>{position}</Text>
      </View>
      <Text style={styles.podiumEmoji}>{emoji}</Text>
      <Image source={avatarSource} style={styles.podiumAvatar} />
      <Text style={styles.podiumName} numberOfLines={1}>
        {user.displayName}
      </Text>
      <Text style={styles.podiumPoints}>{user.points} pts</Text>
      <Text style={styles.podiumLogros}>{user.logrosCount} logros</Text>
    </View>
  );
}

/* -------- Estilos -------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  // Marco shikishi
  whiteFrame: {
    flex: 1,
    margin: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    backgroundColor: 'rgba(255,255,255,0.90)',
    overflow: 'hidden',
  },

  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#333',
    fontSize: 13,
  },

  // HEADER
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
  },
  headerLeft: { flex: 1 },
  headerJp: {
    fontSize: 16,
    color: '#B80C1F',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2A1A1A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7A5A5A',
    marginTop: 3,
  },
  headerSeal: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#B80C1F',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  headerSealMain: {
    fontSize: 22,
    color: '#B80C1F',
    fontWeight: '800',
  },
  headerSealSub: {
    fontSize: 9,
    color: '#B80C1F',
    marginTop: -2,
  },

  // Cinta decorativa
  ribbon: {
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#B80C1F',
  },
  ribbonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // LEADER BIG CARD
  leaderWrapper: {
    alignItems: 'center',
    marginTop: 6,
  },
  leaderOuterShadow: {
    borderRadius: 30,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  leaderInnerCard: {
    width: 280,
    borderRadius: 24,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: 'center',
  },
  leaderTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  leaderChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#F4E8D2',
  },
  leaderChipText: {
    fontSize: 11,
    color: '#6D4A1F',
    fontWeight: '700',
  },
  leaderEmoji: {
    fontSize: 20,
  },
  leaderAvatarBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  laurelLeft: {
    fontSize: 20,
    color: '#D1AE52',
    marginRight: 6,
  },
  laurelRight: {
    fontSize: 20,
    color: '#D1AE52',
    marginLeft: 6,
  },
  leaderAvatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#D8B65B',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E5',
  },
  leaderAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  leaderName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
    marginTop: 4,
  },
  leaderPoints: {
    fontSize: 20,
    fontWeight: '900',
    color: '#B80C1F',
    marginTop: 4,
  },
  leaderLogros: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },

  // PODIO 2º y 3º
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 12,
    paddingHorizontal: 18,
  },
  podiumCard: {
    width: 130,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  podiumBadge: {
    position: 'absolute',
    top: 6,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#B80C1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  podiumEmoji: {
    position: 'absolute',
    top: 4,
    right: 8,
    fontSize: 18,
  },
  podiumAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginTop: 6,
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
  },
  podiumPoints: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B80C1F',
    marginTop: 2,
  },
  podiumLogros: {
    fontSize: 11,
    color: '#777',
    marginTop: 1,
  },

  // DIVISOR / LISTA
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 16,
    marginBottom: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#7A5A5A',
  },

  listWrapper: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  // Filas de tabla
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(253,248,244,0.96)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },
  rowPosition: {
    width: 24,
    fontSize: 14,
    fontWeight: '700',
    color: '#B80C1F',
  },
  rowAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
  },
  rowName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
  },
  rowSub: {
    fontSize: 11,
    color: '#777',
    marginTop: 1,
  },
  rowPointsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FCE6EA',
    marginLeft: 6,
  },
  rowPointsText: {
    fontSize: 12,
    color: '#B80C1F',
    fontWeight: '700',
  },
});

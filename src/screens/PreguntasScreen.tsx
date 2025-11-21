// src/screens/NoticiasNHKScreen.tsx
import {
  addDoc,
  collection,
  deleteDoc, // 👈 NUEVO
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebaseConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Fondo estilo ola japonesa (puedes cambiarlo si quieres otro)
const BG_NEWS = require('../../assets/fondoranking.jpg');

// 👑 UID admin simple (el mismo de isSuperUser en las reglas)
const ADMIN_UID = '6cvsTORtR3ShBN7ZCLlBjAkSo3p1';

type SchoolNews = {
  id: string;
  country: 'jp' | 'mx';
  titleJa: string;
  titleEs: string;
  bodyJa: string;
  bodyEs: string;
  imageUrl?: string | null;
  createdAt: Date | null;
};

export default function NoticiasNHKScreen() {
  const uid = auth.currentUser?.uid ?? null;
  const isAdminUser = uid === ADMIN_UID;

  const [news, setNews] = useState<SchoolNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal detalle
  const [selected, setSelected] = useState<SchoolNews | null>(null);

  // Modal admin crear noticia
  const [modalVisible, setModalVisible] = useState(false);
  const [country, setCountry] = useState<'jp' | 'mx'>('jp');
  const [titleJa, setTitleJa] = useState('');
  const [titleEs, setTitleEs] = useState('');
  const [bodyJa, setBodyJa] = useState('');
  const [bodyEs, setBodyEs] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // ========= Escuchar noticias =========
  useEffect(() => {
    const ref = collection(db, 'schoolNews');
    const q = query(ref, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: SchoolNews[] = snap.docs.map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            country: data.country === 'mx' ? 'mx' : 'jp',
            titleJa: data.titleJa ?? '',
            titleEs: data.titleEs ?? '',
            bodyJa: data.bodyJa ?? '',
            bodyEs: data.bodyEs ?? '',
            imageUrl: data.imageUrl ?? null,
            createdAt: data.createdAt?.toDate?.() ?? null,
          };
        });
        setNews(list);
        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        console.warn('Error leyendo schoolNews', err);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsub();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const newsJp = useMemo(
    () => news.filter((n) => n.country === 'jp').slice(0, 5),
    [news]
  );
  const newsMx = useMemo(
    () => news.filter((n) => n.country === 'mx').slice(0, 5),
    [news]
  );

  // ========= Guardar noticia (admin) =========
  const handleSaveNews = async () => {
    if (!uid || !isAdminUser) {
      setModalVisible(false);
      return;
    }

    const tJa = titleJa.trim();
    const tEs = titleEs.trim();
    const bJa = bodyJa.trim();
    const bEs = bodyEs.trim();

    if (!tJa || !tEs || !bJa || !bEs) {
      alert('Por favor llena los textos en japonés y español.');
      return;
    }

    try {
      await addDoc(collection(db, 'schoolNews'), {
        country,
        titleJa: tJa,
        titleEs: tEs,
        bodyJa: bJa,
        bodyEs: bEs,
        imageUrl: imageUrl.trim() || null,
        createdAt: serverTimestamp(),
      });

      setTitleJa('');
      setTitleEs('');
      setBodyJa('');
      setBodyEs('');
      setImageUrl('');
      setCountry('jp');
      setModalVisible(false);
    } catch (e) {
      console.warn('Error creando noticia', e);
      alert('No se pudo guardar la noticia.');
    }
  };

  // ========= Borrar noticia seleccionada (admin) =========
  const handleDeleteSelectedNews = () => {
    if (!uid || !isAdminUser || !selected) return;

    Alert.alert(
      'Eliminar noticia',
      '¿Seguro que quieres eliminar esta noticia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'schoolNews', selected.id));
              setSelected(null);
            } catch (e) {
              console.warn('Error borrando noticia', e);
              alert('No se pudo borrar la noticia.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ImageBackground source={BG_NEWS} style={styles.bg} resizeMode="cover">
          <View style={styles.overlay} />
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#B80C1F" />
            <Text style={styles.loadingText}>Cargando noticias…</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BG_NEWS} style={styles.bg} resizeMode="cover">
        <View style={styles.overlay} />

        <View style={styles.paper}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* HEADER */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerJp}>ニュース</Text>
                <Text style={styles.headerTitle}>Noticias Bunkan Nichiboku</Text>
                <Text style={styles.headerSubtitle}>
                  Breves de Japón y México, con traducción japonés–español.
                </Text>
              </View>
              <View style={styles.headerLogoBox}>
                <Text style={styles.headerLogoMain}>文日</Text>
                <Text style={styles.headerLogoSub}>SCHOOL NEWS</Text>
              </View>
            </View>

            {/* JAPÓN */}
            <SectionHeader jp="日本から" es="Desde Japón" />
            {newsJp.length === 0 ? (
              <Text style={styles.emptyText}>Aún no hay noticias de Japón.</Text>
            ) : (
              <HorizontalCarousel
                data={newsJp}
                onPressItem={setSelected}
                country="jp"
              />
            )}

            {/* MÉXICO */}
            <SectionHeader
              jp="メキシコから"
              es="Desde México"
              style={{ marginTop: 18 }}
            />
            {newsMx.length === 0 ? (
              <Text style={styles.emptyText}>Aún no hay noticias de México.</Text>
            ) : (
              <HorizontalCarousel
                data={newsMx}
                onPressItem={setSelected}
                country="mx"
              />
            )}

            <View style={{ height: 28 }} />
          </ScrollView>
        </View>

        {/* FAB admin */}
        {isAdminUser && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.fabText}>＋</Text>
          </TouchableOpacity>
        )}

        {/* MODAL DETALLE NOTICIA */}
        <Modal
          visible={!!selected}
          transparent
          animationType="fade"
          onRequestClose={() => setSelected(null)}
        >
          <View style={styles.detailOverlay}>
            <View style={styles.detailCard}>
              <ScrollView
                contentContainerStyle={{ paddingBottom: 12 }}
                showsVerticalScrollIndicator={false}
              >
                {selected?.imageUrl ? (
                  <Image
                    source={{ uri: selected.imageUrl }}
                    style={styles.detailImage}
                  />
                ) : null}

                <View style={styles.detailPillRow}>
                  <View style={styles.cardPill}>
                    <Text style={styles.cardPillText}>
                      {selected?.country === 'jp' ? '🇯🇵 Japón' : '🇲🇽 México'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.detailTitleJa}>{selected?.titleJa}</Text>
                <Text style={styles.detailTitleEs}>{selected?.titleEs}</Text>

                <Text style={styles.cardLabel}>日本語</Text>
                <Text style={styles.detailBody}>{selected?.bodyJa}</Text>

                <Text style={[styles.cardLabel, { marginTop: 10 }]}>
                  Español
                </Text>
                <Text style={styles.detailBody}>{selected?.bodyEs}</Text>
              </ScrollView>

              <View style={styles.detailButtonsRow}>
                {isAdminUser && (
                  <TouchableOpacity
                    style={[
                      styles.detailCloseBtn,
                      { backgroundColor: '#c1121f', marginRight: 8 },
                    ]}
                    onPress={handleDeleteSelectedNews}
                  >
                    <Text style={styles.detailCloseText}>Eliminar</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.detailCloseBtn}
                  onPress={() => setSelected(null)}
                >
                  <Text style={styles.detailCloseText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL NUEVA NOTICIA (ADMIN) */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 10 }}
              >
                <Text style={styles.modalTitle}>Nueva noticia</Text>
                <Text style={styles.modalHint}>
                  Textos breves, como NHK Easy. Se mostrará a todos los alumnos.
                </Text>

                {/* País */}
                <Text style={styles.modalLabel}>País</Text>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      country === 'jp' && styles.chipActive,
                    ]}
                    onPress={() => setCountry('jp')}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        country === 'jp' && styles.chipTextActive,
                      ]}
                    >
                      🇯🇵 Japón
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      country === 'mx' && styles.chipActive,
                    ]}
                    onPress={() => setCountry('mx')}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        country === 'mx' && styles.chipTextActive,
                      ]}
                    >
                      🇲🇽 México
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Títulos */}
                <Text style={styles.modalLabel}>Título en japonés</Text>
                <TextInput
                  style={styles.input}
                  value={titleJa}
                  onChangeText={setTitleJa}
                  placeholder="例：日本で新しい日本語イベント"
                  placeholderTextColor="#aaa"
                />

                <Text style={styles.modalLabel}>Título en español</Text>
                <TextInput
                  style={styles.input}
                  value={titleEs}
                  onChangeText={setTitleEs}
                  placeholder="Ej: Nuevo evento de japonés en Japón"
                  placeholderTextColor="#aaa"
                />

                {/* Cuerpo JP / ES */}
                <Text style={styles.modalLabel}>Noticia en japonés</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={bodyJa}
                  onChangeText={setBodyJa}
                  placeholder="1〜2パラグラフで短く書いてください。"
                  placeholderTextColor="#aaa"
                  multiline
                />

                <Text style={styles.modalLabel}>Noticia en español</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={bodyEs}
                  onChangeText={setBodyEs}
                  placeholder="Escribe 1 o 2 párrafos cortos en español."
                  placeholderTextColor="#aaa"
                  multiline
                />

                {/* Imagen opcional */}
                <Text style={styles.modalLabel}>URL de imagen (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  placeholder="https://... (si quieres ilustrar la noticia)"
                  placeholderTextColor="#aaa"
                />

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={[styles.modalBtn, { backgroundColor: '#eee' }]}
                  >
                    <Text>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveNews}
                    style={[styles.modalBtn, { backgroundColor: '#000' }]}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>
                      Guardar
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}

/* ======= Carrusel horizontal ======= */

function HorizontalCarousel({
  data,
  onPressItem,
  country,
}: {
  data: SchoolNews[];
  onPressItem: (item: SchoolNews) => void;
  country: 'jp' | 'mx';
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carouselContent}
      snapToAlignment="start"
      decelerationRate="fast"
      snapToInterval={SCREEN_WIDTH * 0.78}
    >
      {data.map((item, index) => (
        <NewsCard
          key={item.id}
          item={item}
          index={index}
          onPress={() => onPressItem(item)}
          country={country}
        />
      ))}
    </ScrollView>
  );
}

/* ======= Tarjeta noticia (animada) ======= */

function NewsCard({
  item,
  index,
  onPress,
  country,
}: {
  item: SchoolNews;
  index: number;
  onPress: () => void;
  country: 'jp' | 'mx';
}) {
  const scale = React.useRef(new Animated.Value(0.9)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 380,
        delay: index * 90,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        delay: index * 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, scale]);

  const countryLabel = country === 'jp' ? 'Japón' : 'México';
  const countryEmoji = country === 'jp' ? '🇯🇵' : '🇲🇽';

  const shortBodyEs =
    item.bodyEs.length > 120
      ? item.bodyEs.slice(0, 120).trim() + '…'
      : item.bodyEs;

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={onPress}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Text style={styles.cardImagePlaceholderText}>Bunkan News</Text>
          </View>
        )}

        <View style={styles.cardHeaderRow}>
          <View style={styles.cardPill}>
            <Text style={styles.cardPillText}>
              {countryEmoji} {countryLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitleJa} numberOfLines={1}>
          {item.titleJa}
        </Text>
        <Text style={styles.cardTitleEs} numberOfLines={2}>
          {item.titleEs}
        </Text>

        <Text style={styles.cardLabel}>Español</Text>
        <Text style={styles.cardBodyEs} numberOfLines={3}>
          {shortBodyEs}
        </Text>

        <Text style={styles.cardHint}>Tocar para ver detalles y japonés</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ======= Header sección ======= */

function SectionHeader({
  jp,
  es,
  style,
}: {
  jp: string;
  es: string;
  style?: any;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionBullet} />
      <View>
        <Text style={styles.sectionJp}>{jp}</Text>
        <Text style={styles.sectionEs}>{es}</Text>
      </View>
    </View>
  );
}

/* ======= Estilos ======= */

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
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  paper: {
    flex: 1,
    margin: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.97)',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'android' ? 10 : 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },

  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#fff',
    fontSize: 13,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerJp: {
    fontSize: 16,
    color: '#B80C1F',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerLogoBox: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#B80C1F',
    alignItems: 'center',
  },
  headerLogoMain: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  headerLogoSub: {
    color: '#fff',
    fontSize: 9,
    marginTop: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  sectionBullet: {
    width: 3,
    height: 26,
    borderRadius: 2,
    backgroundColor: '#B80C1F',
    marginRight: 8,
  },
  sectionJp: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  sectionEs: {
    fontSize: 11,
    color: '#777',
  },

  emptyText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },

  // Carrusel
  carouselContent: {
    paddingVertical: 4,
    paddingRight: 10,
  },
  cardOuter: {
    width: SCREEN_WIDTH * 0.78,
    marginRight: 12,
  },

  // Tarjeta
  card: {
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardImagePlaceholder: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImagePlaceholderText: {
    fontSize: 12,
    color: '#999',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#F4E5E7',
  },
  cardPillText: {
    fontSize: 10,
    color: '#B80C1F',
    fontWeight: '700',
  },
  cardTitleJa: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
  },
  cardTitleEs: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 11,
    color: '#B80C1F',
    fontWeight: '700',
  },
  cardBodyEs: {
    fontSize: 12,
    color: '#333',
    marginTop: 2,
  },
  cardHint: {
    marginTop: 6,
    fontSize: 10,
    color: '#888',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 30,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 30,
  },

  // Modal detalle
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  detailCard: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 18,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  detailImage: {
    width: '100%',
    height: 190,
    borderRadius: 14,
    marginBottom: 8,
  },
  detailPillRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 4,
  },
  detailTitleJa: {
    fontSize: 15,
    fontWeight: '800',
    color: '#222',
  },
  detailTitleEs: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
  },
  detailBody: {
    fontSize: 13,
    color: '#333',
    marginTop: 2,
  },
  detailButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  detailCloseBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#000',
  },
  detailCloseText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Modal admin
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    width: '100%',
    maxHeight: '92%',
    borderRadius: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
  },
  modalHint: {
    fontSize: 11,
    color: '#777',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 6,
    marginBottom: 2,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  chipText: {
    fontSize: 12,
    color: '#555',
  },
  chipTextActive: {
    color: '#fff',
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 13,
    color: '#222',
  },
  inputMultiline: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
  },
});

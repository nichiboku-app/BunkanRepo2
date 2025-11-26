// src/screens/Notifications.tsx
import { useNavigation } from '@react-navigation/native';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth, db } from '../config/firebaseConfig';

const BG = require('../../assets/chat/chat_bg.jpg');

// 👇 Esquema de notificación
type NotificationItem = {
  id: string;
  actorId: string;
  actorName: string;
  actorAvatar?: string | null;
  type: 'like' | 'comment' | 'chat';
  source: 'bunkagram' | 'chat';
  preview: string;
  createdAt: Date;
  read: boolean;
};

// 🔹 "hace 2h", "3d", etc.
function timeAgo(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffSec < 60) return 'Ahora';
  if (diffMin < 60) return `${diffMin} min`;
  if (diffH < 24) return `${diffH} h`;
  return `${diffD} d`;
}

export default function Notifications() {
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!uid) return;

    const ref = collection(db, 'notificationsGlobal');
    const q = query(ref, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snap) => {
      const list: NotificationItem[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          actorId: data.actorId,
          actorName: data.actorName || 'Estudiante',
          actorAvatar: data.actorAvatar ?? null,
          type: data.type ?? 'chat',
          source: data.source ?? 'chat',
          preview: data.preview ?? '',
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          read: data.read ?? false,
        };
      });
      setNotifications(list);
      setRefreshing(false);
    });

    return unsub;
  }, [uid]);

  // Pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 350);
  };

  // 👉 Al tocar una notificación:
  // - la marcamos read:true
  // - navegamos a la pantalla correspondiente
  const handlePressNotification = async (item: NotificationItem) => {
    // 1) Optimista en UI
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );

    // 2) Actualizar en Firestore
    try {
      await updateDoc(doc(db, 'notificationsGlobal', item.id), {
        read: true,
      });
    } catch (e) {
      console.warn('Error marcando notificación como leída', e);
    }

    // 3) Navegar según origen
    const parent = navigation.getParent?.();

    if (item.source === 'chat') {
      if (parent) {
        parent.navigate('ChatOnboarding' as never);
      } else {
        navigation.navigate('ChatOnboarding' as never);
      }
    } else if (item.source === 'bunkagram') {
      if (parent) {
        parent.navigate('Bunkagram' as never);
      } else {
        navigation.navigate('Bunkagram' as never);
      }
    }
  };

  // Separamos nuevas y anteriores
  const newNotifs = notifications.filter((n) => !n.read);
  const earlierNotifs = notifications.filter((n) => n.read);

  // 👉 mostrar hasta 100 notificaciones anteriores
  const earlierNotifsLimited = earlierNotifs.slice(0, 100);

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const avatarSource = item.actorAvatar
      ? { uri: `data:image/png;base64,${item.actorAvatar}` }
      : require('../../assets/images/avatar_formal.webp');

    let body = item.preview;
    if (item.source === 'bunkagram' && item.type === 'like') {
      body = `le dio like a tu post: ${item.preview}`;
    } else if (item.source === 'bunkagram' && item.type === 'comment') {
      body = `comentó: ${item.preview}`;
    } else if (item.source === 'chat' && item.type === 'chat') {
      body = item.preview;
    }

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() => handlePressNotification(item)}
      >
        <Image source={avatarSource} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowText}>
            <Text style={styles.rowName}>{item.actorName}</Text>{' '}
            {body}
          </Text>
          <Text style={styles.rowTime}>{timeAgo(item.createdAt)}</Text>
        </View>

        {/* Punto si no está leída */}
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={BG} style={styles.bg}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
        </View>

        <FlatList
          ListHeaderComponent={
            <View>
              {newNotifs.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Nuevas</Text>
                  {newNotifs.map((n) => (
                    <View key={n.id}>{renderItem({ item: n })}</View>
                  ))}
                  <Text style={styles.sectionTitle}>Anteriores</Text>
                </>
              )}

              {newNotifs.length === 0 && (
                <Text style={styles.sectionTitle}>Anteriores</Text>
              )}
            </View>
          }
          data={earlierNotifsLimited}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2B1C1C',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FDF2F2',
    marginBottom: 6,
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 4,
  },
  // 🔴 Caja roja para cada notificación
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#C7081F', // rojo
    borderWidth: 1,
    borderColor: '#7E0D18',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  rowText: {
    fontSize: 13,
    color: '#FFFFFF', // letras blancas
  },
  rowName: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rowTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF', // puntito blanco
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#7E0D18',
  },
});

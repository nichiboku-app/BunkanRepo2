// src/screens/Bunkagram.tsx
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth, db } from '../config/firebaseConfig';

const BG = require('../../assets/chat/chat_bg.jpg'); // puedes cambiar el fondo

// 🔊 Sonidos locales (asegúrate de que existan estos archivos)
const SUBIDA_SOUND = require('../../assets/audio/subida.mp3');
const CORAZON_SOUND = require('../../assets/audio/corazon.mp3');

type BunkagramPost = {
  id: string;
  userId: string;
  displayName: string;
  avatarBase64?: string | null;
  imageBase64?: string | null;
  videoUrl?: string | null;
  caption?: string;
  createdAt: Date;
  likeCount: number;
  likedBy: string[];
};

type Comment = {
  id: string;
  userId: string;
  displayName: string;
  avatarBase64?: string | null;
  text: string;
  createdAt: Date;
};

// 🔹 Helper: obtener thumbnail de YouTube si la URL lo es
function getVideoThumbnailUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Soporta URLs tipo:
  // https://www.youtube.com/watch?v=VIDEOID
  // https://youtu.be/VIDEOID
  const ytMatch =
    trimmed.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);

  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }

  // Para otros proveedores podrías usar un placeholder
  return null;
}

// 🔔 Helper para crear notificaciones por usuario (no globales)
const createNotification = async (params: {
  toUserId: string;
  fromUserId: string;
  fromDisplayName: string;
  fromAvatarBase64: string | null;
  type: 'like' | 'comment';
  source: 'bunkagram' | 'chat';
  text: string;
}) => {
  const {
    toUserId,
    fromUserId,
    fromDisplayName,
    fromAvatarBase64,
    type,
    source,
    text,
  } = params;

  try {
    await addDoc(collection(db, 'notifications', toUserId, 'items'), {
      toUserId,
      fromUserId,
      fromDisplayName,
      fromAvatarBase64,
      type,
      source,
      text,
      createdAt: serverTimestamp(),
      read: false,
    });
  } catch (e) {
    console.warn('Error creando notificación (por usuario)', e);
  }
};

export default function Bunkagram() {
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid;

  const [profile, setProfile] = useState<{
    displayName: string;
    photoBase64?: string | null;
  } | null>(null);

  const [posts, setPosts] = useState<BunkagramPost[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Tipo de post: imagen o video
  const [postType, setPostType] = useState<'image' | 'video' | null>(null);

  // Sheet de opciones (+)
  const [showPostTypeModal, setShowPostTypeModal] = useState(false);

  // Modal para nuevo post (imagen o video)
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostImageBase64, setNewPostImageBase64] = useState<string | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newPostCaption, setNewPostCaption] = useState('');

  // Comentarios
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BunkagramPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  // 🔊 Refs para sonidos
  const subidaSoundRef = useRef<Audio.Sound | null>(null);
  const corazonSoundRef = useRef<Audio.Sound | null>(null);

  // Perfil del usuario
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'Usuarios', uid), (snap) => {
      const data = snap.data() || {};
      setProfile({
        displayName: data.displayName || 'Estudiante',
        photoBase64: data.photoBase64 || null,
      });
    });
    return unsub;
  }, [uid]);

  // 🔊 Cargar sonidos al montar
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { sound: s1 } = await Audio.Sound.createAsync(SUBIDA_SOUND);
        const { sound: s2 } = await Audio.Sound.createAsync(CORAZON_SOUND);

        if (!isMounted) {
          await s1.unloadAsync();
          await s2.unloadAsync();
          return;
        }

        subidaSoundRef.current = s1;
        corazonSoundRef.current = s2;
      } catch (e) {
        console.warn('Error cargando sonidos de Bunkagram', e);
      }
    })();

    return () => {
      isMounted = false;
      if (subidaSoundRef.current) {
        subidaSoundRef.current.unloadAsync().catch(() => {});
      }
      if (corazonSoundRef.current) {
        corazonSoundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const playSubida = async () => {
    try {
      const s = subidaSoundRef.current;
      if (!s) return;
      await s.replayAsync();
    } catch (e) {
      console.warn('Error reproduciendo sonido de subida', e);
    }
  };

  const playCorazon = async () => {
    try {
      const s = corazonSoundRef.current;
      if (!s) return;
      await s.replayAsync();
    } catch (e) {
      console.warn('Error reproduciendo sonido de corazón', e);
    }
  };

  // Suscribirse a posts de los últimos 15 días
  useEffect(() => {
    const now = Date.now();
    const fifteenDaysMs = 15 * 24 * 60 * 60 * 1000;
    const cutoff = new Date(now - fifteenDaysMs);

    const q = query(
      collection(db, 'bunkagramPosts'),
      where('createdAt', '>=', cutoff),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: BunkagramPost[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          userId: data.userId,
          displayName: data.displayName || 'Estudiante',
          avatarBase64: data.avatarBase64 ?? null,
          imageBase64: data.imageBase64 ?? null,
          videoUrl: data.videoUrl ?? null,
          caption: data.caption ?? '',
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          likeCount: data.likeCount ?? 0,
          likedBy: data.likedBy ?? [],
        };
      });
      setPosts(list);
    });

    return unsub;
  }, []);

  // Abrir modal de comentarios de un post
  const openComments = (post: BunkagramPost) => {
    setSelectedPost(post);
    setShowCommentsModal(true);

    const commentsRef = collection(db, 'bunkagramPosts', post.id, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    const unsub = onSnapshot(q, (snap) => {
      const list: Comment[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          userId: data.userId,
          displayName: data.displayName || 'Estudiante',
          avatarBase64: data.avatarBase64 ?? null,
          text: data.text || '',
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
        };
      });
      setComments(list);
    });

    return unsub;
  };

  // Opción FAB: elegir tipo de post
  const openPostOptions = () => {
    setShowPostTypeModal(true);
  };

  // 👉 Elegir "Subir foto"
  const chooseImagePost = async () => {
    setShowPostTypeModal(false);

    if (!uid) return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      console.warn('Permiso denegado para galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
      aspect: [4, 5],
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    if (!asset.base64) {
      console.warn('No se obtuvo base64 de la imagen');
      return;
    }

    setPostType('image');
    setNewPostImageBase64(asset.base64);
    setNewVideoUrl('');
    setNewPostCaption('');
    setShowNewPostModal(true);
  };

  // 👉 Elegir "Publicar video"
  const chooseVideoPost = () => {
    setShowPostTypeModal(false);
    setPostType('video');
    setNewPostImageBase64(null);
    setNewVideoUrl('');
    setNewPostCaption('');
    setShowNewPostModal(true);
  };

  // Guardar post en Firestore (foto o video) + notificación GLOBAL + 🔊 sonido subida
  const handleCreatePost = async () => {
    if (!uid || !profile || !postType) return;

    try {
      setIsUploading(true);

      const now = Date.now();
      const fifteenDaysMs = 15 * 24 * 60 * 60 * 1000;
      const expireAt = new Date(now + fifteenDaysMs);

      const caption = newPostCaption.trim();
      const captionSnippet =
        caption.length > 40 ? caption.slice(0, 40) + '…' : caption;

      const basePreview =
        postType === 'image'
          ? 'publicó una nueva foto en Bunkagram.'
          : 'compartió un nuevo video en Bunkagram.';

      // 1️⃣ Crear el post
      if (postType === 'image') {
        if (!newPostImageBase64) return;

        await addDoc(collection(db, 'bunkagramPosts'), {
          userId: uid,
          displayName: profile.displayName,
          avatarBase64: profile.photoBase64 ?? null,
          imageBase64: newPostImageBase64,
          videoUrl: null,
          caption,
          createdAt: serverTimestamp(),
          likeCount: 0,
          likedBy: [],
          expireAt,
        });
      } else if (postType === 'video') {
        const url = newVideoUrl.trim();
        if (!url) {
          console.warn('Debes pegar un link de video');
          return;
        }

        await addDoc(collection(db, 'bunkagramPosts'), {
          userId: uid,
          displayName: profile.displayName,
          avatarBase64: profile.photoBase64 ?? null,
          imageBase64: null,
          videoUrl: url,
          caption,
          createdAt: serverTimestamp(),
          likeCount: 0,
          likedBy: [],
          expireAt,
        });
      }

      // 2️⃣ Notificación GLOBAL para el feed de notificaciones
      try {
        await addDoc(collection(db, 'notificationsGlobal'), {
          actorId: uid,
          actorName: profile.displayName,
          actorAvatar: profile.photoBase64 ?? null,
          type: 'comment', // usamos 'comment' como "actividad en Bunkagram"
          source: 'bunkagram',
          preview: captionSnippet
            ? `${basePreview} ${captionSnippet}`
            : basePreview,
          createdAt: serverTimestamp(),
          read: false,
        });
      } catch (e) {
        console.warn('Error creando notificación global de post', e);
      }

      // 🔊 3️⃣ Sonido de subida
      playSubida();

      // 4️⃣ Limpiar estado / cerrar modal
      setShowNewPostModal(false);
      setNewPostImageBase64(null);
      setNewVideoUrl('');
      setNewPostCaption('');
      setPostType(null);
    } catch (e) {
      console.warn('Error creando post de Bunkagram', e);
    } finally {
      setIsUploading(false);
    }
  };

  // Likes (con notificación por usuario + global + 🔊 sonido corazón)
  const toggleLike = async (post: BunkagramPost) => {
    if (!uid || !profile) return;

    const ref = doc(db, 'bunkagramPosts', post.id);
    const hasLiked = post.likedBy.includes(uid);

    try {
      await updateDoc(ref, {
        likedBy: hasLiked ? arrayRemove(uid) : arrayUnion(uid),
        likeCount: increment(hasLiked ? -1 : 1),
      });

      // 🔊 Sonido SOLO cuando es un nuevo like (no al quitar like)
      if (!hasLiked) {
        playCorazon();
      }

      // 🔔 Notificación SOLO cuando es un like nuevo y no es tu propio post
      if (!hasLiked && post.userId !== uid) {
        // Notificación específica al dueño del post
        await createNotification({
          toUserId: post.userId,
          fromUserId: uid,
          fromDisplayName: profile.displayName,
          fromAvatarBase64: profile.photoBase64 ?? null,
          type: 'like',
          source: 'bunkagram',
          text: 'le dio like a tu publicación.',
        });

        // Notificación GLOBAL para el feed
        try {
          await addDoc(collection(db, 'notificationsGlobal'), {
            actorId: uid,
            actorName: profile.displayName,
            actorAvatar: profile.photoBase64 ?? null,
            type: 'like',
            source: 'bunkagram',
            preview: 'le dio like a una publicación en Bunkagram.',
            createdAt: serverTimestamp(),
            read: false,
          });
        } catch (e) {
          console.warn('Error creando notificación global de like', e);
        }
      }
    } catch (e) {
      console.warn('Error al actualizar like', e);
    }
  };

  // Enviar comentario (con notificación por usuario + global)
  const handleSendComment = async () => {
    if (!uid || !selectedPost || !profile) return;
    const text = newComment.trim();
    if (!text) return;

    try {
      const commentsRef = collection(
        db,
        'bunkagramPosts',
        selectedPost.id,
        'comments'
      );
      await addDoc(commentsRef, {
        userId: uid,
        displayName: profile.displayName,
        avatarBase64: profile.photoBase64 ?? null,
        text,
        createdAt: serverTimestamp(),
      });
      setNewComment('');

      // 🔔 Notificación al dueño del post (si no eres tú)
      if (selectedPost.userId !== uid) {
        const snippet = text.length > 40 ? text.slice(0, 40) + '…' : text;

        // Notificación específica al dueño del post
        await createNotification({
          toUserId: selectedPost.userId,
          fromUserId: uid,
          fromDisplayName: profile.displayName,
          fromAvatarBase64: profile.photoBase64 ?? null,
          type: 'comment',
          source: 'bunkagram',
          text: `comentó en tu publicación: "${snippet}"`,
        });

        // Notificación GLOBAL para el feed
        try {
          await addDoc(collection(db, 'notificationsGlobal'), {
            actorId: uid,
            actorName: profile.displayName,
            actorAvatar: profile.photoBase64 ?? null,
            type: 'comment',
            source: 'bunkagram',
            preview: `comentó en un post: "${snippet}"`,
            createdAt: serverTimestamp(),
            read: false,
          });
        } catch (e) {
          console.warn('Error creando notificación global de comentario', e);
        }
      }
    } catch (e) {
      console.warn('Error enviando comentario', e);
    }
  };

  // Renderizar caption con links clicables
  const renderCaptionWithLinks = (caption: string) => {
    const parts = caption.split(/\s+/);

    return (
      <Text style={styles.captionText}>
        {parts.map((part, index) => {
          const isUrl = /^https?:\/\//i.test(part);
          if (!isUrl) {
            return part + ' ';
          }
          return (
            <Text
              key={index}
              style={styles.captionLink}
              onPress={() => Linking.openURL(part)}
            >
              {part + ' '}
            </Text>
          );
        })}
      </Text>
    );
  };

  const renderPost = ({ item }: { item: BunkagramPost }) => {
    const isMe = item.userId === uid;
    const avatarSource = item.avatarBase64
      ? { uri: `data:image/png;base64,${item.avatarBase64}` }
      : require('../../assets/images/avatar_formal.webp');

    const hasLiked = uid ? item.likedBy.includes(uid) : false;

    const isVideo = !!item.videoUrl && !item.imageBase64;
    const videoThumb = isVideo ? getVideoThumbnailUrl(item.videoUrl) : null;

    return (
      <View style={styles.card}>
        {/* Cabecera */}
        <View style={styles.cardHeader}>
          <Image source={avatarSource} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName}>{item.displayName}</Text>
            <Text style={styles.cardSubtitle}>
              {isMe ? 'Tú' : 'Estudiante de Bunkan'}
            </Text>
          </View>
        </View>

        {/* Imagen o Video */}
        {isVideo ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => item.videoUrl && Linking.openURL(item.videoUrl)}
          >
            {videoThumb ? (
              <View>
                <Image
                  source={{ uri: videoThumb }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                {/* Icono de play centrado */}
                <View style={styles.playOverlay}>
                  <Text style={styles.playIcon}>▶️</Text>
                </View>
              </View>
            ) : (
              <View style={[styles.cardImage, styles.videoPlaceholder]}>
                <Text style={styles.videoPlaceholderText}>Ver video</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        )}

        {/* Acciones */}
        <View style={styles.cardActionsRow}>
          <TouchableOpacity
            style={styles.likePill}
            onPress={() => toggleLike(item)}
            activeOpacity={0.7}
          >
            <Text style={[styles.likeHeart, hasLiked && styles.likeHeartActive]}>
              {hasLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.likeCountText}>
              {item.likeCount} likes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openComments(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.commentButtonText}>💬 Comentarios</Text>
          </TouchableOpacity>
        </View>

        {/* Caption con links clicables */}
        {item.caption ? renderCaptionWithLinks(item.caption) : null}
      </View>
    );
  };

  const thumbnailForModalVideo = postType === 'video'
    ? getVideoThumbnailUrl(newVideoUrl)
    : null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={BG} style={styles.bg}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bunkagram</Text>
          <Text style={styles.headerSubtitle}>Comparte tus momentos en Bunkan</Text>
        </View>

        {/* LISTA DE POSTS */}
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* BOTÓN FLOTANTE + */}
        <TouchableOpacity
          style={styles.fab}
          onPress={openPostOptions}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>

        {/* SHEET: Elegir tipo de publicación */}
        <Modal
          visible={showPostTypeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPostTypeModal(false)}
        >
          <TouchableOpacity
            style={styles.sheetOverlay}
            activeOpacity={1}
            onPress={() => setShowPostTypeModal(false)}
          >
            <View style={styles.sheetCard}>
              <Text style={styles.sheetTitle}>Crear publicación</Text>

              <TouchableOpacity
                style={styles.sheetOption}
                onPress={chooseImagePost}
              >
                <Text style={styles.sheetOptionText}>📷 Subir foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetOption}
                onPress={chooseVideoPost}
              >
                <Text style={styles.sheetOptionText}>🎬 Publicar video (link)</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* MODAL NUEVO POST (imagen o video) */}
        <Modal
          visible={showNewPostModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowNewPostModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {postType === 'video' ? 'Nuevo video' : 'Nueva foto'}
              </Text>

              {postType === 'image' && newPostImageBase64 && (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${newPostImageBase64}` }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              )}

              {postType === 'video' && (
                <>
                  <TextInput
                    style={styles.urlInput}
                    value={newVideoUrl}
                    onChangeText={setNewVideoUrl}
                    placeholder="Pega el link del video (YouTube, Facebook...)"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {thumbnailForModalVideo && (
                    <View>
                      <Image
                        source={{ uri: thumbnailForModalVideo }}
                        style={styles.modalImage}
                        resizeMode="cover"
                      />
                      <View style={styles.playOverlay}>
                        <Text style={styles.playIcon}>▶️</Text>
                      </View>
                    </View>
                  )}
                </>
              )}

              <TextInput
                style={styles.captionInput}
                value={newPostCaption}
                onChangeText={setNewPostCaption}
                placeholder={
                  postType === 'video'
                    ? 'Escribe una descripción para el video…'
                    : 'Escribe una descripción… (puedes pegar links)'
                }
                placeholderTextColor="#999"
                multiline
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => {
                    setShowNewPostModal(false);
                    setPostType(null);
                  }}
                  disabled={isUploading}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={handleCreatePost}
                  disabled={isUploading}
                >
                  <Text style={styles.modalSaveText}>
                    {isUploading ? 'Subiendo…' : 'Publicar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL COMENTARIOS */}
        <Modal
          visible={showCommentsModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCommentsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.commentsCard}>
              <Text style={styles.modalTitle}>Comentarios</Text>

              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingVertical: 4 }}
                renderItem={({ item }) => {
                  const avatarSource = item.avatarBase64
                    ? { uri: `data:image/png;base64,${item.avatarBase64}` }
                    : require('../../assets/images/avatar_formal.webp');
                  return (
                    <View style={styles.commentRow}>
                      <Image source={avatarSource} style={styles.commentAvatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.commentName}>{item.displayName}</Text>
                        <Text style={styles.commentText}>{item.text}</Text>
                      </View>
                    </View>
                  );
                }}
              />

              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Escribe un comentario…"
                  placeholderTextColor="#999"
                  multiline
                />
                <TouchableOpacity
                  style={styles.commentSendBtn}
                  onPress={handleSendComment}
                >
                  <Text style={styles.commentSendText}>➤</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowCommentsModal(false)}
              >
                <Text style={styles.modalCancelText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
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
  headerSubtitle: {
    fontSize: 12,
    color: '#7A4A4A',
  },
  listContent: {
    padding: 14,
    paddingBottom: 80,
  },

  // Card estilo "mini Instagram"
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2B1C1C',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#888',
  },
  cardImage: {
    width: '100%',
    height: 320,
    backgroundColor: '#eee',
  },
  videoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 40,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  likePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  likeHeart: {
    fontSize: 18,
    marginRight: 6,
  },
  likeHeartActive: {
    // Puedes customizar si quieres cambiar estilo al dar like
  },
  likeCountText: {
    fontSize: 13,
    color: '#333',
  },
  commentButtonText: {
    fontSize: 13,
    color: '#B80C1F',
    fontWeight: '600',
  },
  captionText: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    fontSize: 13,
    color: '#333',
  },
  captionLink: {
    color: '#1e90ff',
    textDecorationLine: 'underline',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 18,
    bottom: Platform.OS === 'android' ? 28 : 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#B80C1F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    marginTop: -2,
  },

  // Sheet tipo action-sheet para elegir foto/video
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheetCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  sheetOption: {
    paddingVertical: 10,
  },
  sheetOptionText: {
    fontSize: 15,
    color: '#222',
  },

  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#fff',
    padding: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#222',
  },
  modalImage: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
  urlInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111',
    marginBottom: 10,
  },
  captionInput: {
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: '#111',
    marginBottom: 10,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modalCancelText: {
    fontSize: 13,
    color: '#444',
  },
  modalSaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#B80C1F',
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  // Comentarios
  commentsCard: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 18,
    backgroundColor: '#fff',
    padding: 14,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  commentName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  commentText: {
    fontSize: 13,
    color: '#333',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  commentInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    color: '#111',
  },
  commentSendBtn: {
    marginLeft: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#B80C1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSendText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalCloseBtn: {
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

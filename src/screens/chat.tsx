// src/screens/Chat.tsx
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
// 👇 IMPORT LEGACY en lugar de expo-file-system normal
import * as FileSystem from 'expo-file-system/legacy';

import {
  addDoc,
  collection,
  doc,
  // 👇 nuevos
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth, db } from '../config/firebaseConfig';

type Message = {
  id: string;
  text: string;
  userId: string;
  createdAt: Date;
  displayName?: string;
  avatarBase64?: string | null;
  imageBase64?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  audioBase64?: string | null; // audio en base64
  audioDuration?: number | null; // segundos
};

type UserProfile = {
  displayName: string;
  photoBase64?: string | null;
};

const CHAT_BG = require('../../assets/chat/chat_bg.jpg');
const LOGO = require('../../assets/logo.png');

// Emojis que mostraremos en el picker
const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😎',
  '😉', '🥰', '😅', '🤔', '🙃', '😴', '😢', '😭',
  '😡', '👍', '👎', '🙏', '👏', '🔥', '✨', '🎉',
  '❤️', '💔', '💖', '⭐', '☀️', '🌙', '🍣', '🍜',
];

function formatSeconds(total: number): string {
  const s = Math.max(0, Math.floor(total));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [showAttachMenu, setShowAttachMenu] = useState(false);

  // 🟥 Emojis
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<TextInput | null>(null);

  // 🟥 Grabación
  const [showRecorder, setShowRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordIntervalRef = useRef<any>(null);

  // ▶️ Reproductor
  const [playingId, setPlayingId] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // 🖼 Imagen a pantalla completa
  const [fullImage, setFullImage] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  const currentUser = auth.currentUser;
  const uid = currentUser?.uid;

  // 🔹 Perfil del usuario
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

  // 🔹 Mensajes del chat global
  useEffect(() => {
    const roomId = 'global';
    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(80)
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs: Message[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          text: data.text ?? '',
          userId: data.userId,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          displayName: data.displayName,
          avatarBase64: data.avatarBase64 ?? null,
          imageBase64: data.imageBase64 ?? null,
          fileName: data.fileName ?? null,
          fileType: data.fileType ?? null,
          audioBase64: data.audioBase64 ?? null,
          audioDuration: data.audioDuration ?? null,
        };
      });
      setMessages(msgs);
    });

    return unsub;
  }, []);

  // 🔹 AL ENTRAR AL CHAT: marcar notificaciones de chat como leídas
  useEffect(() => {
    const markChatNotificationsRead = async () => {
      try {
        // Aquí usamos notificationsGlobal type='chat', read=false
        const ref = collection(db, 'notificationsGlobal');
        const q = query(ref, where('type', '==', 'chat'), where('read', '==', false));
        const snap = await getDocs(q);

        if (snap.empty) return;

        const batch = writeBatch(db);
        snap.docs.forEach((d) => {
          batch.update(d.ref, { read: true });
        });
        await batch.commit();
      } catch (e) {
        console.warn('Error marcando notificaciones de chat como leídas', e);
      }
    };

    markChatNotificationsRead();
  }, []);

  // Limpieza de audio / grabación al desmontar
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
    };
  }, []);

  // 🔔 Helper: crear notificación para el feed
  const createChatNotification = async (
    extraFields: Partial<Omit<Message, 'id' | 'createdAt'>>
  ) => {
    try {
      if (!uid || !profile) return;

      let preview = (extraFields.text ?? '').trim();
      if (!preview) {
        if (extraFields.imageBase64) {
          preview = '📷 Imagen en ChatBunkan';
        } else if (extraFields.audioBase64) {
          preview = '🎙 Mensaje de voz en ChatBunkan';
        } else if (extraFields.fileName) {
          preview = `📎 ${extraFields.fileName}`;
        } else {
          preview = 'Nuevo mensaje en ChatBunkan';
        }
      }

      await addDoc(collection(db, 'notificationsGlobal'), {
        type: 'chat',            // para que la pantalla sepa que viene del chat
        source: 'chat',
        actorId: uid,
        actorName: profile.displayName,
        actorAvatar: profile.photoBase64 ?? null,
        preview,
        createdAt: serverTimestamp(),
        read: false,
      });
    } catch (e) {
      console.warn('Error creando notificación de chat', e);
    }
  };

  // 🔹 Helper para enviar mensaje + notificación
  const sendBaseMessage = async (
    extraFields: Partial<Omit<Message, 'id' | 'createdAt'>>
  ) => {
    if (!uid) return;

    const roomId = 'global';

    try {
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        text: extraFields.text ?? '',
        userId: uid,
        createdAt: serverTimestamp(),
        displayName: profile?.displayName || 'Estudiante',
        avatarBase64: profile?.photoBase64 ?? null,
        imageBase64: extraFields.imageBase64 ?? null,
        fileName: extraFields.fileName ?? null,
        fileType: extraFields.fileType ?? null,
        audioBase64: extraFields.audioBase64 ?? null,
        audioDuration: extraFields.audioDuration ?? null,
      });

      // 👇 además de guardar el mensaje, registramos evento en el feed de notificaciones
      await createChatNotification(extraFields);

      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (e) {
      console.warn('Error enviando mensaje', e);
    }
  };

  // ✉️ Enviar texto
  const handleSend = async () => {
    const text = input.trim();
    if (!uid || !text) return;
    const toSend = text;
    setInput('');
    setShowEmojiPicker(false);
    await sendBaseMessage({ text: toSend });
  };

  // 📎 Imagen
  const handlePickImage = async () => {
    setShowAttachMenu(false);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        console.warn('Permiso denegado para galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.6,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        console.warn('No se obtuvo base64 de la imagen');
        return;
      }

      await sendBaseMessage({
        text: '',
        imageBase64: asset.base64,
      });
    } catch (e) {
      console.warn('Error eligiendo imagen', e);
    }
  };

  // 📎 Archivo (solo metadata)
  const handlePickFile = async () => {
    setShowAttachMenu(false);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets?.length) return;

      const file = res.assets[0];
      await sendBaseMessage({
        text: '',
        fileName: file.name ?? 'Archivo',
        fileType: file.mimeType ?? 'application/octet-stream',
      });
    } catch (e) {
      console.warn('Error eligiendo archivo', e);
    }
  };

  // 🎙 Iniciar grabación (abre panel)
  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        console.warn('Permiso de micrófono denegado');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      recordingRef.current = recording;

      setRecordSeconds(0);
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
      recordIntervalRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);

      setIsRecording(true);
      setShowRecorder(true);
    } catch (e) {
      console.warn('Error iniciando grabación', e);
    }
  };

  // 🎙 Cancelar (no enviar)
  const cancelRecording = async () => {
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    setIsRecording(false);
    setShowRecorder(false);
    setRecordSeconds(0);

    const rec = recordingRef.current;
    if (rec) {
      try {
        await rec.stopAndUnloadAsync();
      } catch {
        // ignorar
      }
    }
    recordingRef.current = null;
  };

  // 🎙 Detener y enviar (audio en base64)
  const stopAndSendRecording = async () => {
    const rec = recordingRef.current;

    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }

    setIsRecording(false);
    setShowRecorder(false);

    if (!rec) {
      console.warn('No hay recordingRef.current al detener');
      setRecordSeconds(0);
      return;
    }

    try {
      console.log('Deteniendo grabación...');
      await rec.stopAndUnloadAsync();

      const uri = rec.getURI();
      console.log('URI de audio:', uri);

      if (!uri) {
        console.warn('No se obtuvo URI del audio');
        recordingRef.current = null;
        setRecordSeconds(0);
        return;
      }

      const status: any = await rec.getStatusAsync();
      const durationMillis =
        status?.durationMillis != null ? status.durationMillis : 0;
      const seconds = Math.max(1, Math.round(durationMillis / 1000));

      console.log('Duración (s):', seconds);

      // Leer archivo de audio como base64 usando la API legacy
      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      console.log('Longitud de audioBase64:', audioBase64?.length);

      recordingRef.current = null;
      setRecordSeconds(0);

      await sendBaseMessage({
        text: '',
        audioBase64,
        audioDuration: seconds,
      });

      console.log('Mensaje de audio (base64) enviado a Firestore');
    } catch (e) {
      console.warn('Error al detener/leer audio o enviar mensaje', e);
    }
  };

  // ▶️ Play / Pause audio (desde base64)
  const handleTogglePlayAudio = async (item: Message) => {
    if (!item.audioBase64) return;

    try {
      // Si ya es el que está sonando → parar
      if (playingId === item.id && soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setPlayingId(null);
        return;
      }

      // Si hay otro sonando, lo paramos
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Escribimos el base64 a un archivo temporal .m4a (API legacy)
      const fileUri = `${FileSystem.cacheDirectory}voice-${item.id}.m4a`;
      await FileSystem.writeAsStringAsync(fileUri, item.audioBase64, {
        encoding: 'base64',
      });

      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
      soundRef.current = sound;
      setPlayingId(item.id);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          soundRef.current?.unloadAsync();
          soundRef.current = null;
          setPlayingId(null);
        }
      });

      await sound.playAsync();
    } catch (e) {
      console.warn('Error reproduciendo audio', e);
    }
  };

  // 🟡 Añadir emoji al input
  const handleAddEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
    // Mantener foco en el input
    inputRef.current?.focus();
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.userId === uid;
    const avatarSource = item.avatarBase64
      ? { uri: `data:image/png;base64,${item.avatarBase64}` }
      : require('../../assets/images/avatar_formal.webp');

    const isPlaying = playingId === item.id;

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.rowRight : styles.rowLeft,
        ]}
      >
        {!isMe && <Image source={avatarSource} style={styles.avatar} />}

        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleOther,
          ]}
        >
          <Text
            style={[
              styles.name,
              isMe ? styles.nameMe : styles.nameOther,
            ]}
            numberOfLines={1}
          >
            {item.displayName || 'Estudiante'}
          </Text>

          {/* Texto */}
          {item.text ? (
            <Text
              style={[
                styles.messageText,
                isMe ? styles.messageTextMe : styles.messageTextOther,
              ]}
            >
              {item.text}
            </Text>
          ) : null}

          {/* Audio */}
          {item.audioBase64 && (
            <View style={styles.audioRow}>
              <TouchableOpacity
                style={styles.audioPlayBtn}
                onPress={() => handleTogglePlayAudio(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.audioPlayIcon}>
                  {isPlaying ? '⏸' : '▶︎'}
                </Text>
              </TouchableOpacity>
              <Text
                style={[
                  styles.audioDuration,
                  isMe ? styles.messageTextMe : styles.messageTextOther,
                ]}
              >
                {item.audioDuration
                  ? `${item.audioDuration}"`
                  : 'Audio'}
              </Text>
            </View>
          )}

          {/* Imagen */}
          {item.imageBase64 && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                setFullImage(`data:image/jpeg;base64,${item.imageBase64}`)
              }
            >
              <Image
                source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
                style={styles.imageMessage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {/* Archivo */}
          {item.fileName && (
            <Text
              style={[
                styles.fileText,
                isMe ? styles.messageTextMe : styles.messageTextOther,
              ]}
            >
              📎 {item.fileName}
            </Text>
          )}
        </View>

        {isMe && <Image source={avatarSource} style={styles.avatar} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={CHAT_BG} style={styles.bg}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image source={LOGO} style={styles.headerLogo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>ChatBunkan</Text>
            <Text style={styles.headerSubtitle}>
              Comunidad de estudiantes de Bunkan Nichiboku
            </Text>
          </View>
        </View>

        {/* MODAL IMAGEN COMPLETA */}
        <Modal
          visible={!!fullImage}
          transparent
          animationType="fade"
          onRequestClose={() => setFullImage(null)}
        >
          <Pressable
            style={styles.fullImageOverlay}
            onPress={() => setFullImage(null)}
          >
            {fullImage && (
              <Image
                source={{ uri: fullImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </Pressable>
        </Modal>

        {/* MENÚ DE ADJUNTAR */}
        <Modal
          transparent
          visible={showAttachMenu}
          animationType="fade"
          onRequestClose={() => setShowAttachMenu(false)}
        >
          <Pressable
            style={styles.attachOverlay}
            onPress={() => setShowAttachMenu(false)}
          >
            <View style={styles.attachMenu}>
              <Text style={styles.attachTitle}>Adjuntar</Text>
              <TouchableOpacity
                style={styles.attachOption}
                onPress={handlePickImage}
              >
                <Text style={styles.attachOptionText}>📷 Imagen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.attachOption}
                onPress={handlePickFile}
              >
                <Text style={styles.attachOptionText}>📎 Archivo</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* PANEL DE GRABACIÓN DE VOZ */}
        <Modal
          transparent
          visible={showRecorder}
          animationType="fade"
          onRequestClose={cancelRecording}
        >
          <View style={styles.recOverlay}>
            <View style={styles.recCard}>
              <Text style={styles.recTitle}>Grabando mensaje de voz</Text>
              <Text style={styles.recSubtitle}>
                Habla cerca del micrófono. Cuando termines, toca &quot;Detener y enviar&quot;.
              </Text>

              {/* Timer */}
              <Text style={styles.recTimer}>{formatSeconds(recordSeconds)}</Text>

              {/* Onda simple */}
              <View style={styles.waveRow}>
                <View style={[styles.waveBar, { height: 12 }]} />
                <View style={[styles.waveBar, { height: 24 }]} />
                <View style={[styles.waveBar, { height: 18 }]} />
                <View style={[styles.waveBar, { height: 30 }]} />
                <View style={[styles.waveBar, { height: 16 }]} />
              </View>

              {/* Botones */}
              <View style={styles.recButtonsRow}>
                <TouchableOpacity
                  style={styles.recCancelBtn}
                  onPress={cancelRecording}
                >
                  <Text style={styles.recCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.recSendBtn}
                  onPress={stopAndSendRecording}
                >
                  <Text style={styles.recSendText}>Detener y enviar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          {/* MENSAJES */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            inverted
          />

          {/* EMOJI PICKER (simple) */}
          {showEmojiPicker && (
            <View style={styles.emojiPicker}>
              <FlatList
                data={EMOJIS}
                keyExtractor={(_, index) => String(index)}
                numColumns={8}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.emojiItem}
                    onPress={() => handleAddEmoji(item)}
                  >
                    <Text style={styles.emojiText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* INPUT BAR */}
          <View style={styles.inputBarOuter}>
            <View style={styles.inputBar}>
              {/* 📎 */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setShowAttachMenu(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.iconText}>📎</Text>
              </TouchableOpacity>

              {/* 😊 Emojis */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setShowEmojiPicker((prev) => !prev)}
                activeOpacity={0.7}
              >
                <Text style={styles.iconText}>😊</Text>
              </TouchableOpacity>

              {/* Texto */}
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Escribe tu mensaje…"
                placeholderTextColor="#999"
                multiline
              />

              {/* 🎙 abrir panel de grabación */}
              <TouchableOpacity
                style={[
                  styles.iconBtn,
                  isRecording && styles.iconBtnRecording,
                ]}
                onPress={startRecording}
                activeOpacity={0.7}
              >
                <Text style={styles.iconText}>🎙</Text>
              </TouchableOpacity>

              {/* ➤ enviar texto */}
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={handleSend}
                activeOpacity={0.8}
              >
                <Text style={styles.sendText}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },

  // ===== Header =====
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 35,
    paddingBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  headerLogo: {
    width: 48,
    height: 48,
    marginRight: 10,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3A1212',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7A4A4A',
  },

  // ===== Lista =====
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },

  // ===== Mensajes =====
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginHorizontal: 4,
  },
  bubble: {
    maxWidth: '72%',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  bubbleOther: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(200,0,40,0.35)',
  },
  bubbleMe: {
    backgroundColor: '#B80C1F',
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  nameOther: {
    color: '#333',
  },
  nameMe: {
    color: '#FFECEC',
  },
  messageText: {
    fontSize: 14,
    marginBottom: 2,
  },
  messageTextOther: {
    color: '#222',
  },
  messageTextMe: {
    color: '#FFFFFF',
  },
  imageMessage: {
    marginTop: 4,
    borderRadius: 10,
    width: 180,
    height: 140,
  },
  fileText: {
    fontSize: 13,
    marginTop: 2,
  },

  // 🎵 Audio
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  audioPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  audioPlayIcon: {
    fontSize: 16,
    color: '#fff',
  },
  audioDuration: {
    fontSize: 13,
  },

  // ===== Emoji picker =====
  emojiPicker: {
    maxHeight: 180,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  emojiItem: {
    width: '12.5%', // 8 columnas
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  emojiText: {
    fontSize: 24,
  },

  // ===== Input bar =====
  inputBarOuter: {
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'android' ? 53 : 40,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(200,0,40,0.3)',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 6,
    color: '#111',
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  iconBtnRecording: {
    backgroundColor: 'rgba(184,12,31,0.2)',
  },
  iconText: {
    fontSize: 18,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B80C1F',
    marginLeft: 4,
  },
  sendText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // ===== Menú adjuntar =====
  attachOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  attachMenu: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  attachTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  attachOption: {
    paddingVertical: 10,
  },
  attachOptionText: {
    fontSize: 15,
    color: '#222',
  },

  // ===== Imagen completa =====
  fullImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },

  // ===== Panel de grabación =====
  recOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  recCard: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  recTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  recSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 16,
  },
  recTimer: {
    color: '#FF5555',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  waveRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 6,
    marginBottom: 18,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: '#FF7777',
  },
  recButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  recCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
  },
  recCancelText: {
    color: '#fff',
    fontSize: 14,
  },
  recSendBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#B80C1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recSendText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

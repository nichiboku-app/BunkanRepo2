// src/components/IntroVideoModal.tsx
import { Audio } from 'expo-av';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const DRAGON = require('../../assets/ui/dragon_frame_red.png');

type Props = {
  visible: boolean;
  sourceUrl: string | null;
  onClose: () => void;
  onDontShowAgain?: () => void;
};

function InlineVideo({
  uri,
  onBecameReady,
}: {
  uri: string;
  onBecameReady?: () => void;
}) {
  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = false;
    p.muted = false;
  });

  // Autoplay cuando está listo. No hacemos pause/seek en cleanup para
  // evitar "shared object already released" en Android.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    player.play();
    const t = setTimeout(() => onBecameReady?.(), 180);
    return () => clearTimeout(t);
  }, []);

  return (
    <VideoView
      key={uri} // fuerza una instancia nueva si cambia la fuente
      player={player}
      nativeControls
      allowsFullscreen
      allowsPictureInPicture
      contentFit="contain"
      style={styles.video}
    />
  );
}

export default function IntroVideoModal({
  visible,
  sourceUrl,
  onClose,
  onDontShowAgain,
}: Props) {
  const [ready, setReady] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  // Permite audio en modo silencio iOS mientras el modal esté visible
  useEffect(() => {
    const setMode = async (on: boolean) => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: on,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch {}
    };
    setMode(visible);
    return () => {
      setMode(false);
    };
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setReady(false);
      fade.setValue(0);
    }
  }, [visible, fade]);

  const handleReady = () => {
    setReady(true);
    Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { opacity: fade }]}>
          <View style={styles.videoWrap}>
            {!sourceUrl && (
              <View style={styles.loader}>
                <ActivityIndicator />
                <Text style={styles.loaderText}>Cargando…</Text>
              </View>
            )}

            {sourceUrl ? (
              <InlineVideo uri={sourceUrl} onBecameReady={handleReady} />
            ) : null}

            {/* Marco decorativo */}
            <View pointerEvents="none" style={styles.frame}>
              <Image source={DRAGON} style={styles.frameImg} resizeMode="stretch" />
            </View>
          </View>

          {/* Controles */}
          <View style={styles.row}>
            <Pressable
              style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
              onPress={onClose}
            >
              <Text style={styles.btnTxt}>Cerrar</Text>
            </Pressable>

            {onDontShowAgain && (
              <Pressable
                style={({ pressed }) => [styles.btnGhost, pressed && { opacity: 0.85 }]}
                onPress={onDontShowAgain}
              >
                <Text style={styles.btnGhostTxt}>No volver a mostrar</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    backgroundColor: '#0b0b0d',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4b0a0a',
    padding: 12,
  },
  videoWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#7a0c0c',
  },
  video: { width: '100%', height: '100%' },
  frame: { position: 'absolute', left: -2, top: -2, right: -2, bottom: -2 },
  frameImg: { width: '100%', height: '100%' },
  row: { marginTop: 12, flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  btn: {
    backgroundColor: '#B3001B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#000',
    flexGrow: 1,
    alignItems: 'center',
  },
  btnTxt: { color: '#fff', fontWeight: '900' },
  btnGhost: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#B3001B',
    flexGrow: 1,
    alignItems: 'center',
  },
  btnGhostTxt: { color: '#fff', fontWeight: '800' },
  loader: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  loaderText: { color: '#e5e7eb', marginTop: 6 },
});

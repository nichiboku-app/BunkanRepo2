// src/components/YouTubeBox.tsx
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function YouTubeBox({ videoId }: { videoId: string }) {
  const [needGesture, setNeedGesture] = useState(false);
  const [failed, setFailed] = useState(false);
  const webRef = useRef<WebView>(null);

  // iframe con autoplay silenciado + enablejsapi para poder desmutear luego
  const html = `
  <!doctype html><html><head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
    <style>html,body{height:100%;margin:0;background:#000}#wrap{position:relative;width:100%;height:100%}
    #player{position:absolute;inset:0}</style>
  </head><body>
    <div id="wrap">
      <iframe id="player"
        src="https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&controls=1&autoplay=1&mute=1&enablejsapi=1"
        title="YouTube" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen style="width:100%;height:100%"></iframe>
    </div>
    <script>
      // Detecta si el autoplay está bloqueado: si en 1.2s no hay playback, pedimos gesto
      let asked = false;
      function post(type, payload){window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type,payload}))}
      setTimeout(()=>{ post('ready', {}) }, 200); // marca de vida
      setTimeout(()=>{
        try {
          // si no hay gesture, algunos navegadores dejan el video pausado
          if (!asked) post('need_gesture', {});
        } catch(e){}
      }, 1200);
      // API de YouTube (desmuteo después del gesto)
      window.addEventListener('message', function(e){
        try{
          const msg = JSON.parse(e.data||'{}');
          if(msg.type==='play_with_sound'){
            const iframe = document.getElementById('player').contentWindow;
            asked = true;
            // secuencia: asegurar mute, play, luego unmute
            iframe.postMessage('{"event":"command","func":"playVideo","args":""}','*');
            setTimeout(()=>{ iframe.postMessage('{"event":"command","func":"unMute","args":""}','*') }, 350);
          }
        }catch(_){}
      });
      // Manejo simple de errores: si el owner bloquea, YouTube pinta pantalla de error.
      // No hay evento confiable; si tras 2.5s no conseguimos ready+play, marcamos fallo.
      setTimeout(()=>{ post('maybe_failed', {}) }, 2500);
    </script>
  </body></html>`;

  const onMessage = (e: any) => {
    try {
      const { type } = JSON.parse(e.nativeEvent.data);
      if (type === 'need_gesture') setNeedGesture(true);
      if (type === 'maybe_failed') {
        // si ya pedimos gesto y aún nada, probablemente 150/153
        if (needGesture) setFailed(true);
      }
    } catch {}
  };

  const playWithSound = () => {
    setNeedGesture(false);
    webRef.current?.postMessage(JSON.stringify({ type: 'play_with_sound' }));
  };

  const openInApp = () => {
    const url = Platform.select({
      ios: `youtube://${videoId}`,
      android: `vnd.youtube:${videoId}`,
      default: `https://www.youtube.com/watch?v=${videoId}`,
    });
    Linking.openURL(url!);
  };

  return (
    <View style={styles.wrap}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.web}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        onMessage={onMessage}
        onError={() => setFailed(true)}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}><ActivityIndicator /></View>
        )}
      />

      {needGesture && !failed && (
        <Pressable style={styles.overlayBtn} onPress={playWithSound} android_ripple={{ color: '#ffffff22' }}>
          <Text style={styles.btnTxt}>▶ Reproducir con sonido</Text>
        </Pressable>
      )}

      {failed && (
        <Pressable style={[styles.overlayBtn, styles.errorBtn]} onPress={openInApp}>
          <Text style={styles.btnTxt}>Abrir en YouTube</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', aspectRatio: 16/9, backgroundColor: '#000', borderRadius: 10, overflow: 'hidden' },
  web: { flex: 1, backgroundColor: '#000' },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  overlayBtn: {
    position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  errorBtn: { backgroundColor: 'rgba(0,0,0,0.6)' },
  btnTxt: { color: '#fff', fontWeight: '800', paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#fff', borderRadius: 8 },
});

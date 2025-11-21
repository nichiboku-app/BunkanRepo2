// src/screens/RedesSocialesScreen.tsx
import {
    Alert,
    ImageBackground,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const BG_SOCIAL = require("../../assets/images/drawer_bgx.webp"); // Cambiable

type SocialItem = {
  id: string;
  name: string;
  label: string;
  emoji: string;
  url: string;
  description: string;
  pillText: string;
};

const SOCIALS: SocialItem[] = [
  {
    id: "facebook",
    name: "Facebook",
    label: "Facebook",
    emoji: "📘",
    url: "https://www.facebook.com/bunkan.nichiboku",
    description: "Publicaciones, avisos y fotos oficiales de la escuela.",
    pillText: "Comunidad",
  },
  {
    id: "instagram",
    name: "Instagram",
    label: "Instagram",
    emoji: "📸",
    url: "https://www.instagram.com/bunkan_nichiboku?igsh=MWdpNGc5cmQ0aXRnMw==",
    description: "Fotos, historias y contenido visual de la escuela.",
    pillText: "Galería",
  },
  {
    id: "tiktok",
    name: "TikTok",
    label: "TikTok",
    emoji: "🎵",
    url: "https://www.tiktok.com/@bunkan_nichiboku?_r=1&_t=ZS-91ZMY2cadzb",
    description: "Clips divertidos, cultura japonesa y retos.",
    pillText: "Corto",
  },
  {
    id: "youtube",
    name: "YouTube",
    label: "YouTube",
    emoji: "▶️",
    url: "https://youtube.com/@bunkannichiboku6134?si=vJawE_qh0popk7eW",
    description: "Videos educativos, cultura y clases especiales.",
    pillText: "Videos",
  },
  {
    id: "telegram",
    name: "Telegram",
    label: "Telegram",
    emoji: "📨",
    url: "https://t.me/INTBUNKANNICHIBOKU",
    description: "Canal oficial para anuncios y comunicados.",
    pillText: "Canal",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    label: "WhatsApp Canal",
    emoji: "💬",
    url: "https://whatsapp.com/channel/0029VaRTqDjAInPu5my8Dx0k",
    description: "Anuncios rápidos en el canal oficial de WhatsApp.",
    pillText: "Canal",
  },
];

export default function RedesSocialesScreen() {
  const openSocial = async (url: string, name: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) {
        Alert.alert(
          "No se pudo abrir",
          `Parece que ${name} no está disponible en este dispositivo.`
        );
        return;
      }
      await Linking.openURL(url);
    } catch (e) {
      console.warn("Error abriendo red social", e);
      Alert.alert("Error", "No se pudo abrir el enlace.");
    }
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={BG_SOCIAL} style={styles.bg} resizeMode="cover">
        <View style={styles.overlay} />

        <View style={styles.contentBox}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.headerJp}>SNS 文日</Text>
              <Text style={styles.headerTitle}>Redes sociales Bunkan</Text>
              <Text style={styles.headerSubtitle}>
                Síguenos en nuestras redes oficiales para noticias, eventos y
                contenido exclusivo.
              </Text>
            </View>

            <View style={styles.cardsWrap}>
              {SOCIALS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.9}
                  style={styles.card}
                  onPress={() => openSocial(item.url, item.name)}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.emojiCircle}>
                      <Text style={styles.emoji}>{item.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardName}>{item.label}</Text>
                      <Text style={styles.cardDesc}>{item.description}</Text>
                    </View>
                  </View>

                  <View style={styles.cardBottomRow}>
                    <View style={styles.pill}>
                      <Text style={styles.pillText}>{item.pillText}</Text>
                    </View>
                    <Text style={styles.cardBtnText}>
                      Ir a {item.label} →
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 24 }} />
            <Text style={styles.footerNote}>
              * Si tienes una app instalada, se abrirá automáticamente.
            </Text>
            <View style={{ height: Platform.OS === "ios" ? 30 : 16 }} />
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  contentBox: {
    flex: 1,
    margin: 10,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "android" ? 10 : 16,
  },
  scrollContent: { paddingBottom: 16 },
  header: { marginBottom: 14 },
  headerJp: {
    fontSize: 16,
    color: "#B80C1F",
    fontWeight: "800",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#222",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  cardsWrap: { marginTop: 8, gap: 12 },
  card: {
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  emojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F5E6E7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  emoji: { fontSize: 26 },
  cardName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#222",
  },
  cardDesc: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  cardBottomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: "#F3D9DC",
  },
  pillText: {
    fontSize: 11,
    color: "#B80C1F",
    fontWeight: "700",
  },
  cardBtnText: {
    fontSize: 13,
    color: "#000",
    fontWeight: "700",
  },
  footerNote: {
    fontSize: 11,
    color: "#777",
    textAlign: "center",
  },
});

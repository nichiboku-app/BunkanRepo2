import { RouteProp, useRoute } from "@react-navigation/native";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";

type RootStackParamList = {
  N1Lesson: { id: string };
};

export default function N1LessonScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, "N1Lesson">>();
  const id = params?.id ?? "unknown";

  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Lección: {id}</Text>
        <Text style={styles.sub}>Aquí van: Lectura → Listening → Gramática → Vocab → Quiz → Mini-test</Text>
        {/* TODO: renderizar módulos de la lección */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0B0F19" },
  title: { color: "white", fontWeight: "900", fontSize: 20, marginBottom: 8 },
  sub: { color: "rgba(255,255,255,0.76)" },
});

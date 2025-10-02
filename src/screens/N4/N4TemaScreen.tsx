// src/screens/N4/N4TemaScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ✅ Sonidos globales
import { useFeedbackSounds } from "../../hooks/useFeedbackSounds";

// ✅ Contenido modular (Tipos + helpers + imágenes KanjiVG)
import {
  getThemeContent,
  IMG_BY_KANJI,
  type KanjiItem,
  type ThemeContent,
} from "../../content/n4";

/* =======================
   Navegación
======================= */
type RootStackParamList = {
  CursoN4: undefined;
  N4_Tema: { id: number; title?: string };
};

/* =========================================================
   Tipos auxiliares (shape que usa tu content/n4)
========================================================= */
type VocabClaseItem = { key: string; jp: string; romaji?: string; es: string };
type OracionItem = {
  key: string;
  jp: string;
  romaji?: string;
  es: string;
  exp?: string;
};
type GramTabla = { title?: string; headers: string[]; rows: string[][]; note?: string };
type GramPunto = {
  regla: string;
  pasoapaso: string[];
  ejemploJP?: string;
  ejemploRoma?: string;
  ejemploES?: string;
  ejemplos?: { jp: string; roma?: string; es?: string }[];
  tabla?: GramTabla;
};
type DialogoItem = {
  title: string;
  kana: string[];
  kanji: string[];
  es?: string[]; // traducción opcional por línea
};

/* =========================================================
   🔊 TTS helper
========================================================= */
function speakJP(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, {
      language: "ja-JP",
      pitch: 1.0,
      rate: Platform.select({ ios: 0.5, android: 1.0, default: 1.0 }),
    });
  } catch {}
}

/* =========================================================
   Quizzes helper (hasta 6 por pantalla)
========================================================= */
type QuizSet = { title?: string; lines: string[] };

function toQuizSets(content: ThemeContent): QuizSet[] {
  const sets: QuizSet[] = [];
  const cAny = content as any;

  // 1) Quizzes explícitos en el contenido (si existen)
  if (Array.isArray(cAny.quizzes)) {
    for (const q of cAny.quizzes) {
      if (Array.isArray(q?.lines) && q.lines.length > 0) {
        sets.push({ title: q.title, lines: q.lines });
      }
      if (sets.length >= 6) break;
    }
  }

  // 2) Compat: un único quizLines
  if (sets.length < 6 && Array.isArray(content.quizLines) && content.quizLines.length > 0) {
    sets.push({ title: "ordena el diálogo", lines: content.quizLines });
  }

  // 3) Autogenerar desde los diálogos (kanji) para completar hasta 6
  if (sets.length < 6 && Array.isArray(content.dialogos)) {
    for (const d of content.dialogos as any[]) {
      if (Array.isArray(d?.kanji) && d.kanji.length >= 2) {
        sets.push({ title: d.title, lines: d.kanji });
      }
      if (sets.length >= 6) break;
    }
  }

  return sets.slice(0, 6);
}

/* =========================================================
   Controles UI reutilizables
========================================================= */
function TabBtn({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabBtn,
        active && styles.tabBtnActive,
        pressed && { opacity: 0.9 },
      ]}
      accessibilityRole="button"
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Card({
  title,
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

/* =========================================================
   Pantalla
========================================================= */
export default function N4TemaScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "N4_Tema">>();
  const { id } = route.params ?? { id: 1 };

  const [tab, setTab] = useState<"vocab" | "gram" | "dialog">("vocab");
  const [mostrarRomaji, setMostrarRomaji] = useState(true);

  // ✅ usa tus sonidos globales
  const { playCorrect, playWrong } = useFeedbackSounds();

  // ✅ ahora el contenido viene del módulo src/content/n4
  const content = useMemo<ThemeContent>(() => getThemeContent(id), [id]);

  useEffect(() => () => Speech.stop(), []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
          {/* Breadcrumb simple */}
          <Text style={styles.breadcrumb}>Tema {id} · Nivel N4</Text>

          {/* HERO / INTRO */}
          <LinearGradient
            colors={["#F6C9D7", "#EED7F3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroTitle}>¡Empecemos!</Text>
            <Text style={styles.heroSub}>
              Practica el vocabulario, las oraciones modelo y los kanji del tema {id}. Al final harás un mini simulacro con diálogo realista.
            </Text>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TabBtn label="Vocabulario" active={tab === "vocab"} onPress={() => setTab("vocab")} />
              <TabBtn label="Gramática" active={tab === "gram"} onPress={() => setTab("gram")} />
              <TabBtn label="Diálogo" active={tab === "dialog"} onPress={() => setTab("dialog")} />
            </View>
          </LinearGradient>

          {/* ===== VOCAB ===== */}
          {tab === "vocab" && (
            <>
              {/* Objetivos */}
              {Array.isArray(content.objetivos) && content.objetivos.length > 0 && (
                <Card title="Objetivos del tema">
                  {content.objetivos.map((o: string, i: number) => (
                    <Text key={`obj-${i}`} style={styles.bullet}>• {o}</Text>
                  ))}
                </Card>
              )}

              {/* Palabras */}
              {Array.isArray(content.vocabClase) && content.vocabClase.length > 0 && (
                <Card title={`Vocabulario（${content.vocabClase.length} palabras）`}>
                  {/* Toggle romaji */}
                  <Pressable
                    onPress={() => setMostrarRomaji((v) => !v)}
                    style={({ pressed }) => [styles.toggle, pressed && { opacity: 0.9 }]}
                  >
                    <Ionicons name="language-outline" size={16} color="#7E0D18" />
                    <Text style={styles.toggleText}>
                      {mostrarRomaji ? "Ocultar rōmaji" : "Mostrar rōmaji"}
                    </Text>
                  </Pressable>

                  {(content.vocabClase as VocabClaseItem[]).map((item) => (
                    <View key={item.key} style={styles.vItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.vJP}>{item.jp}</Text>
                        {mostrarRomaji && item.romaji ? <Text style={styles.vRoma}>{item.romaji}</Text> : null}
                        <Text style={styles.vEs}>{item.es}</Text>
                      </View>
                      <Pressable
                        onPress={() => speakJP(item.jp)}
                        style={({ pressed }) => [styles.vPlay, pressed && { transform: [{ scale: 0.98 }] }]}
                        accessibilityRole="button"
                        accessibilityLabel={`Reproducir ${item.jp}`}
                      >
                        <Ionicons name="volume-high-outline" size={18} color="#7E0D18" />
                      </Pressable>
                    </View>
                  ))}
                </Card>
              )}

              {/* Oraciones */}
              {Array.isArray(content.oraciones6) && content.oraciones6.length > 0 && (
                <Card title={`Oraciones del tema（${content.oraciones6.length}）— significado y uso`}>
                  {(content.oraciones6 as OracionItem[]).map((s) => (
                    <View
                      key={s.key}
                      style={{
                        paddingVertical: 10,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: "#F0D1DA",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.vJP, { fontSize: 16 }]}>{s.jp}</Text>
                          {mostrarRomaji && s.romaji ? <Text style={styles.vRoma}>{s.romaji}</Text> : null}
                          <Text style={styles.vEs}>{s.es}</Text>
                          {s.exp ? <Text style={styles.helpText}>💡 {s.exp}</Text> : null}
                        </View>
                        <Pressable
                          onPress={() => speakJP(s.jp)}
                          style={({ pressed }) => [styles.vPlay, pressed && { transform: [{ scale: 0.98 }] }]}
                          accessibilityRole="button"
                          accessibilityLabel={`Reproducir oración`}
                        >
                          <Ionicons name="volume-high-outline" size={18} color="#7E0D18" />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </Card>
              )}
            </>
          )}

          {/* ===== GRAM ===== */}
          {tab === "gram" && (
            <>
              <Card title={content.gramatica?.titulo ?? "Gramática"}>
                {Array.isArray(content.gramatica?.puntos) &&
                  (content.gramatica?.puntos as GramPunto[]).map((p, i) => (
                    <View key={`gp-${i}`} style={{ marginTop: 8 }}>
                      <Text style={styles.gramRule}>• {p.regla}</Text>

                      {Array.isArray(p.pasoapaso) &&
                        p.pasoapaso.map((step, idx) => (
                          <Text key={`st-${idx}`} style={styles.helpText}>- {step}</Text>
                        ))}

                      {/* ejemplo principal con audio */}
                      {(p.ejemploJP || p.ejemploRoma || p.ejemploES) && (
                        <View
                          style={{
                            marginTop: 6,
                            padding: 8,
                            borderRadius: 8,
                            backgroundColor: "#FFF7FA",
                            borderWidth: 1,
                            borderColor: "#F2C7D3",
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                            <Text style={[styles.vJP, { fontSize: 15, flex: 1 }]}>{p.ejemploJP}</Text>
                            {p.ejemploJP ? (
                              <Pressable onPress={() => speakJP(p.ejemploJP!)} style={styles.vPlay} accessibilityRole="button">
                                <Ionicons name="volume-high-outline" size={18} color="#7E0D18" />
                              </Pressable>
                            ) : null}
                          </View>
                          {p.ejemploRoma ? <Text style={styles.vRoma}>{p.ejemploRoma}</Text> : null}
                          {p.ejemploES ? <Text style={styles.vEs}>{p.ejemploES}</Text> : null}
                        </View>
                      )}

                      {/* lista de ejemplos extra con audio */}
                      {Array.isArray(p.ejemplos) &&
                        p.ejemplos.map((ex, exi) => (
                          <View
                            key={`ex-${exi}`}
                            style={{
                              marginTop: 6,
                              padding: 8,
                              borderRadius: 8,
                              backgroundColor: "#FFF",
                              borderWidth: 1,
                              borderColor: "#F2C7D3",
                            }}
                          >
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                              <Text style={[styles.vJP, { fontSize: 15, flex: 1 }]}>{ex.jp}</Text>
                              <Pressable onPress={() => speakJP(ex.jp)} style={styles.vPlay} accessibilityRole="button">
                                <Ionicons name="volume-high-outline" size={18} color="#7E0D18" />
                              </Pressable>
                            </View>
                            {ex.roma ? <Text style={styles.vRoma}>{ex.roma}</Text> : null}
                            {ex.es ? <Text style={styles.vEs}>{ex.es}</Text> : null}
                          </View>
                        ))}

                      {/* tabla opcional */}
                      {p.tabla ? <MiniTableView t={p.tabla} /> : null}
                    </View>
                  ))}
              </Card>

              {/* KanjiVG */}
              {Array.isArray(content.kanji10) && content.kanji10.length > 0 ? (
                <>
                  <KanjiVGStrip items={content.kanji10 as KanjiItem[]} />
                  <Text style={styles.credit}>
                    Kanji stroke order diagrams © KanjiVG, CC BY-SA 3.0
                  </Text>
                </>
              ) : null}
            </>
          )}

          {/* ===== DIÁLOGO ===== */}
          {tab === "dialog" && (
            <>
              {Array.isArray(content.dialogos) &&
                (content.dialogos as DialogoItem[]).map((d, idx) => (
                  <DialogCard
                    key={`dg-${idx}`}
                    title={d.title}
                    kana={d.kana ?? []}
                    kanji={d.kanji ?? []}
                    es={d.es}
                  />
                ))}

              {/* Quizzes (hasta 6) */}
              {toQuizSets(content).map((q, i) => (
                <OrderDialogCard
                  key={`quiz-${i}`}
                  lines={q.lines}
                  title={`Quiz ${i + 1}: ${q.title ?? "ordena el diálogo（solo kanji de la unidad）"}`}
                  onResult={(ok) => (ok ? playCorrect() : playWrong())}
                />
              ))}
            </>
          )}

          {/* CTA */}
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
            onPress={() => navigation.navigate("CursoN4")}
            accessibilityRole="button"
            accessibilityLabel="Volver a la lista de temas N4"
          >
            <Ionicons name="chevron-back" size={18} color="#7E0D18" />
            <Text style={styles.ctaText}>Volver a Curso N4</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* =========================================================
   Subcomponentes
========================================================= */
function DialogCard({
  title,
  kana,
  kanji,
  es,
}: {
  title: string;
  kana: string[];
  kanji: string[];
  es?: string[]; // 👈 traducción por línea
}) {
  const speakAll = (lines: string[]) => {
    let i = 0;
    const say = () => {
      if (i >= lines.length) return;
      Speech.speak(lines[i], {
        language: "ja-JP",
        pitch: 1.0,
        rate: Platform.select({ ios: 0.5, android: 1.0, default: 1.0 }),
        onDone: () => {
          i++;
          say();
        },
      });
    };
    Speech.stop();
    say();
  };

  const renderSection = (label: "kana" | "kanji", lines: string[]) => (
    <View style={{ marginTop: 8 }}>
      {lines.map((line, i) => (
        <View key={`${label}-${i}`} style={{ marginTop: 6 }}>
          <View style={styles.dialogLineRow}>
            <Text style={styles.dialogLine}>{line}</Text>
            <Pressable onPress={() => speakJP(line)} style={styles.vPlay} accessibilityRole="button">
              <Ionicons name="volume-high-outline" size={18} color="#7E0D18" />
            </Pressable>
          </View>
          {Array.isArray(es) && es[i] ? (
            <Text style={[styles.vEs, { marginTop: 2 }]}>{es[i]}</Text>
          ) : null}
        </View>
      ))}
      {lines.length > 0 ? (
        <Pressable onPress={() => speakAll(lines)} style={[styles.btnGhost, { marginTop: 6 }]}>
          <Text style={styles.btnGhostText}>
            Reproducir todo ({label})
          </Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {renderSection("kana", kana)}
      <View style={{ height: 8 }} />
      {renderSection("kanji", kanji)}
    </View>
  );
}

/* === Mini tabla (para gramática) === */
function MiniTableView({ t }: { t: GramTabla }) {
  return (
    <View style={{ marginTop: 10 }}>
      {t.title ? <Text style={[styles.cardTitle, { marginBottom: 6 }]}>{t.title}</Text> : null}
      <View style={{ borderWidth: 1, borderColor: "#E9ADC0", borderRadius: 10, overflow: "hidden" }}>
        {/* header */}
        <View style={{ flexDirection: "row", backgroundColor: "#FFF5F8" }}>
          {t.headers.map((h, i) => (
            <View key={`th-${i}`} style={{ flex: 1, padding: 8, borderRightWidth: i < t.headers.length - 1 ? 1 : 0, borderColor: "#F2C7D3" }}>
              <Text style={{ fontWeight: "900", color: "#7E0D18", fontSize: 12 }}>{h}</Text>
            </View>
          ))}
        </View>
        {/* rows */}
        {t.rows.map((r, ri) => (
          <View key={`tr-${ri}`} style={{ flexDirection: "row", borderTopWidth: 1, borderColor: "#F2C7D3" }}>
            {r.map((cell, ci) => (
              <View key={`td-${ci}`} style={{ flex: 1, padding: 8, borderRightWidth: ci < t.headers.length - 1 ? 1 : 0, borderColor: "#F2C7D3" }}>
                <Text style={{ fontSize: 12, color: "#3E0B12" }}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
      {t.note ? <Text style={[styles.helpText, { marginTop: 6 }]}>※ {t.note}</Text> : null}
    </View>
  );
}

function KanjiVGStrip({ items }: { items: KanjiItem[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🈶 Kanji de la lección（trazo exacto KanjiVG）</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ gap: 12, paddingVertical: 6 }}>
        {items.map((k, i) => (
          <KanjiVGCard key={`${k.ch}-${i}`} item={k} />
        ))}
      </ScrollView>
    </View>
  );
}

function KanjiVGCard({ item }: { item: KanjiItem }) {
  // Tu KanjiItem en N4 tiene keys: ch, kun[], on[], es, trazos?, strokeCode?, ej[]
  const img = IMG_BY_KANJI[item.ch];
  const kun = item.kun?.length ? item.kun.join("・") : "—";
  const on = item.on?.length ? item.on.join("・") : "—";
  return (
    <View style={styles.kanjiCard}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.kanjiBig}>{item.ch}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.reading}>
            {kun}
            {on !== "—" && <Text style={styles.light}> ・{on}</Text>}
          </Text>
          <Text style={styles.meaning}>
            {item.es}
            {typeof item.trazos === "number" ? <Text style={styles.light}> ・ trazos: {item.trazos}</Text> : null}
          </Text>
        </View>
        <Pressable
          onPress={() => speakJP(item.kun?.[0] ?? item.on?.[0] ?? item.ch)}
          style={styles.speakBtn}
          accessibilityLabel="Escuchar lectura"
        >
          <Ionicons name="volume-high-outline" size={18} color="#3b2f2f" />
        </Pressable>
      </View>

      <View style={styles.svgBox}>
        {img ? (
          <ExpoImage source={img} style={{ width: 220, height: 220 }} contentFit="contain" />
        ) : (
          <View
            style={{
              width: 220,
              height: 220,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#e8dcc8",
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.96)",
            }}
          >
            <Text style={{ fontSize: 40, fontWeight: "900", color: "#3b2f2f" }}>
              {item.ch}
            </Text>
            <Text style={styles.svgCaption}>
              Agrega {item.strokeCode ?? ""}_web.webp → IMG_BY_KANJI
            </Text>
          </View>
        )}
      </View>

      {Array.isArray(item.ej) &&
        item.ej.map((e, idx) => (
          <Text key={`e-${idx}`} style={styles.example}>
            例：<Text style={styles.bold}>{e.jp}</Text>／{e.yomi}／{e.es}
          </Text>
        ))}
      <Text style={styles.svgCaption}>Diagrama con orden de trazos (KanjiVG)</Text>
    </View>
  );
}

/* =========================================================
   Ejercicio: Ordenar diálogo
========================================================= */
function OrderDialogCard({
  lines,
  title = "Ejercicio: ordena el diálogo",
  onResult,
}: {
  lines: string[];
  title?: string;
  onResult?: (ok: boolean) => void;
}) {
  const correct = useMemo(() => lines.map((l) => l.trim()), [lines]);
  const [pool, setPool] = useState(() =>
    shuffle(lines.map((t, i) => ({ id: `${i}`, text: t })))
  );
  const [selected, setSelected] = useState<{ id: string; text: string }[]>([]);
  const [result, setResult] = useState<"" | "ok" | "fail">("");

  const pick = (item: { id: string; text: string }, from: "pool" | "sel") => {
    setResult("");
    if (from === "pool") {
      setPool((p) => p.filter((x) => x.id !== item.id));
      setSelected((s) => [...s, item]);
    } else {
      setSelected((s) => s.filter((x) => x.id !== item.id));
      setPool((p) => [...p, item]);
    }
  };

  const comprobar = () => {
    const seq = selected.map((x) => x.text.trim());
    const ok =
      seq.length === correct.length && seq.every((t, i) => t === correct[i]);
    setResult(ok ? "ok" : "fail");
    onResult?.(ok);
  };

  const reiniciar = () => {
    setSelected([]);
    setPool(shuffle(lines.map((t, i) => ({ id: `${i}`, text: t }))));
    setResult("");
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.helpText}>
        Toca las frases en el orden correcto. Puedes tocar una seleccionada para devolverla.
      </Text>

      {/* Banco de frases */}
      <View style={styles.tokensWrap}>
        {pool.map((it) => (
          <Pressable
            key={it.id}
            onPress={() => pick(it, "pool")}
            style={({ pressed }) => [styles.token, pressed && { opacity: 0.9 }]}
            accessibilityRole="button"
            accessibilityLabel={`Elegir ${it.text}`}
          >
            <Text style={styles.tokenText}>{it.text}</Text>
          </Pressable>
        ))}
      </View>

      {/* Secuencia elegida */}
      <View
        style={[
          styles.tokensWrap,
          {
            minHeight: 48,
            backgroundColor: "#FFF7FA",
            borderColor: "#F2C7D3",
            borderWidth: 1,
            borderRadius: 10,
            padding: 6,
          },
        ]}
      >
        {selected.map((it, idx) => (
          <Pressable
            key={it.id}
            onPress={() => pick(it, "sel")}
            style={({ pressed }) => [styles.tokenSel, pressed && { opacity: 0.9 }]}
            accessibilityRole="button"
            accessibilityLabel={`Quitar ${it.text}`}
          >
            <Text style={styles.selIndex}>{idx + 1}.</Text>
            <Text style={styles.tokenSelText}>{it.text}</Text>
          </Pressable>
        ))}
      </View>

      {/* Acciones */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <Pressable onPress={reiniciar} style={({ pressed }) => [styles.btnGhost, pressed && { opacity: 0.9 }]}>
          <Text style={styles.btnGhostText}>Reiniciar</Text>
        </Pressable>
        <Pressable onPress={comprobar} style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.95 }]}>
          <Text style={styles.btnPrimaryText}>Comprobar</Text>
        </Pressable>
      </View>

      {result === "ok" && (
        <View style={[styles.notice, { borderColor: "#A7D39E", backgroundColor: "#F2FBF0" }]}>
          <Text style={[styles.noticeText, { color: "#236B2E" }]}>
            ¡Perfecto! El diálogo está en orden.
          </Text>
        </View>
      )}
      {result === "fail" && (
        <View style={[styles.notice, { borderColor: "#F2C7D3", backgroundColor: "#FFF2F6" }]}>
          <Text style={[styles.noticeText, { color: "#7E0D18" }]}>
            Aún no es el orden correcto. Intenta mover algunas frases.
          </Text>
        </View>
      )}
    </View>
  );
}

/* =========================================================
   Utils
========================================================= */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* =========================================================
   Estilos
========================================================= */
const INK = "#3b2f2f";
const BORDER = "#e8dcc8";

const styles = StyleSheet.create({
  breadcrumb: { fontSize: 12, fontWeight: "700", color: "#7E0D18", opacity: 0.8, marginBottom: 8 },

  hero: { borderRadius: 18, padding: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  heroTitle: { fontSize: 20, fontWeight: "900", color: "#5C0A14" },
  heroSub: { marginTop: 6, fontSize: 13, lineHeight: 18, color: "#5C0A14", opacity: 0.85 },

  tabs: { marginTop: 12, flexDirection: "row", gap: 10 },
  tabBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)", borderWidth: 1, borderColor: "#ECC6D6" },
  tabBtnActive: { backgroundColor: "#fff", borderColor: "#E9ADC0" },
  tabText: { fontWeight: "800", color: "#7E0D18" },
  tabTextActive: { color: "#5C0A14" },

  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#F0D1DA", borderRadius: 16, padding: 14, marginTop: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  cardTitle: { fontSize: 14, fontWeight: "900", color: "#531019" },

  bullet: { fontSize: 13, color: "#3E0B12", lineHeight: 19, marginTop: 6 },

  toggle: { alignSelf: "flex-start", flexDirection: "row", gap: 6, alignItems: "center", paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#FFF5F8", borderWidth: 1, borderColor: "#F2C7D3", borderRadius: 10, marginBottom: 8 },
  toggleText: { fontSize: 12, fontWeight: "800", color: "#7E0D18" },

  vItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F0D1DA" },
  vJP: { fontSize: 16, fontWeight: "900", color: "#2b0b10" },
  vRoma: { marginTop: 2, fontSize: 12, color: "#6E0F18", opacity: 0.8 },
  vEs: { marginTop: 2, fontSize: 13, color: "#3E0B12" },
  vPlay: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#FFF5F8", borderWidth: 1, borderColor: "#F2C7D3" },

  helpText: { marginTop: 4, fontSize: 12, color: "#6E0F18", opacity: 0.85 },
  gramRule: { fontSize: 14, fontWeight: "900", color: "#4A0C14", marginTop: 6 },

  dialogLineRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 6 },
  dialogLine: { fontSize: 14, color: "#2b0b10", flex: 1 },

  tokensWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  token: { paddingVertical: 8, paddingHorizontal: 10, backgroundColor: "#FFF5F8", borderWidth: 1, borderColor: "#F2C7D3", borderRadius: 10 },
  tokenText: { fontSize: 12, fontWeight: "700", color: "#7E0D18" },
  tokenSel: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E9ADC0", borderRadius: 10 },
  tokenSelText: { fontSize: 12, fontWeight: "800", color: "#4A0C14" },
  selIndex: { fontSize: 12, fontWeight: "900", color: "#7E0D18" },

  btnGhost: { alignItems: "center", paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: "#E9ADC0", backgroundColor: "#fff" },
  btnGhostText: { fontWeight: "900", color: "#7E0D18" },
  btnPrimary: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, backgroundColor: "#7E0D18" },
  btnPrimaryText: { fontWeight: "900", color: "#fff" },

  notice: { marginTop: 10, borderWidth: 1, borderRadius: 10, padding: 10 },
  noticeText: { fontWeight: "800" },

  // KanjiVG
  kanjiCard: { width: 260, padding: 10, borderWidth: 1, borderColor: BORDER, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.96)" },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  kanjiBig: { fontSize: 38, fontWeight: "900", color: INK, width: 52, textAlign: "center" },
  reading: { fontSize: 16, fontWeight: "800", color: INK },
  meaning: { fontSize: 14, color: INK, opacity: 0.9 },
  light: { opacity: 0.8, color: INK },
  speakBtn: { borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 8, backgroundColor: "rgba(255,255,255,0.95)" },
  svgBox: { alignItems: "center", justifyContent: "center", height: 240 },
  svgCaption: { fontSize: 12, color: INK, opacity: 0.7, marginTop: 6, textAlign: "center" },
  example: { color: INK, marginTop: 4 },
  bold: { fontWeight: "900", color: INK },
  credit: { fontSize: 11, color: INK, opacity: 0.7, marginTop: 6, textAlign: "center" },

  // CTA
  cta: { marginTop: 16, alignSelf: "center", flexDirection: "row", gap: 8, alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: "#E9ADC0", backgroundColor: "#FFF7FA" },
  ctaText: { fontWeight: "900", color: "#7E0D18" },
});

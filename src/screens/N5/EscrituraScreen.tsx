// src/screens/N5/EscrituraScreen.tsx
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

/* ★★★ XP/Logros ★★★ */
import { awardOnSuccess, useAwardOnEnter } from '../../services/achievements';

/* ===== Imágenes (ajusta rutas si cambias carpetas) ===== */
const BANNER_BAMBOO = require('../../../assets/backgrounds/bamboo_banner_transparent.webp');

const IMG_HIRAGANA = require('../../../assets/images/origenes_hiragana.webp');
const IMG_KATAKANA = require('../../../assets/images/origenes_katakana.webp');
const IMG_KANJI    = require('../../../assets/images/origenes_kanji.webp');

/* =========================
   GLOSARIO (términos tocables)
========================= */
const GLOSSARY: Record<string, string> = {
  kanji: 'Caracteres logográficos de origen chino. Aportan el núcleo de significado de muchas palabras.',
  kana: 'Los dos silabarios japoneses: hiragana y katakana.',
  hiragana: 'Silabario cursivo; 46 signos básicos. Curvas suaves. Gramática, partículas y palabras nativas.',
  katakana: 'Silabario angular; 46 signos básicos. Préstamos, onomatopeyas y énfasis.',
  manyōgana: 'Uso antiguo de kanji por su valor fonético para escribir japonés. Puente hacia hiragana/katakana.',
  furigana: 'Pequeños kana junto al kanji que indican su lectura.',
  okurigana: 'Kana que se añaden después del kanji para marcar parte fonética/inflexión (食べる, 読んだ).',
  'on’yomi': 'Lectura “china” del kanji. Común en compuestos (電話 でんわ).',
  'kun’yomi': 'Lectura nativa japonesa del kanji. Común con okurigana (読む よむ).',
  radicales: 'Componentes recurrentes que forman los kanji. Pistas de significado/lectura (氵 = agua).',
  shodō: 'Caligrafía japonesa; orden y dirección de trazos son clave (筆順).',
  gojūon: '“Cincuenta sonidos”: cuadrícula a-i-u-e-o con series ka-sa-ta… base de hiragana/katakana.',
  dakuon: 'Consonantes sonorizadas (が/ざ/だ/ば…). Se marcan con dakuten ゛.',
  handakuon: 'Consonantes semisonoras (ぱ…). Se marcan con handakuten ゜.',
  yōon: 'Combinaciones con ゃ/ゅ/ょ (kya, sha…). Se escriben con kana pequeño.',
};

/* Tooltip simple */
function useTooltip() {
  const [tip, setTip] = useState<{ visible: boolean; title: string; text: string; x: number; y: number }>(
    { visible: false, title: '', text: '', x: 0, y: 0 }
  );
  const show = (title: string, text: string, x: number, y: number) =>
    setTip({ visible: true, title, text, x, y });
  const hide = () => setTip(t => ({ ...t, visible: false }));
  return { tip, show, hide };
}

/* =========================
   ROMAJI (kana → pronunciación)
========================= */
const ROMAJI: Record<string, string> = {
  'あ':'a','い':'i','う':'u','え':'e','お':'o','ア':'a','イ':'i','ウ':'u','エ':'e','オ':'o',
  'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko','カ':'ka','キ':'ki','ク':'ku','ケ':'ke','コ':'ko',
  'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so','サ':'sa','シ':'shi','ス':'su','セ':'se','ソ':'so',
  'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to','タ':'ta','チ':'chi','ツ':'tsu','テ':'te','ト':'to',
  'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no','ナ':'na','ニ':'ni','ヌ':'nu','ネ':'ne','ノ':'no',
  'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho','ハ':'ha','ヒ':'hi','フ':'fu','ヘ':'he','ホ':'ho',
  'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo','マ':'ma','ミ':'mi','ム':'mu','メ':'me','モ':'mo',
  'や':'ya','ゆ':'yu','よ':'yo','ヤ':'ya','ユ':'yu','ヨ':'yo',
  'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro','ラ':'ra','リ':'ri','ル':'ru','レ':'re','ロ':'ro',
  'わ':'wa','を':'wo','ん':'n','ワ':'wa','ヲ':'wo','ン':'n',
  'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go','ガ':'ga','ギ':'gi','グ':'gu','ゲ':'ge','ゴ':'go',
  'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo','ザ':'za','ジ':'ji','ズ':'zu','ゼ':'ze','ゾ':'zo',
  'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do','ダ':'da','ヂ':'ji','ヅ':'zu','デ':'de','ド':'do',
  'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo','バ':'ba','ビ':'bi','ブ':'bu','ベ':'be','ボ':'bo',
  'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po','パ':'pa','ピ':'pi','プ':'pu','ペ':'pe','ポ':'po',
  'きゃ':'kya','きゅ':'kyu','きょ':'kyo','ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
  'しゃ':'sha','しゅ':'shu','しょ':'sho','じゃ':'ja','じゅ':'ju','じょ':'jo',
  'ちゃ':'cha','ちゅ':'chu','ちょ':'cho','にゃ':'nya','にゅ':'nyu','にょ':'nyo',
  'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo','びゃ':'bya','びゅ':'byu','びょ':'byo','ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
  'みゃ':'mya','みゅ':'myu','みょ':'myo','りゃ':'rya','りゅ':'ryu','りょ':'ryo',
  'キャ':'kya','キュ':'kyu','キョ':'kyo','ギャ':'gya','ギュ':'gyu','ギョ':'gyo',
  'シャ':'sha','シュ':'shu','ショ':'sho','ジャ':'ja','ジュ':'ju','ジョ':'jo',
  'チャ':'cha','チュ':'chu','チョ':'cho','ニャ':'nya','ニュ':'nyu','ニョ':'nyo',
  'ヒャ':'hya','ヒュ':'hyu','ヒョ':'hyo','ビャ':'bya','ビュ':'byo','ビョ':'byo','ピャ':'pya','ピュ':'pyu','ピョ':'pyo',
  'ミャ':'mya','ミュ':'myu','ミョ':'myo','リャ':'rya','リュ':'ryu','リョ':'ryo',
};
const VOWELS = ['a', 'i', 'u', 'e', 'o'];

/** Gojūon (básico) */
const HIRAGANA_TABLE: string[][] = [
  ['あ','い','う','え','お'],
  ['か','き','く','け','こ'],
  ['さ','し','す','せ','そ'],
  ['た','ち','つ','て','と'],
  ['な','に','ぬ','ね','の'],
  ['は','ひ','ふ','へ','ほ'],
  ['ま','み','む','め','も'],
  ['や','','ゆ','','よ'],
  ['ら','り','る','れ','ろ'],
  ['わ','','','','を'],
  ['ん','','','',''],
];
const KATAKANA_TABLE: string[][] = [
  ['ア','イ','ウ','エ','オ'],
  ['カ','キ','ク','ケ','コ'],
  ['サ','シ','ス','セ','ソ'],
  ['タ','チ','ツ','テ','ト'],
  ['ナ','ニ','ヌ','ネ','ノ'],
  ['ハ','ヒ','フ','ヘ','ホ'],
  ['マ','ミ','ム','メ','モ'],
  ['ヤ','','ユ','','ヨ'],
  ['ラ','リ','ル','レ','ロ'],
  ['ワ','','','','ヲ'],
  ['ン','','','',''],
];
const ROW_LABELS = ['∅','k','s','t','n','h','m','y','r','w','n'];

/** Dakuon / Handakuon */
const HIRAGANA_DAKUON: string[][] = [
  ['が','ぎ','ぐ','げ','ご'],
  ['ざ','じ','ず','ぜ','ぞ'],
  ['だ','ぢ','づ','で','ど'],
  ['ば','び','ぶ','べ','ぼ'],
  ['ぱ','ぴ','ぷ','ぺ','ぽ'],
];
const KATAKANA_DAKUON: string[][] = [
  ['ガ','ギ','グ','ゲ','ゴ'],
  ['ザ','ジ','ズ','ゼ','ゾ'],
  ['ダ','ヂ','ヅ','デ','ド'],
  ['バ','ビ','ブ','ベ','ボ'],
  ['パ','ピ','プ','ペ','ポ'],
];
const DAKUON_ROW_LABELS = ['g','z','d','b','p'];

/** Yōon (kya, sha, …) */
const H_YOON_GROUPS: string[][] = [
  ['きゃ','きゅ','きょ'],['ぎゃ','ぎゅ','ぎょ'],['しゃ','しゅ','しょ'],['じゃ','じゅ','じょ'],['ちゃ','ちゅ','ちょ'],
  ['にゃ','にゅ','にょ'],['ひゃ','ひゅ','ひょ'],['びゃ','びゅ','びょ'],['ぴゃ','ぴゅ','ぴょ'],['みゃ','みゅ','みょ'],['りゃ','りゅ','りょ'],
];
const K_YOON_GROUPS: string[][] = [
  ['キャ','キュ','キョ'],['ギャ','ギュ','ギョ'],['シャ','シュ','ショ'],['ジャ','ジュ','ジョ'],['チャ','チュ','チョ'],
  ['ニャ','ニュ','ニョ'],['ヒャ','ヒュ','ヒョ'],['ビャ','ビュ','ビョ'],['ピャ','ピュ','ピョ'],['ミャ','ミュ','ミョ'],['リャ','リュ','リョ'],
];

/** 20 Kanji de ejemplo */
type KanjiItem = { char: string; on: string; kun: string; meaning: string };
const KANJI_EXAMPLES: KanjiItem[] = [
  { char:'日', on:'ニチ',  kun:'ひ',   meaning:'sol / día' },
  { char:'月', on:'ゲツ',  kun:'つき', meaning:'luna / mes' },
  { char:'火', on:'カ',    kun:'ひ',   meaning:'fuego' },
  { char:'水', on:'スイ',  kun:'みず', meaning:'agua' },
  { char:'木', on:'モク',  kun:'き',   meaning:'árbol' },
  { char:'金', on:'キン',  kun:'かね', meaning:'oro / dinero' },
  { char:'土', on:'ド',    kun:'つち', meaning:'tierra' },
  { char:'山', on:'サン',  kun:'やま', meaning:'montaña' },
  { char:'川', on:'セン',  kun:'かわ', meaning:'río' },
  { char:'人', on:'ジン',  kun:'ひと', meaning:'persona' },
  { char:'口', on:'コウ',  kun:'くち', meaning:'boca' },
  { char:'目', on:'モク',  kun:'め',   meaning:'ojo' },
  { char:'手', on:'シュ',  kun:'て',   meaning:'mano' },
  { char:'力', on:'リョク',kun:'ちから', meaning:'fuerza' },
  { char:'学', on:'ガク',  kun:'まな(ぶ)', meaning:'estudio' },
  { char:'生', on:'セイ',  kun:'い(きる)・う(まれる)', meaning:'vida / nacer' },
  { char:'先', on:'セン',  kun:'さき', meaning:'antes / previo' },
  { char:'国', on:'コク',  kun:'くに', meaning:'país' },
  { char:'語', on:'ゴ',    kun:'かた(る)', meaning:'lengua / contar' },
  { char:'校', on:'コウ',  kun:'—',       meaning:'escuela' },
];

/* =========================
   PANTALLA
========================= */
export default function EscrituraScreen() {
  const { tip, show, hide } = useTooltip();

  /* ▼▼▼ XP al entrar (primera visita + repetición) ▼▼▼ */
  useAwardOnEnter('N5_Escritura', {
    xpOnEnter: 10,
    repeatXp: 5,
    achievementId: 'intro_primera_visita',
    achievementSub: 'N5',
    meta: { label: 'Escritura N5' },
  });

  // Modal final de logro
  const [showCongrats, setShowCongrats] = useState(false);
  const [finalScore, setFinalScore] = useState<{ ok: number; total: number }>({ ok: 0, total: 0 });

  const handleQuizComplete = useCallback(async (ok: number, total: number) => {
    setFinalScore({ ok, total });
    setShowCongrats(true);
    try {
      // +20 XP + logro "senseidevista" (idempotente)
      await awardOnSuccess('N5_Escritura', {
        xpOnSuccess: 20,
        achievementId: 'senseidevista',
        achievementSub: 'N5',
        meta: { score: ok, total },
      });
    } catch {}
  }, []);

  // 🔊 Hablar una sílaba (kana) con voz japonesa
  const speakKana = (kana: string) => {
    if (!kana?.trim()) return;
    try {
      Speech.stop();
      Speech.speak(kana, { language: 'ja-JP', pitch: 1.0, rate: 0.9 });
    } catch {}
  };

  const pronounce = (kana: string, x: number, y: number) => {
    const clean = (kana || '').trim();
    if (!clean) return;
    speakKana(clean);
    const r = ROMAJI[clean];
    const text = r ? `Se pronuncia: ${r}` : 'Aún no tengo la transcripción exacta 🙈 (próximamente).';
    show(clean, text, x, y);
  };

  // Palabra tocable (verde)
  const Term = ({ k, children }: { k: keyof typeof GLOSSARY; children: React.ReactNode }) => (
    <Text
      onPressIn={(e) => {
        const { pageX, pageY } = e.nativeEvent;
        show(String(children), GLOSSARY[k], pageX, pageY);
      }}
      style={s.term}
      suppressHighlighting={false}
    >
      <Text style={s.termInner}>{children}</Text>
    </Text>
  );

  type QuizItem = { c: string; correct: 'Hiragana'|'Katakana'|'Kanji'; why: string };
  const questions: QuizItem[] = useMemo(
    () => [
      { c: 'あ', correct: 'Hiragana', why: 'Curva suave típica de hiragana.' },
      { c: 'カ', correct: 'Katakana', why: 'Trazos rectos, angulosos: katakana.' },
      { c: '学', correct: 'Kanji',    why: 'Ideograma con significado (estudio).' },
      { c: 'み', correct: 'Hiragana', why: 'Hiragana redondeado.' },
      { c: 'ソ', correct: 'Katakana', why: 'Ángulos de katakana (ojo con ン/ソ).' },
      { c: '海', correct: 'Kanji',    why: 'Kanji con radical de agua 氵 + “mar”.' },
    ],
    []
  );

  return (
    <View style={s.root}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" />
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" nestedScrollEnabled>

        {/* TIP arriba */}
        <View style={s.notice}>
          <Text style={s.noticeTitle}>💡 Tip interactivo</Text>
          <Text style={s.noticeText}>
            Toca las <Text style={s.boldWhite}>palabras en <Text style={s.boldWhite}>verde</Text></Text> o cualquier
            <Text style={s.boldWhite}> cuadro de las tablas</Text> para escuchar y ver su definición/lectura.
          </Text>
        </View>

        {/* TARJETA 1: Historia + imágenes */}
        <Card>
          <CardBanner />
          <Text style={s.h1}>Cómo nació la escritura japonesa ✍️</Text>
          <Text style={s.pJ}>
            Antes de los teclados, Japón escribía con <Term k="kanji">kanji</Term> prestados de China.
            Para anotar el japonés tal cual sonaba, surgió <Term k="manyōgana">manyōgana</Term> (kanji por sonido).
            Con el tiempo, esa idea se simplificó en dos silabarios: <Term k="hiragana">hiragana</Term>, de curvas fluidas,
            y <Term k="katakana">katakana</Term>, de líneas rectas y ángulos.
          </Text>

          <View style={s.grid3}>
            <View style={s.cardLite}>
              <Image source={IMG_HIRAGANA} style={s.thumb} />
              <Text style={s.h3}>Hiragana</Text>
              <Text style={s.p}>
                Curvo y redondeado. 46 signos (<Term k="gojūon">gojūon</Term>). Partículas y
                <Term k="okurigana"> okurigana</Term>. Ej.: こんにちは、ありがとう。
              </Text>
            </View>
            <View style={s.cardLite}>
              <Image source={IMG_KATAKANA} style={s.thumb} />
              <Text style={s.h3}>Katakana</Text>
              <Text style={s.p}>
                Recto y angular. 46 signos. Préstamos y onomatopeyas. Ej.: コンピュータ、ゲーム、ドキドキ。
              </Text>
            </View>
            <View style={s.cardLite}>
              <Image source={IMG_KANJI} style={s.thumb} />
              <Text style={s.h3}>Kanji</Text>
              <Text style={s.p}>
                Ideogramas con <Term k="radicales">radicales</Term> y lecturas <Term k="on’yomi">on</Term>/<Term k="kun’yomi">kun</Term>.
                En <Term k="shodō">shodō</Term> importa el orden de trazos.
              </Text>
            </View>
          </View>
        </Card>

        {/* TARJETA 2: on/kun */}
        <Card>
          <CardBanner />
          <Text style={s.h2}>Kanji: on’yomi y kun’yomi 🔎</Text>
          <Text style={s.pJ}>
            La <Term k="on’yomi">on’yomi</Term> es la lectura de origen chino, muy común en <Text style={s.bold}>compuestos</Text>:
            電話（でんわ）= 電(デン) + 話(ワ). La <Term k="kun’yomi">kun’yomi</Term> es la lectura nativa:
            読む（よむ）, 読んだ（よんだ）. Identifica el <Term k="radicales">radical</Term>, memoriza lecturas frecuentes y apóyate en
            <Term k="furigana"> furigana</Term>.
          </Text>
        </Card>

        {/* TABLAS */}
        <Card>
          <CardBanner />
          <Text style={s.h2}>Hiragana — gojūon (básico)</Text>
          <KanaGridSimple rows={HIRAGANA_TABLE} rowLabels={ROW_LABELS} onPronounce={pronounce} />
        </Card>

        <Card>
          <CardBanner />
          <Text style={s.h2}>Hiragana — dakuon / handakuon</Text>
          <KanaGridSimple rows={HIRAGANA_DAKUON} rowLabels={DAKUON_ROW_LABELS} onPronounce={pronounce} />
        </Card>

        <Card>
          <CardBanner />
          <Text style={s.h2}>Hiragana — yōon (ゃ/ゅ/ょ)</Text>
          <YoonGridSimple groups={H_YOON_GROUPS} onPronounce={pronounce} />
          <Text style={s.caption}>* Yōon = combinación con ゃ/ゅ/ょ. Ej.: き + ゃ → きゃ = <Text style={s.bold}>kya</Text>.</Text>
        </Card>

        <Card>
          <CardBanner />
          <Text style={s.h2}>Katakana — gojūon (básico)</Text>
          <KanaGridSimple rows={KATAKANA_TABLE} rowLabels={ROW_LABELS} onPronounce={pronounce} />
        </Card>

        <Card>
          <CardBanner />
          <Text style={s.h2}>Katakana — dakuon / handakuon</Text>
          <KanaGridSimple rows={KATAKANA_DAKUON} rowLabels={DAKUON_ROW_LABELS} onPronounce={pronounce} />
        </Card>

        <Card>
          <CardBanner />
          <Text style={s.h2}>Katakana — yōon (ャ/ュ/ョ)</Text>
          <YoonGridSimple groups={K_YOON_GROUPS} onPronounce={pronounce} />
          <Text style={s.caption}>* Yōon = combinación con ャ/ュ/ョ.</Text>
        </Card>

        {/* 20 KANJI */}
        <Card>
          <CardBanner />
          <Text style={s.h2}>20 kanji para abrir camino</Text>
          <View style={s.kanjiGrid}>
            {KANJI_EXAMPLES.map((k, i) => (
              <View key={i} style={s.kanjiCard}>
                <Text style={s.kanjiChar}>{k.char}</Text>
                <Text style={s.kanjiReading}>On: {k.on} · Kun: {k.kun}</Text>
                <Text style={s.kanjiMeaning}>{k.meaning}</Text>
              </View>
            ))}
          </View>
          <Text style={[s.caption, { marginTop: 8 }]}>
            Tip: aprende radical, cuenta trazos y practica el orden de escritura (shodō).
          </Text>
        </Card>

        {/* QUIZ */}
        <Card>
          <CardBanner />
          <IdentifyQuiz questions={questions} onComplete={handleQuizComplete} />
        </Card>

      </ScrollView>

      {/* OVERLAY ROJO (glosario + pronunciación) */}
      {tip.visible && (
        <Pressable style={s.overlay} onPress={hide}>
          <View style={[s.tooltip, { top: Math.max(tip.y - 120, 90), left: 16, right: 16 }]}>
            <Text style={s.tooltipTitle}>{tip.title}</Text>
            <Text style={s.tooltipText}>{tip.text}</Text>
          </View>
        </Pressable>
      )}

      {/* MODAL DE LOGRO FINAL */}
      {showCongrats && (
        <Pressable style={s.congratsOverlay} onPress={() => setShowCongrats(false)}>
          <View style={s.congratsCard}>
            <Text style={s.congratsTitle}>🎉 ¡Logro desbloqueado!</Text>
            <Text style={s.congratsName}>senseidevista</Text>
            <Text style={s.congratsXP}>+20 XP</Text>
            <Text style={s.congratsScore}>Puntuación: {finalScore.ok}/{finalScore.total}</Text>
            <Text style={s.congratsHint}>Toca para cerrar</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

/* =========================
   Componentes de tarjeta
========================= */
function Card({ children }: { children: React.ReactNode }) {
  return <View style={s.card}>{children}</View>;
}
function CardBanner() {
  return <Image source={BANNER_BAMBOO} style={s.banner} resizeMode="cover" />;
}

/* =========================
   Grids simplificados dentro de tarjeta
========================= */
function KanaGridSimple({
  rows, rowLabels, onPronounce,
}: {
  rows: string[][];
  rowLabels: string[];
  onPronounce: (kana: string, x: number, y: number) => void;
}) {
  return (
    <>
      {/* Cabecera vocales */}
      <View style={[s.row, s.rowHead]}>
        <View style={[s.cellHead, { width: 38 }]} />
        {VOWELS.map((v) => (
          <View key={v} style={[s.cellHead, s.cell, s.cellBorder]}>
            <Text style={s.cellHeadTxt}>{v}</Text>
          </View>
        ))}
      </View>

      {rows.map((r, i) => (
        <View key={i} style={s.row}>
          <View style={[s.cellHead, { width: 38 }]}>
            <Text style={s.cellHeadTxt}>{rowLabels[i] ?? ''}</Text>
          </View>
          {r.map((ch, j) => {
            const kana = ch || ' ';
            return (
              <Pressable
                key={`${i}-${j}`}
                onPressIn={(e) => onPronounce(kana.trim(), e.nativeEvent.pageX, e.nativeEvent.pageY)}
                android_ripple={{ color: '#fca5a5' }}
                style={[s.cell, s.cellBorder]}
              >
                <Text style={s.cellTxt}>{kana}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </>
  );
}

function YoonGridSimple({
  groups, onPronounce,
}: {
  groups: string[][];
  onPronounce: (kana: string, x: number, y: number) => void;
}) {
  return (
    <View style={s.yoonWrap}>
      {groups.map((g, idx) => (
        <View key={idx} style={s.yoonGroup}>
          {g.map((syll, j) => (
            <Pressable
              key={j}
              onPressIn={(e) => onPronounce(syll, e.nativeEvent.pageX, e.nativeEvent.pageY)}
              android_ripple={{ color: '#fca5a5' }}
              style={s.yoonCell}
            >
              <Text style={s.yoonTxt}>{syll}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

/* =========================
   Quiz
========================= */
type ScriptKind = 'Hiragana' | 'Katakana' | 'Kanji';
function IdentifyQuiz({
  questions,
  onComplete,
}: {
  questions: { c: string; correct: ScriptKind; why: string }[];
  onComplete?: (ok: number, total: number) => void;
}) {
  const [answers, setAnswers] = React.useState<number[]>(Array(questions.length).fill(-1));
  const [finished, setFinished] = React.useState(false);

  const press = (qIdx: number, optIndex: number) => {
    const okIndex = (['Hiragana', 'Katakana', 'Kanji'] as ScriptKind[]).indexOf(questions[qIdx].correct);
    setAnswers(prev => {
      if (prev[qIdx] !== -1) return prev; // no permitir cambiar respuesta
      const next = [...prev];
      next[qIdx] = optIndex;
      return next;
    });
  };

  const correct = answers.reduce((acc, cur, i) => {
    const okIndex = (['Hiragana', 'Katakana', 'Kanji'] as ScriptKind[]).indexOf(questions[i].correct);
    return acc + (cur === okIndex ? 1 : 0);
  }, 0);

  // Dispara onComplete UNA sola vez cuando todas estén respondidas
  useEffect(() => {
    if (!finished && answers.every(a => a !== -1)) {
      setFinished(true);
      onComplete?.(correct, questions.length);
    }
  }, [answers, finished, correct, questions.length, onComplete]);

  return (
    <View>
      <Text style={s.h2}>Identifica el sistema</Text>
      {questions.map((q, qIdx) => (
        <View key={qIdx} style={{ marginBottom: 16 }}>
          <Text style={s.h3}>{qIdx + 1}. {q.c}</Text>
          <View style={{ gap: 8, marginTop: 6 }}>
            {(['Hiragana','Katakana','Kanji'] as ScriptKind[]).map((opt, i) => {
              const chosen = answers[qIdx] === i;
              const ok = opt === q.correct;
              return (
                <Pressable
                  key={opt}
                  onPressIn={() => press(qIdx, i)}
                  android_ripple={{ color: '#e5e7eb' }}
                  style={[s.opt, chosen && (ok ? s.optOk : s.optNo)]}
                >
                  <Text style={[s.optTxt, chosen && { color: '#111827' }]}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
          {answers[qIdx] !== -1 && (
            <Text style={[s.pJ, { marginTop: 6 }]}>
              {(answers[qIdx] === (['Hiragana','Katakana','Kanji'] as ScriptKind[]).indexOf(q.correct))
                ? '✅ ¡Correcto!' : '❌ No exactamente.'} {q.why}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

/* =========================
   ESTILOS (tema con fondo verde claro)
========================= */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ECFDF5' }, // verde claro
  content: { padding: 20, paddingBottom: 40, gap: 12 },

  // Aviso
  notice: {
    backgroundColor: '#1f2937',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#111827',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  noticeTitle: { color: '#fff', fontWeight: '800', marginBottom: 4, fontSize: 14 },
  noticeText: { color: '#fff', fontSize: 13, lineHeight: 20 },
  boldWhite: { color: '#fff', fontWeight: '800' },

  // Tarjeta
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    overflow: 'hidden',
    gap: 8,
  },

  // Banner superior de cada tarjeta
  banner: { width: '100%', height: 52, borderTopLeftRadius: 18, borderTopRightRadius: 18 },

  // Tipografía
  h1: { color: '#111827', fontSize: 22, fontWeight: '800' },
  h2: { color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  h3: { color: '#111827', fontSize: 16, fontWeight: '700', marginBottom: 6 },

  pJ: { color: '#374151', fontSize: 14, lineHeight: 22, textAlign: 'justify' },
  p: { color: '#374151', fontSize: 14, lineHeight: 20 },
  caption: { color: '#6b7280', fontSize: 12 },

  // grid de 3 tarjetas pequeñas
  grid3: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  cardLite: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  thumb: { width: '100%', height: 100, borderRadius: 10, marginBottom: 8, resizeMode: 'cover' },

  // Tablas
  row: { flexDirection: 'row' },
  rowHead: { marginBottom: 2 },
  cell: { width: 46, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  cellBorder: { borderWidth: 1, borderColor: '#e5e7eb' },
  cellHead: { height: 36, alignItems: 'center', justifyContent: 'center' },
  cellHeadTxt: { color: '#6b7280', fontWeight: '800' },
  cellTxt: { color: '#111827', fontSize: 16 },

  // Yōon grid
  yoonWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  yoonGroup: {
    width: '31%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  yoonCell: {
    width: '100%', paddingVertical: 6, alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, backgroundColor: '#f9fafb', marginBottom: 6,
  },
  yoonTxt: { fontSize: 18, color: '#111827' },

  // Kanji grid
  kanjiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kanjiCard: {
    width: '47.5%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  kanjiChar: { fontSize: 32, color: '#111827', lineHeight: 34 },
  kanjiReading: { color: '#6b7280', marginTop: 6 },
  kanjiMeaning: { color: '#374151' },

  // Quiz
  opt: { borderWidth: 1, borderColor: '#cfd6df', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#ffffff' },
  optOk: { backgroundColor: '#c8f7c5', borderColor: '#8ee08a' },
  optNo: { backgroundColor: '#fde2e2', borderColor: '#f5b5b5' },
  optTxt: { color: '#111827', fontSize: 14 },

  // Term & tooltip
  term: { paddingHorizontal: 2 },
  termInner: { fontWeight: '800', color: '#16a34a' }, // VERDE tocable
  bold: { fontWeight: '800', color: '#111827' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,24,39,0.25)',
    justifyContent: 'flex-start',
    zIndex: 9999,
    elevation: 50,
  },
  tooltip: {
    position: 'absolute',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#b91c1c',
  },
  tooltipTitle: { color: '#fff', fontWeight: '800', marginBottom: 4, fontSize: 14 },
  tooltipText: { color: '#fff', fontSize: 13, lineHeight: 19 },

  // Modal de logro final (estilo neutro, no interfiere)
  congratsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  congratsCard: {
    width: 300,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#A7F3D0', // verde suave para esta pantalla
    alignItems: 'center',
  },
  congratsTitle: { fontWeight: '900', color: '#1f2937', fontSize: 16, marginBottom: 6 },
  congratsName: { fontWeight: '900', color: '#065f46', fontSize: 18 },
  congratsXP: { fontWeight: '900', color: '#059669', marginTop: 2 },
  congratsScore: { color: '#374151', marginTop: 4 },
  congratsHint: { color: '#6b7280', fontSize: 12, marginTop: 10 },
});

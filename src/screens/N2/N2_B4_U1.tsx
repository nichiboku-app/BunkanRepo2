// src/screens/N2/N2_B4_U1.tsx
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import UnitTemplate from "./UnitTemplate";

const { width } = Dimensions.get("window");
const accent = "#A855F7"; // B4 - Noticias/Medios (violeta)
const BG = "#0B0F19";
const BORDER = "rgba(255,255,255,0.08)";
const CARD_W = (width - 16 * 2 - 12) / 2; // grid 2 columnas

function speakJP(t: string) {
  try { Speech.stop(); Speech.speak(t, { language: "ja-JP", rate: 1.0 }); } catch {}
}
function speakES(t: string) {
  try { Speech.stop(); Speech.speak(t, { language: "es-MX", rate: 1.0 }); } catch {}
}

type Headline = {
  jp: string;
  yomi?: string;   // lectura (kana)
  es: string;      // traducción
};

function HeadlineCard({ h }: { h: Headline }) {
  const [showEs, setShowEs] = useState(false);
  return (
    <View style={styles.card}>
      <Text style={styles.headJP}>{h.jp}</Text>
      {!!h.yomi && <Text style={styles.yomi}>{h.yomi}</Text>}
      {showEs && <Text style={styles.es}>{h.es}</Text>}

      <View style={styles.row}>
        <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => speakJP(h.jp)}>
          <MCI name="play" size={16} color="#fff" />
          <Text style={styles.btnText}>JP</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => speakES(h.es)}>
          <MCI name="play-circle" size={16} color="#fff" />
          <Text style={styles.btnText}>ES</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnAlt]} onPress={() => setShowEs(v => !v)}>
          <MCI name={showEs ? "eye-off" : "eye"} size={16} color="#0B0F19" />
          <Text style={[styles.btnText, { color: "#0B0F19" }]}>{showEs ? "Ocultar" : "Traducción"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ================= Titulares estilo NHK Easy (35) ================= */
const HEADLINES: Headline[] = [
  { jp: "政府、最低賃金の引き上げを正式決定", yomi: "せいふ、さいていちんぎん の ひきあげ を せいしき けってい", es: "El gobierno decide oficialmente aumentar el salario mínimo." },
  { jp: "台風12号が上陸、各地で警戒続く", yomi: "たいふう じゅうに ごう が じょうりく、かくち で けいかい つづく", es: "El tifón Nº 12 toca tierra; continúa la alerta en varias regiones." },
  { jp: "新型車の発表、燃費と安全性が大幅に改善", yomi: "しんがた しゃ の はっぴょう、ねんぴ と あんぜんせい が おおはば に かいぜん", es: "Presentan nuevo modelo; gran mejora en consumo y seguridad." },
  { jp: "観光客が増加、地方都市で経済効果", yomi: "かんこうきゃく が ぞうか、ちほう とし で けいざい こうか", es: "Aumentan turistas; impacto económico en ciudades regionales." },
  { jp: "企業のリモート勤務が定着、柔軟な働き方広がる", yomi: "きぎょう の リモート きんむ が ていちゃく、じゅうなん な はたらきかた ひろがる", es: "El trabajo remoto se consolida; crece la flexibilidad laboral." },
  { jp: "学校でICT教育を強化、授業の質向上へ", yomi: "がっこう で アイシーティー きょういく を きょうか、じゅぎょう の しつ こうじょう へ", es: "Refuerzan la educación con TIC; hacia clases de mayor calidad." },
  { jp: "エネルギー価格の高止まり、節電呼びかけ", yomi: "エネルギー かかく の たかどまり、せつでん よびかけ", es: "Persisten altos precios de energía; llaman a ahorrar electricidad." },
  { jp: "大型連休に向けて交通量増、各社が増便", yomi: "おおがた れんきゅう に むけて こうつうりょう ぞう、かくしゃ が ぞうびん", es: "De cara a los puentes largos, sube el tráfico; más servicios." },
  { jp: "地域の防災訓練を実施、住民の参加率上がる", yomi: "ちいき の ぼうさい くんれん を じっし、じゅうみん の さんかりつ あがる", es: "Realizan simulacros; aumenta la participación ciudadana." },
  { jp: "新しい美術展が開幕、若手作家に注目", yomi: "あたらしい びじゅつてん が かいまく、わかて さっか に ちゅうもく", es: "Inauguran expo de arte; atención en artistas jóvenes." },
  // +25 titulares extra
  { jp: "食品ロス削減へ新制度、コンビニで実証", yomi: "しょくひん ロス さくげん へ しんせいど、コンビニ で じっしょう", es: "Nuevo sistema contra desperdicio de alimentos; pruebas en konbini." },
  { jp: "新薬が承認、難病治療に新たな選択肢", yomi: "しんやく が しょうにん、なんびょう ちりょう に あらたな せんたくし", es: "Aprueban fármaco; nueva opción para enfermedades raras." },
  { jp: "円安続く、輸出企業の収益改善", yomi: "えんやす つづく、ゆしゅつ きぎょう の しゅうえき かいぜん", es: "Continúa la depreciación del yen; exportadoras mejoran ingresos." },
  { jp: "猛暑日が最多更新、熱中症対策を徹底", yomi: "もうしょび が さいた こうしん、ねっちゅうしょう たいさく を てってい", es: "Récord de días de calor extremo; refuerzan medidas contra golpes de calor." },
  { jp: "火山活動が活発化、周辺地域に注意喚起", yomi: "かざん かつどう が かっぱつか、しゅうへん ちいき に ちゅうい かんき", es: "Aumenta actividad volcánica; alertan a zonas cercanas." },
  { jp: "世界大会で日本勢が健闘、メダル獲得", yomi: "せかい たいかい で にほん ぜい が けんとう、メダル かくとく", es: "Japón destaca en torneo mundial; logra medallas." },
  { jp: "再生可能エネルギーの導入進む", yomi: "さいせい かのう エネルギー の どうにゅう すすむ", es: "Avanza la adopción de energías renovables." },
  { jp: "子育て支援を拡充、保育定員を増やす方針", yomi: "こそだて しえん を かくじゅう、ほいく ていいん を ふやす ほうしん", es: "Amplían apoyo a crianza; planean más cupos en guarderías." },
  { jp: "古民家の活用広がる、観光資源として注目", yomi: "こみんか の かつよう ひろがる、かんこう しげん として ちゅうもく", es: "Crece el uso de casas tradicionales como atractivo turístico." },
  { jp: "AI活用で業務効率化、自治体でも導入", yomi: "エーアイ かつよう で ぎょうむ こうりつか、じちたい でも どうにゅう", es: "IA mejora eficiencia; gobiernos locales empiezan a usarla." },
  { jp: "新学期が始まる、各校で入学式", yomi: "しんがっき が はじまる、かくこう で にゅうがくしき", es: "Comienza el nuevo ciclo; ceremonias de ingreso en escuelas." },
  { jp: "ごみ分別の徹底呼びかけ、罰則も強化", yomi: "ごみ ぶんべつ の てってい よびかけ、ばっそく も きょうか", es: "Llaman a separar residuos; refuerzan sanciones." },
  { jp: "地震の影響で一部路線が運休", yomi: "じしん の えいきょう で いちぶ ろせん が うんきゅう", es: "Por el sismo, suspenden parcialmente algunas líneas." },
  { jp: "スマホ決済が拡大、現金離れが進む", yomi: "スマホ けっさい が かくだい、げんきん ばなれ が すすむ", es: "Crece el pago móvil; disminuye el uso de efectivo." },
  { jp: "外国人観光客向け案内を多言語化", yomi: "がいこくじん かんこうきゃく むけ あんない を たげんご か", es: "Más idiomas en señales para turistas extranjeros." },
  { jp: "物価上昇が家計を直撃、節約志向強まる", yomi: "ぶっか じょうしょう が かけい を ちょくげき、せつやく しこう つよまる", es: "La inflación golpea hogares; crece el ahorro." },
  { jp: "オンライン学習が定着、教材のデジタル化進む", yomi: "オンライン がくしゅう が ていちゃく、きょうざい の デジタルか すすむ", es: "Se asienta el aprendizaje en línea; digitalizan materiales." },
  { jp: "電力需給がひっ迫、節電ポイント制度検討", yomi: "でんりょく じゅきゅう が ひっぱく、せつでん ポイント せいど けんとう", es: "Ajustada oferta de electricidad; evalúan puntos por ahorro." },
  { jp: "河川の氾濫に警戒、避難情報を確認", yomi: "かせん の はんらん に けいかい、ひなん じょうほう を かくにん", es: "Riesgo de desbordes; verifican avisos de evacuación." },
  { jp: "医療体制を強化、発熱外来を増設", yomi: "いりょう たいせい を きょうか、はつねつ がいらい を ぞうせつ", es: "Refuerzan sistema médico; amplían clínicas de fiebre." },
  { jp: "新規開業支援で地域活性、商店街に活気", yomi: "しんき かいぎょう しえん で ちいき かっせい、しょうてんがい に かっき", es: "Apoyo a nuevos negocios; reactivan zonas comerciales." },
  { jp: "マイナンバーの運用改善、利便性向上へ", yomi: "マイナンバー の うんよう かいぜん、りべんせい こうじょう へ", es: "Mejoras al sistema MyNumber; más facilidad de uso." },
  { jp: "プラスチック削減へ紙容器の採用進む", yomi: "プラスチック さくげん へ かみ ようき の さいよう すすむ", es: "Adoptan envases de papel para reducir plásticos." },
  { jp: "交通マナー向上へ啓発、違反取り締まり強化", yomi: "こうつう マナー こうじょう へ けいはつ、いはん とりしまり きょうか", es: "Campañas de civismo vial; endurecen controles." },
  { jp: "新駅ビルが開業、地域の新たな拠点に", yomi: "しん えきビル が かいぎょう、ちいき の あらたな きょてん に", es: "Abre complejo en estación; nuevo polo local." },
  { jp: "自治体DXが加速、窓口手続きのオンライン化", yomi: "じちたい ディーエックス が かそく、まどぐち てつづき の オンライン か", es: "Digitalización municipal acelera; trámites en línea." },
  { jp: "若者の投票率向上へ、期日前投票を促進", yomi: "わかもの の とうひょうりつ こうじょう へ、きじつまえ とうひょう を そくしん", es: "Impulsan voto anticipado para subir participación joven." },
  { jp: "図書館で夜間開館を試行、学習需要に対応", yomi: "としょかん で やかん かいかん を しこう、がくしゅう じゅよう に たいおう", es: "Bibliotecas prueban horario nocturno; responden a demanda." },
  { jp: "観光列車が運行開始、沿線の魅力を発信", yomi: "かんこう れっしゃ が うんこう かいし、えんせん の みりょく を はっしん", es: "Inicia tren turístico; promocionan atractivos de la ruta." },
  { jp: "高齢者の見守り強化、地域で協力体制", yomi: "こうれいしゃ の みまもり きょうか、ちいき で きょうりょく たいせい", es: "Refuerzan cuidado de mayores con apoyo comunitario." },
  { jp: "防犯カメラの増設進む、犯罪抑止に効果", yomi: "ぼうはん カメラ の ぞうせつ すすむ、はんざい よくし に こうか", es: "Instalan más cámaras; efecto disuasivo del delito." },
  { jp: "海のプラごみ回収に新技術、試験運用へ", yomi: "うみ の プラ ごみ かいしゅう に しん ぎじゅつ、しけん うんよう へ", es: "Nueva tecnología para recoger plásticos del mar; pruebas en marcha." },
  { jp: "中小企業の賃上げ支援、補助制度を拡充", yomi: "ちゅうしょう きぎょう の ちんあげ しえん、ほじょ せいど を かくじゅう", es: "Amplían subsidios para fomentar alzas salariales en pymes." },
  { jp: "観測史上最大の雨量、土砂災害に厳重警戒", yomi: "かんそく しじょう さいだい の うりょう、どしゃ さいがい に げんじゅう けいかい", es: "Lluvias récord; extrema alerta por deslaves." },
  { jp: "大学入試の出願開始、オンライン受付も", yomi: "だいがく にゅうし の しゅつがん かいし、オンライン うけつけ も", es: "Abre periodo de solicitud a universidades; también en línea." },
];

/* ================= KANJI PRO — 20 kanji de noticias × 4 palabras ================= */
type KV = { w: string; yomi: string; es: string };
type KCard = { kanji: string; on?: string; kun?: string; es: string; palabras: KV[] };

const KANJI: KCard[] = [
  { kanji:"報", on:"ホウ", kun:"むく(いる)", es:"informar/報告", palabras:[
    { w:"報道", yomi:"ほうどう", es:"cobertura (prensa)" },
    { w:"報告", yomi:"ほうこく", es:"reporte" },
    { w:"情報", yomi:"じょうほう", es:"información" },
    { w:"速報", yomi:"そくほう", es:"boletín urgente" },
  ]},
  { kanji:"道", on:"ドウ", kun:"みち", es:"camino/vía", palabras:[
    { w:"街道", yomi:"かいどう", es:"calzada/ruta" },
    { w:"報道", yomi:"ほうどう", es:"prensa (cobertura)" },
    { w:"鉄道", yomi:"てつどう", es:"ferrocarril" },
    { w:"歩道", yomi:"ほどう", es:"banqueta" },
  ]},
  { kanji:"記", on:"キ", kun:"しる(す)", es:"anotar/artículo", palabras:[
    { w:"記事", yomi:"きじ", es:"artículo" },
    { w:"記者", yomi:"きしゃ", es:"reportero" },
    { w:"日記", yomi:"にっき", es:"diario" },
    { w:"記録", yomi:"きろく", es:"registro" },
  ]},
  { kanji:"者", on:"シャ", kun:"もの", es:"persona (agente)", palabras:[
    { w:"記者", yomi:"きしゃ", es:"reportero" },
    { w:"読者", yomi:"どくしゃ", es:"lector" },
    { w:"消費者", yomi:"しょうひしゃ", es:"consumidor" },
    { w:"当事者", yomi:"とうじしゃ", es:"parte interesada" },
  ]},
  { kanji:"新", on:"シン", kun:"あたら(しい)", es:"nuevo", palabras:[
    { w:"新聞", yomi:"しんぶん", es:"periódico" },
    { w:"新型", yomi:"しんがた", es:"nuevo modelo" },
    { w:"刷新", yomi:"さっしん", es:"renovación" },
    { w:"更新", yomi:"こうしん", es:"actualización" },
  ]},
  { kanji:"聞", on:"ブン/モン", kun:"き(く)", es:"oír/noticia", palabras:[
    { w:"新聞", yomi:"しんぶん", es:"periódico" },
    { w:"聞取", yomi:"ききとり", es:"comprensión auditiva" },
    { w:"世聞", yomi:"せぶん", es:"rumores (arcaico)" },
    { w:"聞者", yomi:"ぶんしゃ", es:"oyente (raro)" },
  ]},
  { kanji:"政", on:"セイ", kun:"まつりごと", es:"política", palabras:[
    { w:"政府", yomi:"せいふ", es:"gobierno" },
    { w:"政策", yomi:"せいさく", es:"política/medida" },
    { w:"行政", yomi:"ぎょうせい", es:"administración" },
    { w:"政党", yomi:"せいとう", es:"partido político" },
  ]},
  { kanji:"経", on:"ケイ", kun:"へ(る)", es:"economía/pasar", palabras:[
    { w:"経済", yomi:"けいざい", es:"economía" },
    { w:"経験", yomi:"けいけん", es:"experiencia" },
    { w:"経由", yomi:"けいゆ", es:"vía/por" },
    { w:"経営", yomi:"けいえい", es:"gestión" },
  ]},
  { kanji:"増", on:"ゾウ", kun:"ふ(える)", es:"aumentar", palabras:[
    { w:"増加", yomi:"ぞうか", es:"aumento" },
    { w:"増便", yomi:"ぞうびん", es:"más servicios" },
    { w:"増税", yomi:"ぞうぜい", es:"alza de impuestos" },
    { w:"増産", yomi:"ぞうさん", es:"más producción" },
  ]},
  { kanji:"減", on:"ゲン", kun:"へ(る)", es:"disminuir", palabras:[
    { w:"減少", yomi:"げんしょう", es:"disminución" },
    { w:"削減", yomi:"さくげん", es:"reducción" },
    { w:"減税", yomi:"げんぜい", es:"baja de impuestos" },
    { w:"減速", yomi:"げんそく", es:"desaceleración" },
  ]},
  { kanji:"発", on:"ハツ", es:"emitir/salir", palabras:[
    { w:"発表", yomi:"はっぴょう", es:"anuncio" },
    { w:"発生", yomi:"はっせい", es:"ocurrencia" },
    { w:"発見", yomi:"はっけん", es:"descubrimiento" },
    { w:"出発", yomi:"しゅっぱつ", es:"salida" },
  ]},
  { kanji:"表", on:"ヒョウ", kun:"あらわ(す)", es:"tabla/expresar", palabras:[
    { w:"代表", yomi:"だいひょう", es:"representante" },
    { w:"発表", yomi:"はっぴょう", es:"anuncio" },
    { w:"表題", yomi:"ひょうだい", es:"título" },
    { w:"表示", yomi:"ひょうじ", es:"indicación" },
  ]},
  { kanji:"台", on:"ダイ/タイ", es:"plataforma/contador", palabras:[
    { w:"台風", yomi:"たいふう", es:"tifón" },
    { w:"一台", yomi:"いちだい", es:"una unidad (máquina)" },
    { w:"台地", yomi:"だいち", es:"meseta" },
    { w:"台本", yomi:"だいほん", es:"guion" },
  ]},
  { kanji:"風", on:"フウ/フ", kun:"かぜ", es:"viento/estilo", palabras:[
    { w:"台風", yomi:"たいふう", es:"tifón" },
    { w:"和風", yomi:"わふう", es:"estilo japonés" },
    { w:"風速", yomi:"ふうそく", es:"velocidad del viento" },
    { w:"風景", yomi:"ふうけい", es:"paisaje" },
  ]},
  { kanji:"被", on:"ヒ", kun:"こうむ(る)", es:"sufrir/recibir", palabras:[
    { w:"被害", yomi:"ひがい", es:"daños" },
    { w:"被災", yomi:"ひさい", es:"afectado por desastre" },
    { w:"被告", yomi:"ひこく", es:"acusado" },
    { w:"被写体", yomi:"ひしゃたい", es:"sujeto (foto)" },
  ]},
  { kanji:"害", on:"ガイ", es:"daño/perjuicio", palabras:[
    { w:"被害", yomi:"ひがい", es:"daños" },
    { w:"害虫", yomi:"がいちゅう", es:"plaga" },
    { w:"公害", yomi:"こうがい", es:"contaminación" },
    { w:"危害", yomi:"きがい", es:"daño físico" },
  ]},
  { kanji:"緊", on:"キン", es:"tenso/urgente", palabras:[
    { w:"緊急", yomi:"きんきゅう", es:"emergencia" },
    { w:"緊張", yomi:"きんちょう", es:"tensión" },
    { w:"緊迫", yomi:"きんぱく", es:"apremiante" },
    { w:"緊密", yomi:"きんみつ", es:"estrecho (relación)" },
  ]},
  { kanji:"急", on:"キュウ", kun:"いそ(ぐ)", es:"urgente/rápido", palabras:[
    { w:"至急", yomi:"しきゅう", es:"con urgencia" },
    { w:"急行", yomi:"きゅうこう", es:"tren expreso" },
    { w:"急増", yomi:"きゅうぞう", es:"aumento súbito" },
    { w:"急用", yomi:"きゅうよう", es:"asunto urgente" },
  ]},
  { kanji:"予", on:"ヨ", es:"previo/anticipar", palabras:[
    { w:"予報", yomi:"よほう", es:"pronóstico" },
    { w:"予定", yomi:"よてい", es:"plan/programa" },
    { w:"予防", yomi:"よぼう", es:"prevención" },
    { w:"予算", yomi:"よさん", es:"presupuesto" },
  ]},
];

/* ============================ Pantalla ============================ */
export default function N2_B4_U1() {
  const [progress, setProgress] = useState(0);
  const mark = () => setProgress((p) => Math.min(1, p + 0.2));

  return (
    <UnitTemplate
      hero={require("../../../assets/images/n2/covers/b4_u1.webp")}
      accent={accent}
      breadcrumb="B4 · U1"
      title="NHKやさしいニュース — Titulares reales"
      subtitle="Lee titulares auténticos al estilo NHK Easy, escucha su audio y compara con la traducción."
      ctas={[
        { label: "Consejo de lectura", onPress: () => speakES("Primero escucha el titular en japonés, identifica palabras clave, y después revela la traducción.") },
        { label: "Marcar avance", onPress: mark },
      ]}
      progress={progress}
      onContinue={mark}
      continueLabel="Siguiente"
    >
      {/* Guía */}
      <View style={[styles.cardInfo, { borderColor: accent }]}>
        <Text style={styles.h2}>Cómo trabajar los titulares</Text>
        <Text style={styles.p}>
          1) Presiona <Text style={styles.kbd}>JP</Text> para escuchar el titular en japonés.{"\n"}
          2) Identifica palabras ancla (名詞＋動詞).{"\n"}
          3) Revela la traducción y confirma hipótesis.{"\n"}
          4) Repite en voz alta (shadowing) y vuelve a escuchar.
        </Text>
      </View>

      {/* Tarjetas de titulares */}
      {HEADLINES.map((h, i) => (
        <HeadlineCard key={i} h={h} />
      ))}

      {/* Kanji Pro */}
      <View style={styles.cardInfo}>
        <Text style={styles.h2}>Kanji Pro — Noticias (20 kanji clave)</Text>
        <Text style={styles.p}>Tarjetas con lectura y vocabulario. Toca el altavoz para escuchar cada palabra.</Text>
        <View style={styles.kanjiGrid}>
          {KANJI.map((k, idx)=>(
            <View key={idx} style={styles.kanjiCard}>
              <View style={styles.kanjiHeader}>
                <Text style={styles.kanjiChar}>{k.kanji}</Text>
                <View style={{flex:1}}>
                  {!!k.on && <Text style={styles.kanjiMeta}>オン: {k.on}</Text>}
                  {!!k.kun && <Text style={styles.kanjiMeta}>くん: {k.kun}</Text>}
                  <Text style={styles.kanjiMean}>{k.es}</Text>
                </View>
              </View>
              <View style={styles.divider}/>
              {k.palabras.map((v,i)=>(
                <View key={i} style={styles.vocabRow}>
                  <View style={{flex:1}}>
                    <Text style={styles.vocabJP}>{v.w}</Text>
                    <Text style={styles.vocabYomi}>{v.yomi}</Text>
                    <Text style={styles.vocabES}>{v.es}</Text>
                  </View>
                  <Pressable onPress={()=>speakJP(v.w)} style={styles.iconBtn}>
                    <MCI name="volume-high" size={18} color="#fff"/>
                  </Pressable>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </UnitTemplate>
  );
}

/* ============================ Estilos ============================ */
const R = 14;
const styles = StyleSheet.create({
  cardInfo: {
    backgroundColor: BG,
    borderRadius: R,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  h2: { color: "#fff", fontWeight: "900", fontSize: 16, marginBottom: 6 },
  p: { color: "rgba(255,255,255,0.9)", lineHeight: 20 },

  card: {
    backgroundColor: BG,
    borderRadius: R,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  headJP: {
    color: "#fff", // Kanji/JP en blanco
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  yomi: { color: "#D1D5DB", fontSize: 14, marginBottom: 8 },
  es: { color: "#93C5FD", fontSize: 15, marginBottom: 10 },

  row: { flexDirection: "row", gap: 8 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  btnPrimary: { backgroundColor: "rgba(168,85,247,0.95)" }, // accent
  btnGhost: { backgroundColor: "rgba(255,255,255,0.14)" },
  btnAlt: { backgroundColor: "#C084FC" },
  btnText: { color: "#fff", fontWeight: "700", letterSpacing: 0.3 },

  kbd: {
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    color: "#fff",
    fontWeight: "800",
  },

  // Kanji cards
  kanjiGrid:{ flexDirection:"row", flexWrap:"wrap", gap:12, marginTop:8 },
  kanjiCard:{ width:CARD_W, backgroundColor:"#0F1423", borderRadius:16, borderWidth:1, borderColor:"rgba(255,255,255,0.08)", padding:12 },
  kanjiHeader:{ flexDirection:"row", alignItems:"center", gap:10 },
  kanjiChar:{ color:"#fff", fontSize:28, fontWeight:"900", width:38, textAlign:"center" },
  kanjiMeta:{ color:"#9CA3AF", fontSize:12 },
  kanjiMean:{ color:"#93C5FD", fontSize:13, fontWeight:"800" },
  divider:{ height:1, backgroundColor:"rgba(255,255,255,0.08)", marginVertical:8 },
  vocabRow:{ flexDirection:"row", alignItems:"center", gap:8, marginBottom:8 },
  vocabJP:{ color:"#fff", fontSize:15, fontWeight:"800" },
  vocabYomi:{ color:"#D1D5DB", fontSize:12 },
  vocabES:{ color:"#93C5FD", fontSize:13 },
  iconBtn:{ backgroundColor:"rgba(255,255,255,0.12)", borderRadius:999, padding:8 },
});

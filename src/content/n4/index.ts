// src/content/n4/index.ts
import type { ThemeContent } from "./types";
export type { KanjiItem, ThemeContent } from "./types";

import { TEMA_01 } from "./01";
import TEMA_2 from "./02";
import TEMA_3 from "./03";
import TEMA_4 from "./04";
import TEMA_5 from "./05";
import TEMA_6 from "./06";
import TEMA_7 from "./07";
// Agrega junto a los demás temas
import TEMA_8 from "./08";
import TEMA_9 from "./09";
import TEMA_10 from "./10";
import TEMA_11 from "./11";





/** Fallback seguro para evitar `undefined` en la UI */
export const DEFAULT_THEME: ThemeContent = {
  objetivos: ["Añade objetivos específicos para este tema."],
  vocabClase: [],
  oraciones6: [],
  gramatica: { titulo: "Gramática", puntos: [] },
  dialogos: [],
  quizLines: [],
  kanji10: [],
};

/** Mapa de temas por id (1, 2, 3, 4, 5, …) */
const TOPICS: Record<number, ThemeContent> = {
  1: TEMA_01,
  2: TEMA_2,
  3: TEMA_3,
  4: TEMA_4,
  5: TEMA_5,
   6: TEMA_6, 
    7: TEMA_7,
    8: TEMA_8,
    9: TEMA_9, 
    10: TEMA_10,
     11: TEMA_11,
};

/** Helper que NUNCA devuelve undefined */
export function getThemeContent(id: number | string): ThemeContent {
  const num = typeof id === "string" ? parseInt(id as string, 10) : id ?? 0;
  const safe = Number.isFinite(num) ? (num as number) : 0;
  return TOPICS[safe] ?? DEFAULT_THEME;
}

/* =======================
   KanjiVG images (temas 1–5)
   Nota: los nombres .webp deben coincidir con assets/kanjivg/n4
======================= */

/* — Tema 1 — */
import img4e8b from "../../../assets/kanjivg/n4/4e8b_web.webp"; // 事
import img4ed5 from "../../../assets/kanjivg/n4/4ed5_web.webp"; // 仕
import img524d from "../../../assets/kanjivg/n4/524d_web.webp"; // 前
import img540d from "../../../assets/kanjivg/n4/540d_web.webp"; // 名
import img54e1 from "../../../assets/kanjivg/n4/54e1_web.webp"; // 員
import img56fd from "../../../assets/kanjivg/n4/56fd_web.webp"; // 国
import img5b66 from "../../../assets/kanjivg/n4/5b66_web.webp"; // 学
import img751f from "../../../assets/kanjivg/n4/751f_web.webp"; // 生
import img793e from "../../../assets/kanjivg/n4/793e_web.webp"; // 社
import img79c1 from "../../../assets/kanjivg/n4/79c1_web.webp"; // 私

/* — Tema 2 — */
import img4ed8 from "../../../assets/kanjivg/n4/4ed8_web.webp"; // 付
import img5ba4 from "../../../assets/kanjivg/n4/5ba4_web.webp"; // 室
import img5bb6 from "../../../assets/kanjivg/n4/5bb6_web.webp"; // 家
import img6238 from "../../../assets/kanjivg/n4/6238_web.webp"; // 戸
import img660e from "../../../assets/kanjivg/n4/660e_web.webp"; // 明
import img6d88 from "../../../assets/kanjivg/n4/6d88_web.webp"; // 消
import img7a93 from "../../../assets/kanjivg/n4/7a93_web.webp"; // 窓
import img9589 from "../../../assets/kanjivg/n4/9589_web.webp"; // 閉
import img958b from "../../../assets/kanjivg/n4/958b_web.webp"; // 開
import img96fb from "../../../assets/kanjivg/n4/96fb_web.webp"; // 電

/* — Tema 3 (🍱 restaurante) — */
import img5e97 from "../../../assets/kanjivg/n4/5e97_web.webp"; // 店
import img725b from "../../../assets/kanjivg/n4/725b_web.webp"; // 牛
import img7c73 from "../../../assets/kanjivg/n4/7c73_web.webp"; // 米
import img8089 from "../../../assets/kanjivg/n4/8089_web.webp"; // 肉
import img8336 from "../../../assets/kanjivg/n4/8336_web.webp"; // 茶
import img83dc from "../../../assets/kanjivg/n4/83dc_web.webp"; // 菜
import img91ce from "../../../assets/kanjivg/n4/91ce_web.webp"; // 野
import img98df from "../../../assets/kanjivg/n4/98df_web.webp"; // 食
import img98f2 from "../../../assets/kanjivg/n4/98f2_web.webp"; // 飲
import img9b5a from "../../../assets/kanjivg/n4/9b5a_web.webp"; // 魚

/* — Tema 4 (🏪 tiendas) — */
import img5024 from "../../../assets/kanjivg/n4/5024_web.webp"; // 値
import img58f2 from "../../../assets/kanjivg/n4/58f2_web.webp"; // 売
import img5b89 from "../../../assets/kanjivg/n4/5b89_web.webp"; // 安
import img670d from "../../../assets/kanjivg/n4/670d_web.webp"; // 服
import img7740 from "../../../assets/kanjivg/n4/7740_web.webp"; // 着
import img8272 from "../../../assets/kanjivg/n4/8272_web.webp"; // 色
import img8a66 from "../../../assets/kanjivg/n4/8a66_web.webp"; // 試
import img8cb7 from "../../../assets/kanjivg/n4/8cb7_web.webp"; // 買
import img9774 from "../../../assets/kanjivg/n4/9774_web.webp"; // 靴
import img9ad8 from "../../../assets/kanjivg/n4/9ad8_web.webp"; // 高

/* — Tema 5 (🚉 transporte y viajes) — */
import img99c5 from "../../../assets/kanjivg/n4/99c5_web.webp"; // 駅
// (電 ya importado: img96fb)
import img4e57 from "../../../assets/kanjivg/n4/4e57_web.webp"; // 乗
import img5148 from "../../../assets/kanjivg/n4/5148_web.webp"; // 先
import img5206 from "../../../assets/kanjivg/n4/5206_web.webp"; // 分
import img6642 from "../../../assets/kanjivg/n4/6642_web.webp"; // 時
import img7dda from "../../../assets/kanjivg/n4/7dda_web.webp"; // 線
import img884c from "../../../assets/kanjivg/n4/884c_web.webp"; // 行
import img8eca from "../../../assets/kanjivg/n4/8eca_web.webp"; // 車
import img964d from "../../../assets/kanjivg/n4/964d_web.webp"; // 降

import img4f53 from "../../../assets/kanjivg/n4/4f53_web.webp"; // 体
import img5bbf from "../../../assets/kanjivg/n4/5bbf_web.webp"; // 宿
import img6559 from "../../../assets/kanjivg/n4/6559_web.webp"; // 教
import img6570 from "../../../assets/kanjivg/n4/6570_web.webp"; // 数
import img6587 from "../../../assets/kanjivg/n4/6587_web.webp"; // 文
import img6821 from "../../../assets/kanjivg/n4/6821_web.webp"; // 校
import img697d from "../../../assets/kanjivg/n4/697d_web.webp"; // 楽
import img79d1 from "../../../assets/kanjivg/n4/79d1_web.webp"; // 科
import img97f3 from "../../../assets/kanjivg/n4/97f3_web.webp"; // 音
import img984c from "../../../assets/kanjivg/n4/984c_web.webp"; // 題

// Tema 7 (🏥 hospital)
import img533b from "../../../assets/kanjivg/n4/533b_web.webp"; // 医
import img5fc3 from "../../../assets/kanjivg/n4/5fc3_web.webp"; // 心
import img75c5 from "../../../assets/kanjivg/n4/75c5_web.webp"; // 病
import img75db from "../../../assets/kanjivg/n4/75db_web.webp"; // 痛
import img76ee from "../../../assets/kanjivg/n4/76ee_web.webp"; // 目
import img8005 from "../../../assets/kanjivg/n4/8005_web.webp"; // 者
import img8033 from "../../../assets/kanjivg/n4/8033_web.webp"; // 耳
import img85ac from "../../../assets/kanjivg/n4/85ac_web.webp"; // 薬
import img9662 from "../../../assets/kanjivg/n4/9662_web.webp"; // 院
// Tema 7 (🏥 hospital)
import img53e3 from "../../../assets/kanjivg/n4/53e3_web.webp"; // 口

// Tema 8 (📅 Planes y citas)
import img4e88 from "../../../assets/kanjivg/n4/4e88_web.webp"; // 予
import img4f1a from "../../../assets/kanjivg/n4/4f1a_web.webp"; // 会
import img5b9a from "../../../assets/kanjivg/n4/5b9a_web.webp"; // 定
import img5e74 from "../../../assets/kanjivg/n4/5e74_web.webp"; // 年
import img65e5 from "../../../assets/kanjivg/n4/65e5_web.webp"; // 日
import img65e9 from "../../../assets/kanjivg/n4/65e9_web.webp"; // 早
import img66dc from "../../../assets/kanjivg/n4/66dc_web.webp"; // 曜
import img6708 from "../../../assets/kanjivg/n4/6708_web.webp"; // 月
import img7d04 from "../../../assets/kanjivg/n4/7d04_web.webp"; // 約
import img9031 from "../../../assets/kanjivg/n4/9031_web.webp"; // 週

// Tema 9 (💻 oficina)
import img4f11 from "../../../assets/kanjivg/n4/4f11_web.webp"; // 休
import img4fc2 from "../../../assets/kanjivg/n4/4fc2_web.webp"; // 係
import img50cd from "../../../assets/kanjivg/n4/50cd_web.webp"; // 働
import img66f8 from "../../../assets/kanjivg/n4/66f8_web.webp"; // 書
import img6848 from "../../../assets/kanjivg/n4/6848_web.webp"; // 案
import img7528 from "../../../assets/kanjivg/n4/7528_web.webp"; // 用
import img8a31 from "../../../assets/kanjivg/n4/8a31_web.webp"; // 許
import img8ab2 from "../../../assets/kanjivg/n4/8ab2_web.webp"; // 課
import img90e8 from "../../../assets/kanjivg/n4/90e8_web.webp"; // 部
import img9577 from "../../../assets/kanjivg/n4/9577_web.webp"; // 長

import img5909 from "../../../assets/kanjivg/n4/5909_web.webp"; // 変
import img59cb from "../../../assets/kanjivg/n4/59cb_web.webp"; // 始
import img6c7a from "../../../assets/kanjivg/n4/6c7a_web.webp"; // 決
import img753b from "../../../assets/kanjivg/n4/753b_web.webp"; // 画
import img767a from "../../../assets/kanjivg/n4/767a_web.webp"; // 発
import img7d42 from "../../../assets/kanjivg/n4/7d42_web.webp"; // 終
import img8868 from "../../../assets/kanjivg/n4/8868_web.webp"; // 表
import img8a08 from "../../../assets/kanjivg/n4/8a08_web.webp"; // 計
import img8a18 from "../../../assets/kanjivg/n4/8a18_web.webp"; // 記
import img96c6 from "../../../assets/kanjivg/n4/96c6_web.webp"; // 集

import img5185 from "../../../assets/kanjivg/n4/5185_web.webp"; // 内
import img53d7 from "../../../assets/kanjivg/n4/53d7_web.webp"; // 受
import img5408 from "../../../assets/kanjivg/n4/5408_web.webp"; // 合
import img554f from "../../../assets/kanjivg/n4/554f_web.webp"; // 問
import img5ba2 from "../../../assets/kanjivg/n4/5ba2_web.webp"; // 客
import img8fd4 from "../../../assets/kanjivg/n4/8fd4_web.webp"; // 返
import img9023 from "../../../assets/kanjivg/n4/9023_web.webp"; // 連
import img9858 from "../../../assets/kanjivg/n4/9858_web.webp"; // 願







export const IMG_BY_KANJI: Record<string, any> = {
  /* — Tema 1 — */
  "私": img79c1,
  "名": img540d,
  "前": img524d,
  "国": img56fd,
  "学": img5b66,
  "生": img751f,
  "社": img793e,
  "員": img54e1,
  "仕": img4ed5,
  "事": img4e8b,

  /* — Tema 2 — */
  "家": img5bb6,
  "室": img5ba4,
  "窓": img7a93,
  "戸": img6238,
  "開": img958b,
  "閉": img9589,
  "電": img96fb,
  "明": img660e,
  "付": img4ed8,
  "消": img6d88,

  /* — Tema 3 (🍱 restaurante) — */
  "食": img98df,
  "飲": img98f2,
  "米": img7c73,
  "肉": img8089,
  "魚": img9b5a,
  "野": img91ce,
  "菜": img83dc,
  "茶": img8336,
  "牛": img725b,
  "店": img5e97,

  /* — Tema 4 (🏪 tiendas) — */
  "買": img8cb7,
  "売": img58f2,
  "値": img5024,
  "安": img5b89,
  "高": img9ad8,
  "色": img8272,
  "服": img670d,
  "靴": img9774,
  "試": img8a66,
  "着": img7740,

  /* — Tema 5 (🚉 transporte y viajes) — */
  "駅": img99c5,
  // "電": img96fb, // (ya mapeado arriba)
  "車": img8eca,
  "行": img884c,
  "乗": img4e57,
  "降": img964d,
  "時": img6642,
  "分": img5206,
  "先": img5148,
  "線": img7dda,

  "校": img6821,
  "教": img6559,
  "宿": img5bbf,
  "題": img984c,
  "科": img79d1,
  "数": img6570,
  "音": img97f3,
  "楽": img697d,
  "体": img4f53,
  "文": img6587,

    // Tema 7 (🏥 hospital)
   "病": img75c5,
  "院": img9662,
  "医": img533b,
  "者": img8005,
  "薬": img85ac,
  "痛": img75db,
  "目": img76ee,
  "耳": img8033,
  "心": img5fc3,
   "口": img53e3,

     "会": img4f1a,
  "予": img4e88,
  "約": img7d04,
  "定": img5b9a,
  "週": img9031,
  "月": img6708,
  "日": img65e5,
  "年": img5e74,
  "曜": img66dc,
  "早": img65e9,

    "働": img50cd,
  "係": img4fc2,
  "部": img90e8,
  "課": img8ab2,
  "長": img9577,
  "許": img8a31,
  "案": img6848,
  "書": img66f8,
  "用": img7528,
  "休": img4f11,

    "計": img8a08,
  "画": img753b,
  "決": img6c7a,
  "変": img5909,
  "始": img59cb,
  "終": img7d42,
  "表": img8868,
  "記": img8a18,
  "発": img767a,
  "集": img96c6,

  "願": img9858,
  "受": img53d7,
  "客": img5ba2,
  "問": img554f,
  "合": img5408,
  "連": img9023,
  "返": img8fd4,
  "内": img5185,

  
};

// (Opcional) lista si alimentas menús en UI
export const N4_THEMES = [TEMA_01, TEMA_2, TEMA_3, TEMA_4, TEMA_5];
 
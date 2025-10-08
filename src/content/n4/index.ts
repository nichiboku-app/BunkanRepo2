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
import TEMA_8 from "./08";
import TEMA_9 from "./09";
import TEMA_10 from "./10";
import TEMA_11 from "./11";
import TEMA_12 from "./12";
import TEMA_13 from "./13";
import TEMA_14 from "./14";
import TEMA_15 from "./15";
import TEMA_16 from "./16";
import TEMA_17 from "./17";
import TEMA_18 from "./18";
import TEMA_19 from "./19";
import TEMA_20 from "./20";
import TEMA_21 from "./21";
import TEMA_22 from "./22";
import TEMA_23 from "./23";
import TEMA_24 from "./24";
import TEMA_25 from "./25";
import TEMA_26 from "./26";
import TEMA_27 from "./27";
import TEMA_28 from "./28";
import TEMA_29 from "./29";
import TEMA_30 from "./30";

/** Fallback seguro para evitar `undefined` en la UI */
export const DEFAULT_THEME: ThemeContent = {
  objetivos: ["Añade objetivos específicos para este tema."],
  vocabClase: [],
  oraciones6: [],
  gramatica: { titulo: "Gramática", puntos: [] },
  dialogos: [],
  quizSets: [], // ✅ usar quizSets (no quizLines)
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
  12: TEMA_12,
  13: TEMA_13,
  14: TEMA_14,
  15: TEMA_15,
  16: TEMA_16,
  17: TEMA_17,
  18: TEMA_18,
  19: TEMA_19,
  20: TEMA_20,
  21: TEMA_21,
  22: TEMA_22,
  23: TEMA_23,
  24: TEMA_24,
  25: TEMA_25,
  26: TEMA_26,
  27: TEMA_27,
  28: TEMA_28,
  29: TEMA_29,
  30: TEMA_30
};

/** Helper que NUNCA devuelve undefined */
export function getThemeContent(id: number | string): ThemeContent {
  const num = typeof id === "string" ? parseInt(id as string, 10) : id ?? 0;
  const safe = Number.isFinite(num) ? (num as number) : 0;
  return TOPICS[safe] ?? DEFAULT_THEME;
}

/* =======================
   KanjiVG images
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
// (電 ya importado)
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

/* — Tema 7 (🏥 hospital) — */
import img533b from "../../../assets/kanjivg/n4/533b_web.webp"; // 医
import img53e3 from "../../../assets/kanjivg/n4/53e3_web.webp"; // 口
import img5fc3 from "../../../assets/kanjivg/n4/5fc3_web.webp"; // 心
import img75c5 from "../../../assets/kanjivg/n4/75c5_web.webp"; // 病
import img75db from "../../../assets/kanjivg/n4/75db_web.webp"; // 痛
import img76ee from "../../../assets/kanjivg/n4/76ee_web.webp"; // 目
import img8005 from "../../../assets/kanjivg/n4/8005_web.webp"; // 者
import img8033 from "../../../assets/kanjivg/n4/8033_web.webp"; // 耳
import img85ac from "../../../assets/kanjivg/n4/85ac_web.webp"; // 薬
import img9662 from "../../../assets/kanjivg/n4/9662_web.webp"; // 院

/* — Tema 8 (📅 Planes y citas) — */
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

/* — Tema 9 (💻 oficina) — */
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

/* — Tema 12 (🧭 Imperativo y causativa) — */
import img4f1d_web from "../../../assets/kanjivg/n4/4f1d_web.webp"; // 伝
import img4f7f_web from "../../../assets/kanjivg/n4/4f7f_web.webp"; // 使
import img5b88_web from "../../../assets/kanjivg/n4/5b88_web.webp"; // 守
import img6307_web from "../../../assets/kanjivg/n4/6307_web.webp"; // 指
import img6ce8_web from "../../../assets/kanjivg/n4/6ce8_web.webp"; // 注
import img6e96_web from "../../../assets/kanjivg/n4/6e96_web.webp"; // 準
import img793a_web from "../../../assets/kanjivg/n4/793a_web.webp"; // 示
import img7f6e_web from "../../../assets/kanjivg/n4/7f6e_web.webp"; // 置
import img9589_web from "../../../assets/kanjivg/n4/9589_web.webp"; // 閉
import img958b_web from "../../../assets/kanjivg/n4/958b_web.webp"; // 開

// NUEVOS imports N4-13 (kanjivg webp)
import img4e3b_web from "../../../assets/kanjivg/n4/4e3b_web.webp"; // 主
import img4ee5_web from "../../../assets/kanjivg/n4/4ee5_web.webp"; // 以
import img539f_web from "../../../assets/kanjivg/n4/539f_web.webp"; // 原
import img56e0_web from "../../../assets/kanjivg/n4/56e0_web.webp"; // 因
import img601d_web from "../../../assets/kanjivg/n4/601d_web.webp"; // 思
import img610f_web from "../../../assets/kanjivg/n4/610f_web.webp"; // 意
import img7406_web from "../../../assets/kanjivg/n4/7406_web.webp"; // 理
import img7531_web from "../../../assets/kanjivg/n4/7531_web.webp"; // 由
import img8003_web from "../../../assets/kanjivg/n4/8003_web.webp"; // 考
import img81ea_web from "../../../assets/kanjivg/n4/81ea_web.webp"; // 自

// KanjiVG webp — Tema 14
import img4fbf_web from "../../../assets/kanjivg/n4/4fbf_web.webp"; // 便
import img56f0_web from "../../../assets/kanjivg/n4/56f0_web.webp"; // 困
import img56f3_web from "../../../assets/kanjivg/n4/56f3_web.webp"; // 図
import img5f62_web from "../../../assets/kanjivg/n4/5f62_web.webp"; // 形
import img6025_web from "../../../assets/kanjivg/n4/6025_web.webp"; // 急
import img63a5_web from "../../../assets/kanjivg/n4/63a5_web.webp"; // 接
import img8981_web from "../../../assets/kanjivg/n4/8981_web.webp"; // 要
import img8aac_web from "../../../assets/kanjivg/n4/8aac_web.webp"; // 説
import img91cd_web from "../../../assets/kanjivg/n4/91cd_web.webp"; // 重

// KanjiVG webp — Tema 15
import img4f4e_web from "../../../assets/kanjivg/n4/4f4e_web.webp"; // 低
import img597d_web from "../../../assets/kanjivg/n4/597d_web.webp"; // 好
import img6bd4_web from "../../../assets/kanjivg/n4/6bd4_web.webp"; // 比
import img8fd1_web from "../../../assets/kanjivg/n4/8fd1_web.webp"; // 近
import img901f_web from "../../../assets/kanjivg/n4/901f_web.webp"; // 速
import img9045_web from "../../../assets/kanjivg/n4/9045_web.webp"; // 遅
import img9060_web from "../../../assets/kanjivg/n4/9060_web.webp"; // 遠
import img9078_web from "../../../assets/kanjivg/n4/9078_web.webp"; // 選
import img91cf_web from "../../../assets/kanjivg/n4/91cf_web.webp"; // 量

// KanjiVG webp — Tema 16
import img52c9_web from "../../../assets/kanjivg/n4/52c9_web.webp"; // 勉
import img5922_web from "../../../assets/kanjivg/n4/5922_web.webp"; // 夢
import img5e0c_web from "../../../assets/kanjivg/n4/5e0c_web.webp"; // 希
import img5f31_web from "../../../assets/kanjivg/n4/5f31_web.webp"; // 弱
import img5f37_web from "../../../assets/kanjivg/n4/5f37_web.webp"; // 強
import img6210_web from "../../../assets/kanjivg/n4/6210_web.webp"; // 成
import img671b_web from "../../../assets/kanjivg/n4/671b_web.webp"; // 望
import img7d9a_web from "../../../assets/kanjivg/n4/7d9a_web.webp"; // 続

// KanjiVG webp — Tema 17
import img521d_web from "../../../assets/kanjivg/n4/521d_web.webp"; // 初
import img53e4_web from "../../../assets/kanjivg/n4/53e4_web.webp"; // 古
import img56de_web from "../../../assets/kanjivg/n4/56de_web.webp"; // 回
import img5ea6_web from "../../../assets/kanjivg/n4/5ea6_web.webp"; // 度
import img65b0_web from "../../../assets/kanjivg/n4/65b0_web.webp"; // 新
import img65c5_web from "../../../assets/kanjivg/n4/65c5_web.webp"; // 旅
import img6614_web from "../../../assets/kanjivg/n4/6614_web.webp"; // 昔
import img7d4c_web from "../../../assets/kanjivg/n4/7d4c_web.webp"; // 経
import img9a13_web from "../../../assets/kanjivg/n4/9a13_web.webp"; // 験

// KanjiVG webp — Tema 18
import img5f8c_web from "../../../assets/kanjivg/n4/5f8c_web.webp"; // 後
import img6b21_web from "../../../assets/kanjivg/n4/6b21_web.webp"; // 次

import img5199_web from "../../../assets/kanjivg/n4/5199_web.webp"; // 写
import img590f_web from "../../../assets/kanjivg/n4/590f_web.webp"; // 夏
import img591c_web from "../../../assets/kanjivg/n4/591c_web.webp"; // 夜
import img6b4c_web from "../../../assets/kanjivg/n4/6b4c_web.webp"; // 歌
import img771f_web from "../../../assets/kanjivg/n4/771f_web.webp"; // 真
import img795d_web from "../../../assets/kanjivg/n4/795d_web.webp"; // 祝
import img796d_web from "../../../assets/kanjivg/n4/796d_web.webp"; // 祭
import img82b1_web from "../../../assets/kanjivg/n4/82b1_web.webp"; // 花

import img4e0d_web from "../../../assets/kanjivg/n4/4e0d_web.webp"; // 不
import img5229_web from "../../../assets/kanjivg/n4/5229_web.webp"; // 利
import img5fc5_web from "../../../assets/kanjivg/n4/5fc5_web.webp"; // 必
import img679c_web from "../../../assets/kanjivg/n4/679c_web.webp"; // 果
import img7d50_web from "../../../assets/kanjivg/n4/7d50_web.webp"; // 結

import img5915_web from "../../../assets/kanjivg/n4/5915_web.webp"; // 夕
import img671d_web from "../../../assets/kanjivg/n4/671d_web.webp"; // 朝
import img6b69_web from "../../../assets/kanjivg/n4/6b69_web.webp"; // 歩
import img6bce_web from "../../../assets/kanjivg/n4/6bce_web.webp"; // 毎
import img7fd2_web from "../../../assets/kanjivg/n4/7fd2_web.webp"; // 習
import img8d70_web from "../../../assets/kanjivg/n4/8d70_web.webp"; // 走

// KanjiVG webp — Tema 22
import img5316_web from "../../../assets/kanjivg/n4/5316_web.webp"; // 化
import img5897_web from "../../../assets/kanjivg/n4/5897_web.webp"; // 増
import img6e1b_web from "../../../assets/kanjivg/n4/6e1b_web.webp"; // 減

// === Ajustes por archivos generados SIN prefijo "img" ===
import img5065_web from "../../../assets/kanjivg/n4/5065_web.webp"; // 健
import img5eb7_web from "../../../assets/kanjivg/n4/5eb7_web.webp"; // 康
import img7df4_web from "../../../assets/kanjivg/n4/7df4_web.webp"; // 練
// ==============================

import img4eca_web from "../../../assets/kanjivg/n4/4eca_web.webp"; // 今
import img591a_web from "../../../assets/kanjivg/n4/591a_web.webp"; // 多
import img5929_web from "../../../assets/kanjivg/n4/5929_web.webp"; // 天
import img5c11_web from "../../../assets/kanjivg/n4/5c11_web.webp"; // 少
import img5f53_web from "../../../assets/kanjivg/n4/5f53_web.webp"; // 当
import img6674_web from "../../../assets/kanjivg/n4/6674_web.webp"; // 晴
import img6c17_web from "../../../assets/kanjivg/n4/6c17_web.webp"; // 気
import img7a7a_web from "../../../assets/kanjivg/n4/7a7a_web.webp"; // 空
import img96e8_web from "../../../assets/kanjivg/n4/96e8_web.webp"; // 雨
import img96ea_web from "../../../assets/kanjivg/n4/96ea_web.webp"; // 雪

import img5165_web from "../../../assets/kanjivg/n4/5165_web.webp"; // 入
import img516c_web from "../../../assets/kanjivg/n4/516c_web.webp"; // 公
import img51fa_web from "../../../assets/kanjivg/n4/51fa_web.webp"; // 出
import img53ef_web from "../../../assets/kanjivg/n4/53ef_web.webp"; // 可
import img5712_web from "../../../assets/kanjivg/n4/5712_web.webp"; // 園
import img5916_web from "../../../assets/kanjivg/n4/5916_web.webp"; // 外
import img6b62_web from "../../../assets/kanjivg/n4/6b62_web.webp"; // 止
import img7981_web from "../../../assets/kanjivg/n4/7981_web.webp"; // 禁
import img9759_web from "../../../assets/kanjivg/n4/9759_web.webp"; // 静
import img9928_web from "../../../assets/kanjivg/n4/9928_web.webp"; // 館

import img5411_web from "../../../assets/kanjivg/n4/5411_web.webp"; // 向
import img5834_web from "../../../assets/kanjivg/n4/5834_web.webp"; // 場
import img5e30_web from "../../../assets/kanjivg/n4/5e30_web.webp"; // 帰
import img5f85_web from "../../../assets/kanjivg/n4/5f85_web.webp"; // 待
import img5fd8_web from "../../../assets/kanjivg/n4/5fd8_web.webp"; // 忘
import img66f2_web from "../../../assets/kanjivg/n4/66f2_web.webp"; // 曲
import img89d2_web from "../../../assets/kanjivg/n4/89d2_web.webp"; // 角
import img9001_web from "../../../assets/kanjivg/n4/9001_web.webp"; // 送
import img9053_web from "../../../assets/kanjivg/n4/9053_web.webp"; // 道
import img9055_web from "../../../assets/kanjivg/n4/9055_web.webp"; // 違

import img4f5c_web from "../../../assets/kanjivg/n4/4f5c_web.webp"; // 作
import img52d5_web from "../../../assets/kanjivg/n4/52d5_web.webp"; // 動
import img672a_web from "../../../assets/kanjivg/n4/672a_web.webp"; // 未
import img672b_web from "../../../assets/kanjivg/n4/672b_web.webp"; // 末
import img7533_web from "../../../assets/kanjivg/n4/7533_web.webp"; // 申
import img77e5_web from "../../../assets/kanjivg/n4/77e5_web.webp"; // 知
import img7814_web from "../../../assets/kanjivg/n4/7814_web.webp"; // 研
import img7a76_web from "../../../assets/kanjivg/n4/7a76_web.webp"; // 究
import img8abf_web from "../../../assets/kanjivg/n4/8abf_web.webp"; // 調
import img904b_web from "../../../assets/kanjivg/n4/904b_web.webp"; // 運

import img4ee3_web from "../../../assets/kanjivg/n4/4ee3_web.webp"; // 代
import img501f_web from "../../../assets/kanjivg/n4/501f_web.webp"; // 借
import img5f79_web from "../../../assets/kanjivg/n4/5f79_web.webp"; // 役
import img6ce3_web from "../../../assets/kanjivg/n4/6ce3_web.webp"; // 泣
import img7b11_web from "../../../assets/kanjivg/n4/7b11_web.webp"; // 笑
import img805e_web from "../../../assets/kanjivg/n4/805e_web.webp"; // 聞
import img898b_web from "../../../assets/kanjivg/n4/898b_web.webp"; // 見
import img8aad_web from "../../../assets/kanjivg/n4/8aad_web.webp"; // 読
import img8cb8_web from "../../../assets/kanjivg/n4/8cb8_web.webp"; // 貸
import img8d77_web from "../../../assets/kanjivg/n4/8d77_web.webp"; // 起

import img4ed6_web from "../../../assets/kanjivg/n4/4ed6_web.webp"; // 他
import img4f8b_web from "../../../assets/kanjivg/n4/4f8b_web.webp"; // 例
import img5168_web from "../../../assets/kanjivg/n4/5168_web.webp"; // 全
import img5225_web from "../../../assets/kanjivg/n4/5225_web.webp"; // 別
import img540c_web from "../../../assets/kanjivg/n4/540c_web.webp"; // 同
import img54c1_web from "../../../assets/kanjivg/n4/54c1_web.webp"; // 品
import img6599_web from "../../../assets/kanjivg/n4/6599_web.webp"; // 料
import img65b9_web from "../../../assets/kanjivg/n4/65b9_web.webp"; // 方
import img70b9_web from "../../../assets/kanjivg/n4/70b9_web.webp"; // 点
import img9054_web from "../../../assets/kanjivg/n4/9054_web.webp"; // 達


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

  /* — Tema 7 (🏥 hospital) — */
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

  /* — Tema 8 — */
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

  /* — Tema 9 — */
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

  /* — Tema 12 (claves por strokeCode HEX4 minúscula) — */
  "4f1d": img4f1d_web, // 伝
  "4f7f": img4f7f_web, // 使
  "5b88": img5b88_web, // 守
  "6307": img6307_web, // 指
  "793a": img793a_web, // 示
  "7f6e": img7f6e_web, // 置
  "6ce8": img6ce8_web, // 注
  "6e96": img6e96_web, // 準
  "958b": img958b_web, // 開
  "9589": img9589_web, // 閉

  // — Tema 13+ (kanji por carácter) —
  "主": img4e3b_web,
  "以": img4ee5_web,
  "原": img539f_web,
  "因": img56e0_web,
  "思": img601d_web,
  "意": img610f_web,
  "理": img7406_web,
  "由": img7531_web,
  "考": img8003_web,
  "自": img81ea_web,

  "困": img56f0_web,
  "急": img6025_web,
  "接": img63a5_web,
  "説": img8aac_web,
  "要": img8981_web,
  "図": img56f3_web,
  "形": img5f62_web,
  "重": img91cd_web,
  "便": img4fbf_web,

  "比": img6bd4_web,
  "選": img9078_web,
  "低": img4f4e_web,
  "近": img8fd1_web,
  "遠": img9060_web,
  "速": img901f_web,
  "遅": img9045_web,
  "量": img91cf_web,
  "好": img597d_web,

  "希": img5e0c_web,
  "望": img671b_web,
  "夢": img5922_web,
  "勉": img52c9_web,
  "強": img5f37_web,
  "弱": img5f31_web,
  "続": img7d9a_web,
  "成": img6210_web,

  "経": img7d4c_web,
  "験": img9a13_web,
  "昔": img6614_web,
  "旅": img65c5_web,
  "初": img521d_web,
  "回": img56de_web,
  "度": img5ea6_web,
  "新": img65b0_web,
  "古": img53e4_web,

  "後": img5f8c_web,
  "次": img6b21_web,

  "祭": img796d_web,
  "祝": img795d_web,

  "夏": img590f_web,
  "花": img82b1_web,
  "夜": img591c_web,
  "歌": img6b4c_web,
  "写": img5199_web,
  "真": img771f_web,

  "必": img5fc5_web,
  "利": img5229_web,
  "不": img4e0d_web,
  "注": img6ce8_web,

  "結": img7d50_web,
  "果": img679c_web,

  "朝": img671d_web,
  "夕": img5915_web,
  "毎": img6bce_web,

  "習": img7fd2_web,
  "走": img8d70_web,
  "歩": img6b69_web,

  "化": img5316_web,
  "増": img5897_web,
  "減": img6e1b_web,

  // — Tema 23 (consejos, salud, estudio) —
  "健": img5065_web,
  "康": img5eb7_web,
  "練": img7df4_web,

"今" : img4eca_web,
"天" : img5929_web,
"気" : img6c17_web,
"雨" : img96e8_web,
"雪" : img96ea_web,
"晴" : img6674_web,
"多" : img591a_web,
"少" : img5c11_web,
"当" : img5f53_web,
"空" : img7a7a_web,

"入": img5165_web,
"出": img51fa_web,
"外": img5916_web,
"公": img516c_web,
"園": img5712_web,
"止": img6b62_web,
"可": img53ef_web,
"禁": img7981_web,
"静": img9759_web,
"館": img9928_web,

"待": img5f85_web,
"忘": img5fd8_web,
"場": img5834_web,
"道": img9053_web,
"帰": img5e30_web,
"曲": img66f2_web,
"向": img5411_web,
"違": img9055_web,
"送": img9001_web,
"角": img89d2_web,

"調": img8abf_web,
"研": img7814_web,
"究": img7a76_web,
"作": img4f5c_web,
"知": img77e5_web,
"未": img672a_web,
"末": img672b_web,
"運": img904b_web,
"動": img52d5_web,
"申": img7533_web,
"見": img898b_web,
"聞": img805e_web,
"読": img8aad_web,
"起": img8d77_web,
"役": img5f79_web,
"代": img4ee3_web,
"泣": img6ce3_web,
"笑": img7b11_web,
"借": img501f_web,
"貸": img8cb8_web,

"例": img4f8b_web,
"別": img5225_web,
"同": img540c_web,
"他": img4ed6_web,
"全": img5168_web,
"点": img70b9_web,
"料": img6599_web,
"品": img54c1_web,
"方": img65b9_web,
"達": img9054_web,


};

/**
 * Helper KanjiVG:
 * - Intenta imagen por strokeCode (hex4) — recomendado para N4 nuevos.
 * - Si no hay, cae a la clave por carácter (para kanji ya mapeados como “開”, “閉”, etc.).
 */
export function getKanjiImg(item: { ch?: string; strokeCode?: string }) {
  if (item?.strokeCode && IMG_BY_KANJI[item.strokeCode]) return IMG_BY_KANJI[item.strokeCode];
  if (item?.ch && IMG_BY_KANJI[item.ch]) return IMG_BY_KANJI[item.ch];
  return undefined;
}

// (Lista para menús/UI)
export const N4_THEMES = [
  TEMA_01,
  TEMA_2,
  TEMA_3,
  TEMA_4,
  TEMA_5,
  TEMA_6,
  TEMA_7,
  TEMA_8,
  TEMA_9,
  TEMA_10,
  TEMA_11,
  TEMA_12,
  TEMA_13,
  TEMA_14,
  TEMA_15,
  TEMA_16,
  TEMA_17,
  TEMA_18,
  TEMA_19,
  TEMA_20,
  TEMA_21,
  TEMA_22,
  TEMA_23,
  TEMA_24,
  TEMA_25
];

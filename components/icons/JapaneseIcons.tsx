// src/components/icons/JapaneseIcons.tsx
import React from "react";
import Svg, { Circle, Line, Path, Polygon, Rect } from "react-native-svg";

export type IconProps = {
  size?: number;
  color?: string;       // se usará para stroke y rellenos oscuros
  strokeWidth?: number;
  fill?: string;        // relleno claro opcional
  style?: any;
};

const S = 24;
const C = "#5C0A14";

export const Sakura = ({ size = S, color = C, strokeWidth = 2, fill = "none", style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    {/* pétalos (círculos) */}
    <Circle cx="12" cy="6.2" r="3.2" stroke={color} strokeWidth={strokeWidth} fill={fill} />
    <Circle cx="6.7" cy="9.5" r="3.2" stroke={color} strokeWidth={strokeWidth} fill={fill} />
    <Circle cx="17.3" cy="9.5" r="3.2" stroke={color} strokeWidth={strokeWidth} fill={fill} />
    <Circle cx="8.2" cy="15.5" r="3.2" stroke={color} strokeWidth={strokeWidth} fill={fill} />
    <Circle cx="15.8" cy="15.5" r="3.2" stroke={color} strokeWidth={strokeWidth} fill={fill} />
    {/* centro */}
    <Circle cx="12" cy="12" r="1.4" fill={color} />
  </Svg>
);

export const Torii = ({ size = S, color = C, strokeWidth = 2, fill = "none", style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    {/* barra superior */}
    <Rect x="3" y="4.5" width="18" height="2.5" rx="1" stroke={color} strokeWidth={strokeWidth} fill={fill} />
    {/* barra secundaria */}
    <Rect x="5" y="8" width="14" height="1.8" rx="0.9" stroke={color} strokeWidth={strokeWidth} fill={fill} />
    {/* postes */}
    <Rect x="6" y="9.8" width="2.2" height="9.8" rx="1" stroke={color} strokeWidth={strokeWidth} fill={fill} />
    <Rect x="15.8" y="9.8" width="2.2" height="9.8" rx="1" stroke={color} strokeWidth={strokeWidth} fill={fill} />
    {/* base */}
    <Rect x="5" y="20" width="14" height="1.6" rx="0.8" stroke={color} strokeWidth={strokeWidth} fill={fill} />
  </Svg>
);

export const Onigiri = ({ size = S, color = C, strokeWidth = 2, fill = "none", style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    {/* triángulo */}
    <Polygon
      points="12,3.5 21,18.2 3,18.2"
      stroke={color}
      strokeWidth={strokeWidth}
      fill={fill}
      strokeLinejoin="round"
    />
    {/* alga (nori) */}
    <Rect x="8" y="13.5" width="8" height="4.8" rx="1" fill={color} />
  </Svg>
);

export const Ramen = ({ size = S, color = C, strokeWidth = 2, fill = "none", style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    {/* tazón */}
    <Path d="M4 12a8 8 0 0 0 16 0H4z" stroke={color} strokeWidth={strokeWidth} fill={fill} />
    {/* noodles */}
    <Line x1="8" y1="6" x2="8" y2="11.5" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="11" y1="6" x2="11" y2="11.5" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="14" y1="6" x2="14" y2="11.5" stroke={color} strokeWidth={strokeWidth} />
    {/* palillos */}
    <Line x1="5" y1="5.5" x2="19" y2="3.5" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="5" y1="7" x2="18" y2="5" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const Fuji = ({ size = S, color = C, strokeWidth = 2, fill = "none", style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    {/* montaña */}
    <Polygon points="3,19 12,5 21,19" stroke={color} strokeWidth={strokeWidth} fill={fill} strokeLinejoin="round" />
    {/* nieve */}
    <Path d="M9 10.2l1.8-2.7 1.8 2.7 1.2-.8 1.2.8" stroke={color} strokeWidth={strokeWidth} fill="none" />
  </Svg>
);

export const Lantern = ({ size = S, color = C, strokeWidth = 2, fill = "none", style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    {/* cuerpo */}
    <Rect x="7" y="6" width="10" height="12" rx="5" stroke={color} strokeWidth={strokeWidth} fill={fill} />
    {/* líneas */}
    <Line x1="9" y1="9" x2="15" y2="9" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="9" y1="12" x2="15" y2="12" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="9" y1="15" x2="15" y2="15" stroke={color} strokeWidth={strokeWidth} />
    {/* top y bottom */}
    <Rect x="9" y="4.5" width="6" height="1.5" rx="0.7" fill={color} />
    <Rect x="9" y="18.5" width="6" height="1.5" rx="0.7" fill={color} />
  </Svg>
);

export const ChevronRight = ({ size = S, color = C, strokeWidth = 2, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

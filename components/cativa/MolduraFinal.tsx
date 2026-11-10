import { useId } from "react";
import s from "./Ticket.module.css";

/** Medidas da moldura em volta do ingresso (748 × 276): margem dos lados e espaço do brasão em cima. */
export const MOLDURA = { lado: 22, topo: 58, base: 22 };
export const LARGURA_MOLDURA = 748 + MOLDURA.lado * 2;
export const ALTURA_MOLDURA = 276 + MOLDURA.topo + MOLDURA.base;

const W = LARGURA_MOLDURA;
const H = ALTURA_MOLDURA;
const CX = W / 2;

/** Canto da moldura: cantoneira por fora do aro, com esporas nas pontas, voluta por dentro e gema na quina.
 *  Desenhada para o canto de cima à esquerda; (0, 0) é a quina do aro. */
function Canto({ id, transform }: { id: string; transform?: string }) {
  const ouro = `url(#${id}-ouro)`;
  return (
    <g transform={transform}>
      <path d="M-6 74 V24 Q-6 -6 24 -6 H74" fill="none" stroke={ouro} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M-12 72 L-6 94 L0 72 Z" fill={ouro} />
      <path d="M72 -12 L94 -6 L72 0 Z" fill={ouro} />
      <path d="M9 52 Q9 9 52 9" fill="none" stroke={ouro} strokeWidth="1.4" opacity="0.8" />
      <circle cx="9" cy="52" r="2.2" fill={ouro} />
      <circle cx="52" cy="9" r="2.2" fill={ouro} />
      <path d="M4 -8 L16 4 L4 16 L-8 4 Z" fill={ouro} stroke="#5a3d0a" strokeWidth="1" />
      <circle cx="4" cy="4" r="3" fill="#fff3c4" />
    </g>
  );
}

/** Ramo de louro: folhas alternadas ao longo de um caule em curva, do brasão para fora. */
function Louro({ id, espelhado }: { id: string; espelhado?: boolean }) {
  const p0 = [CX - 22, 50];
  const p1 = [CX - 64, 46];
  const p2 = [CX - 74, 8];
  const ponto = (t: number) => [0, 1].map((k) => (1 - t) ** 2 * p0[k] + 2 * (1 - t) * t * p1[k] + t ** 2 * p2[k]);
  const tangente = (t: number) => [0, 1].map((k) => 2 * (1 - t) * (p1[k] - p0[k]) + 2 * t * (p2[k] - p1[k]));
  const folhas = [0.12, 0.26, 0.4, 0.54, 0.68, 0.82, 0.95];
  return (
    <g transform={espelhado ? `translate(${CX * 2} 0) scale(-1 1)` : undefined}>
      <path d={`M${p0} Q${p1} ${p2}`} fill="none" stroke={`url(#${id}-ouro)`} strokeWidth="2.2" strokeLinecap="round" />
      {folhas.map((t, i) => {
        const [x, y] = ponto(t);
        const [dx, dy] = tangente(t);
        const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
        const lado = i % 2 ? 1 : -1;
        const tam = 1 - t * 0.35;
        return (
          <path
            key={t}
            d={`M0 0 Q${10 * tam} ${-8 * tam} ${22 * tam} 0 Q${10 * tam} ${8 * tam} 0 0 Z`}
            transform={`translate(${x} ${y}) rotate(${ang + lado * 40})`}
            fill={`url(#${id}-ouro)`}
          />
        );
      })}
    </g>
  );
}

/**
 * Moldura de final: aro dourado duplo em volta do ingresso, cantoneiras com espora,
 * brasão com louros e estrela no alto e um brilho que corre pelo aro.
 */
export default function MolduraFinal() {
  const id = useId().replace(/:/g, "");
  const aro = `M${MOLDURA.lado - 9 + 30} ${MOLDURA.topo - 9} H${W - MOLDURA.lado + 9 - 30} A30 30 0 0 1 ${W - MOLDURA.lado + 9} ${MOLDURA.topo - 9 + 30} V${H - MOLDURA.base + 9 - 30} A30 30 0 0 1 ${W - MOLDURA.lado + 9 - 30} ${H - MOLDURA.base + 9} H${MOLDURA.lado - 9 + 30} A30 30 0 0 1 ${MOLDURA.lado - 9} ${H - MOLDURA.base + 9 - 30} V${MOLDURA.topo - 9 + 30} A30 30 0 0 1 ${MOLDURA.lado - 9 + 30} ${MOLDURA.topo - 9} Z`;
  const x0 = MOLDURA.lado - 9;
  const y0 = MOLDURA.topo - 9;
  const x1 = W - MOLDURA.lado + 9;
  const y1 = H - MOLDURA.base + 9;

  return (
    <svg className={s.camada} viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-ouro`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FBE7A6" />
          <stop offset="0.35" stopColor="#D8B04C" />
          <stop offset="0.6" stopColor="#A9791A" />
          <stop offset="1" stopColor="#F3D98B" />
        </linearGradient>
        <linearGradient id={`${id}-brilho`} gradientUnits="userSpaceOnUse" x1="-200" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fff8dc" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff8dc" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff8dc" stopOpacity="0" />
          <animateTransform attributeName="gradientTransform" type="translate" values={`0 0; ${W + 200} 0; ${W + 200} 0`} keyTimes="0; 0.55; 1" dur="4.5s" repeatCount="indefinite" />
        </linearGradient>
      </defs>

      {/* Aro duplo */}
      <path d={aro} fill="none" stroke={`url(#${id}-ouro)`} strokeWidth="3.5" />
      <rect x={x0 + 5} y={y0 + 5} width={x1 - x0 - 10} height={y1 - y0 - 10} rx="25" fill="none" stroke={`url(#${id}-ouro)`} strokeWidth="1.2" opacity="0.75" />
      <path className={s.brilho} d={aro} fill="none" stroke={`url(#${id}-brilho)`} strokeWidth="3.5" />

      {/* Cantoneiras */}
      <Canto id={id} transform={`translate(${x0} ${y0})`} />
      <Canto id={id} transform={`translate(${x1} ${y0}) scale(-1 1)`} />
      <Canto id={id} transform={`translate(${x0} ${y1}) scale(1 -1)`} />
      <Canto id={id} transform={`translate(${x1} ${y1}) scale(-1 -1)`} />

      {/* Losango no meio da base */}
      <path d={`M${CX - 14} ${y1} L${CX} ${y1 - 8} L${CX + 14} ${y1} L${CX} ${y1 + 8} Z`} fill={`url(#${id}-ouro)`} stroke="#5a3d0a" strokeWidth="1" />

      {/* Gemas no meio das laterais */}
      {[x0, x1].map((x) => (
        <path key={x} d={`M${x} ${(y0 + y1) / 2 - 16} L${x + 7} ${(y0 + y1) / 2} L${x} ${(y0 + y1) / 2 + 16} L${x - 7} ${(y0 + y1) / 2} Z`} fill={`url(#${id}-ouro)`} stroke="#5a3d0a" strokeWidth="1" />
      ))}

      {/* Brasão: louros, medalhão com estrela e faixa FINAL sobre o aro */}
      <Louro id={id} />
      <Louro id={id} espelhado />
      <path d={`M${CX - 70} ${y0 - 4} L${CX - 96} ${y0 - 4} L${CX - 86} ${y0 + 5} L${CX - 96} ${y0 + 14} L${CX - 64} ${y0 + 14} Z`} fill="#8a6215" stroke="#5a3d0a" strokeWidth="1" />
      <path d={`M${CX + 70} ${y0 - 4} L${CX + 96} ${y0 - 4} L${CX + 86} ${y0 + 5} L${CX + 96} ${y0 + 14} L${CX + 64} ${y0 + 14} Z`} fill="#8a6215" stroke="#5a3d0a" strokeWidth="1" />
      <circle cx={CX} cy="25" r="21" fill="#17110a" stroke={`url(#${id}-ouro)`} strokeWidth="3.5" />
      <circle cx={CX} cy="25" r="15.5" fill="none" stroke={`url(#${id}-ouro)`} strokeWidth="1" opacity="0.7" />
      <path
        d={`M${CX} 13 L${CX + 3.5} 21 L${CX + 12} 21.6 L${CX + 5.5} 27.2 L${CX + 7.4} 35.5 L${CX} 31 L${CX - 7.4} 35.5 L${CX - 5.5} 27.2 L${CX - 12} 21.6 L${CX - 3.5} 21 Z`}
        fill={`url(#${id}-ouro)`}
      />
      <path d={`M${CX - 74} ${y0 - 10} H${CX + 74} L${CX + 68} ${y0} L${CX + 74} ${y0 + 10} H${CX - 74} L${CX - 68} ${y0} Z`} fill={`url(#${id}-ouro)`} stroke="#5a3d0a" strokeWidth="1.2" />
      <text x={CX + 2.5} y={y0 + 5} textAnchor="middle" fontSize="14" fontWeight="800" letterSpacing="0.36em" fill="#3a2706" style={{ fontFamily: "var(--font-texto), sans-serif" }}>
        FINAL
      </text>
    </svg>
  );
}

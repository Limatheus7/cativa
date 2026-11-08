// Temas do ingresso de presença por competição.
// Valores copiados do kit de design (ingressos.html, THEMES). Não alterar sem o design.
// A silhueta da taça é um PNG com fundo transparente em public/ingressos/:
// não redesenhar; só posicionar com os valores de `taca`.

export type TacaDoIngresso = {
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
  rotate: number;
  opacity: number;
};

export type TemaIngresso = {
  body: string;
  stub: string;
  accent: string;
  text: string;
  teamText: string;
  stubLabel: string;
  stubNumber: string;
  stubIcon: string;
  perforation: string;
  perforationOpacity: number;
  divider: string;
  dividerOpacity: number;
  crestRing: string | null;
  taca: TacaDoIngresso | null;
};

const BRASILEIRAO: TemaIngresso = {
  body: "#1F4D3A",
  stub: "#FBF4E3",
  accent: "#D8B04C",
  text: "#F3ECD8",
  teamText: "#E9E4D2",
  stubLabel: "#A9751A",
  stubNumber: "#1F4D3A",
  stubIcon: "#1F4D3A",
  perforation: "#CFE0C9",
  perforationOpacity: 1,
  divider: "#E9E4D2",
  dividerOpacity: 0.25,
  crestRing: null,
  taca: { src: "/ingressos/silhueta-brasileirao.png", left: 134, top: -110, width: 330, height: 500, rotate: 24, opacity: 0.6 },
};

const LIBERTADORES: TemaIngresso = {
  body: "#0F0F0F",
  stub: "#E9D28A",
  accent: "#D4AF37",
  text: "#F3ECD8",
  teamText: "#F3ECD8",
  stubLabel: "#6B4E0E",
  stubNumber: "#1A1A1A",
  stubIcon: "#1A1A1A",
  perforation: "#D4AF37",
  perforationOpacity: 0.7,
  divider: "#D4AF37",
  dividerOpacity: 0.3,
  crestRing: "#D4AF37",
  taca: { src: "/ingressos/silhueta-libertadores.png", left: 212, top: 5, width: 176, height: 400, rotate: 24, opacity: 0.18 },
};

/** Competição desconhecida: visual do Brasileirão, sem taça (o kit pede tema padrão sem taça). */
const PADRAO: TemaIngresso = { ...BRASILEIRAO, taca: null };

export function temaDoIngresso(competicao: string): TemaIngresso {
  if (/libertadores/i.test(competicao)) return LIBERTADORES;
  if (/brasileir|s[ée]rie [abc]/i.test(competicao)) return BRASILEIRAO;
  return PADRAO;
}

/** Medidas do ingresso no kit (px). O componente escala tudo a partir daqui. */
export const LARGURA_INGRESSO = 748;
export const ALTURA_INGRESSO = 276;

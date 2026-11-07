// Time do torcedor: criado por ele, sem escudos. Aparece como monograma
// de iniciais sobre as cores do time, e essas cores "vestem" o app.

export type Padrao = "liso" | "vertical" | "horizontal" | "faixa-diagonal" | "faixa-horizontal";

export const PADROES: { valor: Padrao; nome: string }[] = [
  { valor: "liso", nome: "Lisa" },
  { valor: "vertical", nome: "Listras verticais" },
  { valor: "horizontal", nome: "Listras horizontais" },
  { valor: "faixa-diagonal", nome: "Faixa diagonal" },
  { valor: "faixa-horizontal", nome: "Faixa no peito" },
];

export type Time = {
  nome: string;
  iniciais: string;
  corPrincipal: string;
  corSegunda: string;
  /** Desenho da camisa no círculo. Sem padrão = lisa. */
  padrao?: Padrao;
  /** Cores das listras/faixa, na ordem. Sem isso, usa principal e segunda. */
  faixas?: string[];
  /** Sigla de transmissão quando o time veio da lista de clubes. */
  clube?: string;
};

/** Fundo CSS do círculo, desenhando a camisa. */
export function fundoDaCamisa(padrao: Padrao = "liso", cores: string[]): string {
  const [a, b = a] = cores;
  const listras = (angulo: number) => {
    // 5 listras atravessam o círculo; cada cor ocupa uma listra.
    const largura = 20;
    const paradas = cores.map((c, i) => `${c} ${i * largura}% ${(i + 1) * largura}%`).join(", ");
    return `repeating-linear-gradient(${angulo}deg, ${paradas})`;
  };
  switch (padrao) {
    case "vertical":
      return listras(90);
    case "horizontal":
      return listras(180);
    case "faixa-diagonal":
      return `linear-gradient(45deg, ${a} 0 37%, ${b} 37% 63%, ${a} 63%)`;
    case "faixa-horizontal": {
      // Base, e as cores da faixa empilhadas no meio do peito.
      const faixa = cores.slice(1);
      const altura = 30 / faixa.length;
      const meio = faixa.map((c, i) => `${c} ${35 + i * altura}% ${35 + (i + 1) * altura}%`).join(", ");
      return `linear-gradient(180deg, ${a} 0 35%, ${meio}, ${a} 65%)`;
    }
    default:
      return a;
  }
}

export type Cor = { nome: string; hex: string };

export const CORES: Cor[] = [
  { nome: "Vermelho", hex: "#C8102E" },
  { nome: "Grená", hex: "#7A1F2B" },
  { nome: "Laranja", hex: "#E8641B" },
  { nome: "Amarelo", hex: "#F2C230" },
  { nome: "Verde", hex: "#1E8C45" },
  { nome: "Verde-escuro", hex: "#0F4D2E" },
  { nome: "Celeste", hex: "#7DBEE8" },
  { nome: "Azul", hex: "#1D4F91" },
  { nome: "Azul-marinho", hex: "#14254A" },
  { nome: "Roxo", hex: "#5B2A86" },
  { nome: "Preto", hex: "#1A1A1A" },
  { nome: "Branco", hex: "#FFFFFF" },
];

const PAPEL = "#F4EBD9";
const TINTA = "#1E2A22";

const PALAVRAS_IGNORADAS = new Set([
  "de", "da", "do", "das", "dos", "e",
  "clube", "club", "futebol", "esporte", "sport",
  "fc", "ec", "sc", "ac", "cr", "cf",
]);

export function sugerirIniciais(nome: string): string {
  const palavras = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const uteis = palavras.filter((p) => !PALAVRAS_IGNORADAS.has(p.toLowerCase()));
  const base = uteis.length ? uteis : palavras;
  if (base.length === 0) return "";
  if (base.length === 1) return base[0].slice(0, 2).toUpperCase();
  return (base[0][0] + base[1][0]).toUpperCase();
}

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function hexDe([r, g, b]: [number, number, number]): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function luminancia(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Papel ou tinta, o que for mais legível sobre a cor. */
export function textoSobre(cor: string): string {
  return contraste(cor, PAPEL) >= contraste(cor, TINTA) ? PAPEL : TINTA;
}

/** Escurece a cor até ela ser legível sobre o papel (botões, números, barra). */
function legivelSobrePapel(cor: string): string {
  let atual = rgb(cor);
  for (let i = 0; i < 20 && contraste(hexDe(atual), PAPEL) < 4.5; i++) {
    atual = atual.map((v) => v * 0.9) as [number, number, number];
  }
  return hexDe(atual);
}

/** Variáveis CSS que vestem o app com as cores do time. */
export function temaDoTime(time: Pick<Time, "corPrincipal" | "corSegunda">): Record<string, string> {
  const { corPrincipal, corSegunda } = time;
  // Time de cor principal clara (ex.: branco) usa a segunda cor nos destaques.
  const baseDestaque = luminancia(corPrincipal) > 0.8 ? corSegunda : corPrincipal;
  const destaque = legivelSobrePapel(baseDestaque);
  const letras = contraste(corPrincipal, corSegunda) >= 3 ? corPrincipal : textoSobre(corSegunda);

  return {
    "--time-principal": corPrincipal,
    "--time-sobre-principal": textoSobre(corPrincipal),
    "--time-segunda": corSegunda,
    "--time-monograma-letras": letras,
    "--time-destaque": destaque,
    "--time-sobre-destaque": textoSobre(destaque),
    "--time-contorno": contraste(corPrincipal, corSegunda) < 1.6 ? textoSobre(corPrincipal) : "transparent",
  };
}

/** Letras da sigla sobre uma camisa lisa: segunda cor, ou papel/tinta se não der leitura. */
export function letrasSobreLiso(corPrincipal: string, corSegunda: string) {
  return contraste(corPrincipal, corSegunda) >= 3 ? corSegunda : textoSobre(corPrincipal);
}

/**
 * Tela inteira na cor do time: fundo na cor principal; logotipo e textos na
 * segunda cor quando ela lê bem (Flamengo: vermelho com Cativa em preto),
 * senão em papel ou tinta.
 */
export function telaDoTime(time: Pick<Time, "corPrincipal" | "corSegunda">) {
  const texto = letrasSobreLiso(time.corPrincipal, time.corSegunda);
  return { fundo: time.corPrincipal, texto };
}

/** Camisas brancas ou muito claras precisam de contorno para não sumir no papel. */
export function precisaContorno(cores: string[]) {
  return cores.some((c) => contraste(c, PAPEL) < 1.4);
}

const CHAVE = "cativa:time";

export function salvarTime(time: Time) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(time));
  } catch {}
}

export function carregarTime(): Time | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as Time) : null;
  } catch {
    return null;
  }
}

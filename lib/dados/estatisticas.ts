import { chaveDoEstadio } from "./estadios";
import type { Presenca } from "./tipos";

// Níveis em proposta (apresentação de marca, slide 11). Podem mudar.
export const NIVEIS = [
  { nome: "Geral", jogos: 1 },
  { nome: "Arquibancada", jogos: 3 },
  { nome: "Cadeira Numerada", jogos: 10 },
  { nome: "Cadeira Cativa", jogos: 25 },
] as const;

export type Nivel = (typeof NIVEIS)[number];

export function nivelAtual(jogos: number): Nivel | null {
  return [...NIVEIS].reverse().find((n) => jogos >= n.jogos) ?? null;
}

export function proximoNivel(jogos: number): Nivel | null {
  return NIVEIS.find((n) => n.jogos > jogos) ?? null;
}

export type Estatisticas = {
  total: number;
  V: number;
  E: number;
  D: number;
  estadios: number;
  estados: number;
  fora: number;
  comCompanhia: number;
  comFoto: number;
  antigas: number;
  nivel: Nivel | null;
  proximo: Nivel | null;
  /** 0 a 1 até o próximo nível. */
  progresso: number;
  ultima: Presenca | null;
};

export function estatisticas(presencas: Presenca[], hoje = new Date()): Estatisticas {
  const total = presencas.length;
  const conta = (r: "V" | "E" | "D") => presencas.filter((p) => p.resultado === r).length;
  const nivel = nivelAtual(total);
  const proximo = proximoNivel(total);
  const base = nivel?.jogos ?? 0;
  const progresso = proximo ? (total - base) / (proximo.jogos - base) : 1;
  const anoAtual = hoje.getFullYear();

  return {
    total,
    V: conta("V"),
    E: conta("E"),
    D: conta("D"),
    estadios: new Set(presencas.map((p) => chaveDoEstadio(p.estadio))).size,
    estados: new Set(presencas.map((p) => p.estadio.uf)).size,
    fora: presencas.filter((p) => p.partida.mando === "fora").length,
    comCompanhia: presencas.filter((p) => p.companhia.length > 0).length,
    comFoto: presencas.filter((p) => p.fotos.length > 0).length,
    antigas: presencas.filter((p) => Number(p.partida.data.slice(0, 4)) < anoAtual).length,
    nivel,
    proximo,
    progresso,
    ultima: ordenarPorData(presencas)[0] ?? null,
  };
}

export function ordenarPorData(presencas: Presenca[]): Presenca[] {
  return [...presencas].sort((a, b) => b.partida.data.localeCompare(a.partida.data) || b.numero - a.numero);
}

export function resultadoDoPlacar(golsTime: number, golsAdversario: number) {
  return golsTime > golsAdversario ? "V" : golsTime < golsAdversario ? "D" : "E";
}

export const NOME_RESULTADO = { V: "Vitória", E: "Empate", D: "Derrota" } as const;

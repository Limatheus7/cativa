// PERFIS DE DEMONSTRAÇÃO. Pessoas e jogos fictícios para a rede não ficar vazia
// enquanto o backend não existe. Nunca se misturam com os registros do torcedor
// e aparecem marcados como demonstração na interface.

import { CLUBES } from "@/lib/times";
import { estadioDeCasa, estadioPorId } from "../estadios";
import { resultadoDoPlacar } from "../estatisticas";
import type { IdentidadeDoTime, Mando, Presenca, TorcedorPublico } from "../tipos";

function time(sigla: string): IdentidadeDoTime {
  const c = CLUBES.find((x) => x.sigla === sigla)!;
  return { nome: c.nome, sigla: c.sigla, corPrincipal: c.corPrincipal, corSegunda: c.corSegunda, padrao: c.padrao, faixas: c.faixas };
}

type Jogo = {
  data: string;
  contra: string;
  mando: Mando;
  placar: [number, number];
  competicao: string;
  frase: string;
  setor?: string;
  estadio?: string;
};

function torcedor(
  usuario: string,
  nome: string,
  cidade: string,
  uf: string,
  sigla: string,
  jogos: Jogo[],
  perfilPublico = true,
): TorcedorPublico {
  const seu = time(sigla);
  const presencas: Presenca[] = jogos.map((j, i) => {
    const adversario = time(j.contra);
    const est =
      estadioPorId(j.estadio) ?? (j.mando === "fora" ? estadioDeCasa(j.contra) : estadioDeCasa(sigla)) ?? estadioPorId("maracana")!;
    return {
      id: `${usuario}-${i + 1}`,
      numero: i + 1,
      criadaEm: `${j.data}T22:00:00.000Z`,
      time: seu,
      partida: {
        data: j.data,
        competicao: j.competicao,
        mando: j.mando,
        adversario,
        golsTime: j.placar[0],
        golsAdversario: j.placar[1],
      },
      estadio: { id: est.id, nome: est.nome, cidade: est.cidade, uf: est.uf },
      lugar: j.setor ? { setor: j.setor } : undefined,
      companhia: [],
      fotos: [],
      frase: j.frase,
      resultado: resultadoDoPlacar(j.placar[0], j.placar[1]),
    };
  });
  return { usuario, nome, cidade, uf, time: seu, presencas, perfilPublico, demonstracao: true };
}

const BR = "Brasileirão";

export const TORCEDORES_DEMONSTRACAO: TorcedorPublico[] = [
  torcedor("ana.arquibancada", "Ana Ribeiro", "Rio de Janeiro", "RJ", "FLA", [
    { data: "2026-08-16", contra: "PAL", mando: "casa", placar: [2, 1], competicao: BR, frase: "Virada no fim, Maracanã tremendo.", setor: "Norte" },
    { data: "2026-09-27", contra: "BOT", mando: "casa", placar: [1, 1], competicao: BR, frase: "Clássico é clássico. Valeu cada minuto.", setor: "Norte" },
    { data: "2026-10-25", contra: "CAM", mando: "fora", placar: [0, 2], competicao: BR, frase: "Longe de casa, mas a gente foi." },
  ]),
  torcedor("caio.geral", "Caio Menezes", "Belo Horizonte", "MG", "CRU", [
    { data: "2026-07-12", contra: "GRE", mando: "casa", placar: [3, 0], competicao: BR, frase: "Mineirão azul do começo ao fim.", setor: "Amarelo superior" },
    { data: "2026-10-04", contra: "CAM", mando: "neutro", placar: [1, 0], competicao: "Copa do Brasil", frase: "Semana inteira de zoeira garantida.", estadio: "mineirao" },
  ], false),
  torcedor("bia.tricolor", "Beatriz Lopes", "São Paulo", "SP", "SAO", [
    { data: "2025-11-30", contra: "SAN", mando: "casa", placar: [2, 2], competicao: BR, frase: "Empate com cara de vitória pelo jogo que foi." },
    { data: "2026-05-17", contra: "COR", mando: "casa", placar: [1, 0], competicao: BR, frase: "Morumbis lotado, gol no último minuto." },
    { data: "2026-09-06", contra: "INT", mando: "fora", placar: [1, 2], competicao: BR, frase: "Viagem longa, frio em Porto Alegre." },
    { data: "2026-10-19", contra: "FOR", mando: "casa", placar: [3, 1], competicao: BR, frase: "Levei meu pai pela primeira vez." },
  ]),
  torcedor("rafa.colorado", "Rafael Souza", "Porto Alegre", "RS", "INT", [
    { data: "2026-09-06", contra: "SAO", mando: "casa", placar: [2, 1], competicao: BR, frase: "Beira-Rio cantando a noite toda.", setor: "Superior" },
    { data: "2026-10-11", contra: "GRE", mando: "fora", placar: [0, 0], competicao: "Gaúcho", frase: "Grenal é sempre grande." },
  ]),
  torcedor("lu.alvinegra", "Luana Prado", "Rio de Janeiro", "RJ", "BOT", [
    { data: "2026-06-21", contra: "VAS", mando: "casa", placar: [2, 0], competicao: BR, frase: "Dia de sol e de festa no Nilton Santos." },
    { data: "2026-09-27", contra: "FLA", mando: "fora", placar: [1, 1], competicao: BR, frase: "Do lado de lá, mas cantando mais alto." },
  ], false),
  torcedor("pedro.verdao", "Pedro Almeida", "São Paulo", "SP", "PAL", [
    { data: "2026-08-16", contra: "FLA", mando: "fora", placar: [1, 2], competicao: BR, frase: "Perdemos, mas a viagem ao Rio fica." },
  ]),
  torcedor("gabi.leoa", "Gabriela Nunes", "Fortaleza", "CE", "FOR", [
    { data: "2026-04-26", contra: "CEA", mando: "casa", placar: [2, 1], competicao: "Cearense", frase: "Castelão em festa, clássico-rei nosso." },
    { data: "2026-10-19", contra: "SAO", mando: "fora", placar: [1, 3], competicao: BR, frase: "Primeira vez no Morumbis." },
  ]),
  torcedor("thi.galo", "Thiago Castro", "Belo Horizonte", "MG", "CAM", [
    { data: "2026-10-25", contra: "FLA", mando: "casa", placar: [2, 0], competicao: BR, frase: "Arena MRV fervendo.", setor: "Sul" },
  ]),
];

/** Curtidas que já existiam na rede de demonstração (base fixa, não inventada a cada visita). */
export const CURTIDAS_DEMONSTRACAO: Record<string, number> = {
  "ana.arquibancada-3": 18, "ana.arquibancada-2": 41, "caio.geral-2": 27, "bia.tricolor-4": 52,
  "bia.tricolor-3": 9, "rafa.colorado-2": 33, "lu.alvinegra-2": 21, "pedro.verdao-1": 6,
  "gabi.leoa-2": 14, "thi.galo-1": 24,
};

export function torcedorPorUsuario(usuario: string) {
  return TORCEDORES_DEMONSTRACAO.find((t) => t.usuario === usuario);
}

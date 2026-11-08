import type { Estatisticas } from "./estatisticas";

// Conquistas calculadas a partir das presenças. Nenhuma é "dada": todas
// nascem do que o torcedor registrou.

export type Conquista = {
  id: string;
  nome: string;
  descricao: string;
  meta: number;
  valor: (e: Estatisticas) => number;
};

export const CONQUISTAS: Conquista[] = [
  { id: "estava-la", nome: "Você estava lá", descricao: "Registre sua primeira presença.", meta: 1, valor: (e) => e.total },
  { id: "grito-de-gol", nome: "Grito de gol", descricao: "Veja uma vitória do seu time ao vivo.", meta: 1, valor: (e) => e.V },
  { id: "tambem-e-historia", nome: "Também é história", descricao: "Esteja lá num empate.", meta: 1, valor: (e) => e.E },
  { id: "na-casa-deles", nome: "Na casa deles", descricao: "Acompanhe 3 jogos fora de casa.", meta: 3, valor: (e) => e.fora },
  { id: "nunca-sozinho", nome: "Nunca sozinho", descricao: "Vá a 3 jogos com companhia.", meta: 3, valor: (e) => e.comCompanhia },
  { id: "guardiao", nome: "Guardião de memórias", descricao: "Guarde fotos de 5 jogos.", meta: 5, valor: (e) => e.comFoto },
  { id: "turista", nome: "Turista de arquibancada", descricao: "Conheça 3 estádios.", meta: 3, valor: (e) => e.estadios },
  { id: "pe-na-estrada", nome: "Pé na estrada", descricao: "Veja jogos em 3 estados.", meta: 3, valor: (e) => e.estados },
  { id: "desde-sempre", nome: "Desde sempre", descricao: "Registre um jogo de um ano anterior.", meta: 1, valor: (e) => e.antigas },
  { id: "frequentador", nome: "Frequentador", descricao: "Chegue a 10 presenças.", meta: 10, valor: (e) => e.total },
  { id: "passaporte", nome: "Passaporte carimbado", descricao: "Conheça 10 estádios.", meta: 10, valor: (e) => e.estadios },
];

export function conquistaPorId(id: string) {
  return CONQUISTAS.find((c) => c.id === id);
}

export type StatusConquista = { conquista: Conquista; valor: number; desbloqueada: boolean; progresso: number };

export function statusDasConquistas(e: Estatisticas): StatusConquista[] {
  return CONQUISTAS.map((c) => {
    const valor = Math.min(c.valor(e), c.meta);
    return { conquista: c, valor, desbloqueada: valor >= c.meta, progresso: valor / c.meta };
  });
}

export function desbloqueadas(e: Estatisticas): string[] {
  return statusDasConquistas(e)
    .filter((s) => s.desbloqueada)
    .map((s) => s.conquista.id);
}

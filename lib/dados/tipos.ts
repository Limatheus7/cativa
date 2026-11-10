// Modelo de dados da Cativa. A interface só conversa com estes tipos;
// quando o backend chegar, a fonte muda (lib/dados/loja.ts), os tipos ficam.

import type { Padrao } from "@/lib/time";

export type Resultado = "V" | "E" | "D";
export type Mando = "casa" | "fora" | "neutro";

/** Time como aparece na interface: sigla e cores, nunca escudo. */
export type IdentidadeDoTime = {
  nome: string;
  sigla: string;
  corPrincipal: string;
  corSegunda: string;
  padrao?: Padrao;
  faixas?: string[];
};

export type Estadio = {
  id: string;
  nome: string;
  apelido?: string;
  cidade: string;
  uf: string;
  /** Pôster ilustrado do estádio (public/estadios). Sem ele, o sticker usa o desenho padrão. */
  arte?: string;
};

/** Estádio informado na presença: do catálogo (id) ou digitado à mão. */
export type EstadioDaPresenca = {
  id?: string;
  nome: string;
  cidade: string;
  uf: string;
};

export type Partida = {
  /** AAAA-MM-DD */
  data: string;
  competicao: string;
  /** Fase do mata-mata ("Final", "Semifinal"…). Vazio em jogos comuns. */
  fase?: string;
  mando: Mando;
  adversario: IdentidadeDoTime;
  golsTime: number;
  golsAdversario: number;
};

export type Companhia = { nome: string; usuario?: string };

export type Presenca = {
  id: string;
  /** Nº da presença do torcedor (Nº 0001, 0002…). */
  numero: number;
  criadaEm: string;
  time: IdentidadeDoTime;
  partida: Partida;
  estadio: EstadioDaPresenca;
  lugar?: { setor?: string; fila?: string; cadeira?: string };
  companhia: Companhia[];
  fotos: string[];
  frase: string;
  resultado: Resultado;
};

export type Perfil = {
  nome: string;
  usuario: string;
  cidade?: string;
  uf?: string;
  /** Foto de perfil já enquadrada (quadrada). */
  foto?: string;
  /** Foto original (reduzida), para reenquadrar sem perder qualidade. */
  fotoOriginal?: string;
  bio?: string;
};

export type TorcedorPublico = {
  usuario: string;
  nome: string;
  cidade: string;
  uf: string;
  time: IdentidadeDoTime;
  presencas: Presenca[];
  /** Perfil público: qualquer um vê a coleção. Privado: só quem acompanha. */
  perfilPublico: boolean;
  /** Perfis mockados enquanto a rede não está no ar. */
  demonstracao: true;
};

export type Comentario = { id: string; autor: string; texto: string; criadoEm: string };

export type Notificacao = {
  id: string;
  tipo: "conquista" | "nivel" | "estadio" | "presenca";
  titulo: string;
  texto: string;
  href: string;
  criadaEm: string;
  lida: boolean;
};

export type Configuracoes = {
  perfilPublico: boolean;
  notificacoes: { conquistas: boolean; curtidas: boolean; comentarios: boolean; seguidores: boolean };
};

export type DadosDoTorcedor = {
  versao: 1;
  perfil: Perfil;
  presencas: Presenca[];
  /** @usuario de quem o torcedor acompanha. */
  seguindo: string[];
  /** Presenças próprias compartilhadas no feed. */
  publicadas: string[];
  curtidas: string[];
  comentarios: Record<string, Comentario[]>;
  notificacoes: Notificacao[];
  favoritas: string[];
  config: Configuracoes;
};

export type ItemDoFeed =
  | { tipo: "presenca"; id: string; data: string; autor: string; presenca: Presenca; curtidasBase: number }
  | { tipo: "conquista"; id: string; data: string; autor: string; conquistaId: string; curtidasBase: number };

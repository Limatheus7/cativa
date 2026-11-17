import type { Presenca, Visita } from "@/lib/dados/tipos";

export type Formato = "story" | "feed";

export const TAMANHO: Record<Formato, { w: number; h: number }> = {
  story: { w: 1080, h: 1920 },
  feed: { w: 1080, h: 1350 },
};

/** Estilo do modelo "Seu estilo": o usuário monta o próprio story. */
export type Estilo = {
  /** "time" segue as cores do time escolhido no perfil. */
  fundo: "time" | "verde" | "noite" | "papel" | "azul";
  listras: "nenhuma" | "verticais" | "horizontais" | "diagonais" | "faixas";
  forma: "arredondada" | "polaroide" | "circulo" | "reta" | "horizontal" | "quadrado";
};

export const ESTILO_PADRAO: Estilo = { fundo: "time", listras: "verticais", forma: "arredondada" };

/** Escolhas da tela "Seu story". */
export type Opcoes = {
  /** Usar as fotos do jogo. */
  fotos: boolean;
  /** Mostrar o setor (e fila e cadeira) e o número da presença nos textos. */
  setor: boolean;
  /** Mostrar a assinatura na imagem. */
  marca: boolean;
  /** Texto da assinatura. Por enquanto "cativa.app" (ainda não há Instagram). */
  assinatura: string;
  /** Cor do placar ("" = a padrão do modelo). */
  corPlacar: string;
  /** Só vale para o modelo "Seu estilo". */
  estilo: Estilo;
};

export const ASSINATURA_PADRAO = "cativa.app";

export const OPCOES_PADRAO: Opcoes = { fotos: true, setor: true, marca: true, assinatura: ASSINATURA_PADRAO, corPlacar: "", estilo: ESTILO_PADRAO };

/** Texto da assinatura a desenhar, ou "" quando está desligada. */
export function assinaturaDe(o?: Opcoes) {
  const op = o ?? OPCOES_PADRAO;
  return op.marca ? op.assinatura.trim() || ASSINATURA_PADRAO : "";
}

/** Tudo o que um modelo de jogo precisa. Só dados que o registro realmente tem. */
export type DadosJogo = {
  tipo: "jogo";
  presenca: Presenca;
  /** Quantas vezes a pessoa esteve nesse estádio, contando esta (nunca inventado). */
  nEstadio: number;
  /** Quantas vezes no mesmo setor desse estádio, contando esta. Só existe com setor. */
  nSetor?: number;
  opcoes?: Opcoes;
  /** Foto de fundo do Canhoto já recortada e suavizada (preenchido ao gerar a imagem). */
  fundoSuave?: string;
  /** Foto do Jornal já em preto e branco (preenchido ao gerar a imagem). */
  fotoCinza?: string;
};

/** Modelo de visita ao estádio (turismo, sem jogo). */
export type DadosVisita = {
  tipo: "visita";
  visita: Visita;
  /** Quantos estádios diferentes a pessoa já tem, contando este. */
  nEstadios: number;
  opcoes?: Opcoes;
};

export type DadosCompartilhar = DadosJogo | DadosVisita;

export type ModeloProps = DadosJogo & { formato: Formato };
export type ModeloVisitaProps = DadosVisita & { formato: Formato };

export type InfoModelo = {
  id: string;
  nome: string;
  descricao: string;
  formato: Formato;
  para: "jogo" | "visita";
  /** Etiqueta na miniatura ("Único"). */
  etiqueta?: string;
  disponivel: (d: DadosCompartilhar) => boolean;
};

/** Identificador estável do registro (para cache e nome do arquivo). */
export function idDe(d: DadosCompartilhar) {
  return d.tipo === "jogo" ? d.presenca.id : d.visita.id;
}
export function numeroDe(d: DadosCompartilhar) {
  return d.tipo === "jogo" ? d.presenca.numero : d.visita.numero;
}

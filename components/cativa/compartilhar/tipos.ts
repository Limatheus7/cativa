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

/** Em que ponto a foto é enquadrada (como o object-position do CSS): 0 a 100, 50 = centro. */
export type Enquadre = { x: number; y: number };
export const ENQUADRE_CENTRO: Enquadre = { x: 50, y: 50 };

/** Escolhas da tela "Seu story". */
export type Opcoes = {
  /** Usar as fotos do jogo. */
  fotos: boolean;
  /** Mostrar o setor (e fila e cadeira) e o número da presença nos textos. */
  setor: boolean;
  /** Cor do placar ("" = a padrão do modelo). */
  corPlacar: string;
  /** Só vale para o modelo "Seu estilo". */
  estilo: Estilo;
};

/**
 * Assinatura que vai em TODAS as artes (fixa, sem opção de desligar): o perfil do Instagram.
 * Para trocar, é só mudar este texto.
 */
export const ASSINATURA = "@cativapp";

export const OPCOES_PADRAO: Opcoes = { fotos: true, setor: true, corPlacar: "", estilo: ESTILO_PADRAO };

/** Texto da assinatura a desenhar: sempre o mesmo, em todas as artes. */
export function assinaturaDe(_opcoes?: Opcoes) {
  return ASSINATURA;
}

/** Tudo o que um modelo de jogo precisa. Só dados que o registro realmente tem. */
export type DadosJogo = {
  tipo: "jogo";
  presenca: Presenca;
  /** Enquadre de cada foto (mesma ordem de presenca.fotos). Vazio = todas centralizadas. */
  enquadres?: Enquadre[];
  /** Quantas vezes a pessoa esteve nesse estádio, contando esta (nunca inventado). */
  nEstadio: number;
  /** Quantas vezes no mesmo setor desse estádio, contando esta. Só existe com setor. */
  nSetor?: number;
  opcoes?: Opcoes;
  /** Foto de fundo do Canhoto já recortada e suavizada (preenchido ao gerar a imagem). */
  fundoSuave?: string;
  /** O WebKit (iPhone/Safari) não desenha na captura as imagens que gero em canvas: nele o desfoque do
   *  Canhoto e o preto e branco do Jornal usam o filtro do CSS sobre a foto original. */
  filtrosCss?: boolean;
  /** Foto do Jornal já em preto e branco (preenchido ao gerar a imagem). */
  fotoCinza?: string;
};

/** Modelo de visita ao estádio (turismo, sem jogo). */
export type DadosVisita = {
  tipo: "visita";
  visita: Visita;
  enquadres?: Enquadre[];
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

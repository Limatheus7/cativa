"use client";

// Loja de dados do torcedor. Hoje guarda no próprio aparelho (localStorage);
// é o único lugar a trocar quando a API existir. Todas as telas leem daqui,
// então registrar uma presença atualiza Início, Coleção e Perfil na hora.

import { useSyncExternalStore } from "react";
import { conquistaPorId, desbloqueadas, statusDasConquistas, type Conquista } from "./conquistas";
import { chaveDoEstadio } from "./estadios";
import { estatisticas, nivelAtual, ordenarPorData, type Nivel } from "./estatisticas";
import { CURTIDAS_DEMONSTRACAO, TORCEDORES_DEMONSTRACAO } from "./mock/torcedores";
import type { Comentario, DadosDoTorcedor, ItemDoFeed, Notificacao, Perfil, Presenca, Visita } from "./tipos";

export type StatusLoja = "carregando" | "pronto" | "erro";
type Retrato = { status: StatusLoja; dados: DadosDoTorcedor; erro?: string };

const CHAVE = "cativa:dados";

function vazio(): DadosDoTorcedor {
  return {
    versao: 1,
    perfil: { nome: "", usuario: "" },
    presencas: [],
    visitas: [],
    seguindo: [],
    publicadas: [],
    curtidas: [],
    comentarios: {},
    notificacoes: [],
    favoritas: [],
    config: {
      perfilPublico: true,
      notificacoes: { conquistas: true, curtidas: true, comentarios: true, seguidores: true },
    },
  };
}

const NO_SERVIDOR: Retrato = { status: "carregando", dados: vazio() };
let retrato: Retrato = NO_SERVIDOR;
let carregou = false;
const ouvintes = new Set<() => void>();

function emitir() {
  ouvintes.forEach((o) => o());
}

function carregar() {
  carregou = true;
  try {
    const bruto = localStorage.getItem(CHAVE);
    const salvo = bruto ? (JSON.parse(bruto) as Partial<DadosDoTorcedor>) : null;
    if (salvo && salvo.versao !== 1) throw new Error("versão desconhecida");
    const base = vazio();
    retrato = {
      status: "pronto",
      dados: salvo ? { ...base, ...salvo, config: { ...base.config, ...salvo.config } } : base,
    };
  } catch {
    retrato = { status: "erro", dados: vazio(), erro: "Não conseguimos abrir seus registros neste aparelho." };
  }
  emitir();
}

function inscrever(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  if (!carregou) queueMicrotask(carregar);
  return () => ouvintes.delete(ouvinte);
}

/** Lê a loja. Re-renderiza quando qualquer tela muda os dados. */
export function useLoja(): Retrato {
  return useSyncExternalStore(inscrever, () => retrato, () => NO_SERVIDOR);
}

export function recarregar() {
  retrato = { ...retrato, status: "carregando" };
  emitir();
  carregar();
}

function gravar(dados: DadosDoTorcedor) {
  localStorage.setItem(CHAVE, JSON.stringify(dados));
  retrato = { status: "pronto", dados };
  emitir();
}

function mudar(fn: (d: DadosDoTorcedor) => DadosDoTorcedor) {
  gravar(fn(retrato.dados));
}

function novoId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------- Perfil

export function slugUsuario(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 24);
}

/** Chamado no cadastro: nome e apelido viram o perfil inicial. */
export function iniciarPerfil(nome: string, apelido: string) {
  if (!carregou) carregar();
  mudar((d) => ({ ...d, perfil: { ...d.perfil, nome: nome.trim(), usuario: slugUsuario(apelido || nome) } }));
}

export function atualizarPerfil(parcial: Partial<Perfil>) {
  mudar((d) => ({ ...d, perfil: { ...d.perfil, ...parcial } }));
}

export function atualizarConfig(parcial: Partial<DadosDoTorcedor["config"]>) {
  mudar((d) => ({ ...d, config: { ...d.config, ...parcial } }));
}

// ---------------------------------------------------------------- Presença

export type EntradaPresenca = Omit<Presenca, "id" | "numero" | "criadaEm">;

export type Novidades = {
  conquistas: Conquista[];
  nivel: Nivel | null;
  estadioNovo: boolean;
};

export class SemEspacoError extends Error {}

// ---------------------------------------------------------------- Espaço no aparelho

/** Lado maior e qualidade JPEG de cada nível de compactação das fotos. */
const NIVEIS_DE_FOTO = [
  { lado: 720, qualidade: 0.62 },
  { lado: 540, qualidade: 0.55 },
  { lado: 400, qualidade: 0.5 },
] as const;

/** Reduz uma foto (data URL) para o nível pedido (1 a 3). Mantém a original se não der para abrir. */
async function reencodarFoto(src: string, nivel: 1 | 2 | 3): Promise<string> {
  if (!src.startsWith("data:image/")) return src;
  const { lado, qualidade } = NIVEIS_DE_FOTO[nivel - 1];
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    const escala = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.naturalWidth * escala));
    c.height = Math.max(1, Math.round(img.naturalHeight * escala));
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    const novo = c.toDataURL("image/jpeg", qualidade);
    c.width = 0;
    c.height = 0;
    return novo.length < src.length ? novo : src;
  } catch {
    return src;
  }
}

/** Reduz uma lista de fotos (as da presença que está sendo registrada, por exemplo). */
export function reencodarFotos(fotos: string[], nivel: 1 | 2 | 3) {
  return Promise.all(fotos.map((f) => reencodarFoto(f, nivel)));
}

/**
 * Libera espaço no aparelho reduzindo as fotos já guardadas (presenças e visitas). Nenhum registro
 * é apagado: só ficam com menos resolução. Chamada quando o armazenamento enche.
 */
export async function compactarFotosGuardadas(nivel: 1 | 2 | 3) {
  const d = retrato.dados;
  const presencas = await Promise.all(d.presencas.map(async (p) => ({ ...p, fotos: await reencodarFotos(p.fotos, nivel) })));
  const visitas = await Promise.all(d.visitas.map(async (v) => ({ ...v, fotos: await reencodarFotos(v.fotos, nivel) })));
  try {
    gravar({ ...retrato.dados, presencas, visitas });
    return true;
  } catch {
    return false;
  }
}

/**
 * Registra a presença e devolve o que ela destravou (conquistas, nível,
 * sticker de estádio), já gerando as notificações.
 */
export function registrarPresenca(entrada: EntradaPresenca, publicar: boolean) {
  const d = retrato.dados;
  const antes = estatisticas(d.presencas, new Date(), d.visitas);
  const chavesAntes = new Set([...d.presencas, ...d.visitas].map((p) => chaveDoEstadio(p.estadio)));
  const presenca: Presenca = {
    ...entrada,
    id: novoId(),
    numero: proximoNumero(d),
    criadaEm: new Date().toISOString(),
  };
  const presencas = [...d.presencas, presenca];
  const depois = estatisticas(presencas, new Date(), d.visitas);

  const jaTinha = new Set(desbloqueadas(antes));
  const conquistas = desbloqueadas(depois)
    .filter((id) => !jaTinha.has(id))
    .map((id) => conquistaPorId(id)!)
    .filter(Boolean);
  const nivel = depois.nivel && depois.nivel.nome !== antes.nivel?.nome ? depois.nivel : null;
  const estadioNovo = !chavesAntes.has(chaveDoEstadio(presenca.estadio));

  const agora = presenca.criadaEm;
  const avisos: Notificacao[] = [];
  if (d.config.notificacoes.conquistas) {
    if (estadioNovo)
      avisos.push({ id: novoId(), tipo: "estadio", titulo: "Sticker novo na coleção", texto: `${presenca.estadio.nome} entrou para o seu álbum.`, href: "/colecao?aba=estadios", criadaEm: agora, lida: false });
    if (nivel)
      avisos.push({ id: novoId(), tipo: "nivel", titulo: `Agora você é ${nivel.nome}`, texto: `Sua ${depois.total}ª presença mudou seu lugar na arquibancada.`, href: "/perfil", criadaEm: agora, lida: false });
    conquistas.forEach((c) =>
      avisos.push({ id: novoId(), tipo: "conquista", titulo: c.nome, texto: c.descricao, href: "/colecao?aba=conquistas", criadaEm: agora, lida: false }),
    );
  }

  try {
    gravar({
      ...d,
      presencas,
      publicadas: publicar ? [...d.publicadas, presenca.id] : d.publicadas,
      notificacoes: [...avisos, ...d.notificacoes],
    });
  } catch {
    // Sem espaço no aparelho (fotos grandes). Nada é gravado pela metade.
    throw new SemEspacoError("Sem espaço no aparelho para guardar essa presença.");
  }
  return { presenca, novidades: { conquistas, nivel, estadioNovo } satisfies Novidades };
}

/** Presenças e visitas dividem a mesma sequência de números. */
function proximoNumero(d: DadosDoTorcedor) {
  return Math.max(0, ...d.presencas.map((p) => p.numero), ...d.visitas.map((v) => v.numero)) + 1;
}

export type EntradaVisita = Omit<Visita, "id" | "numero" | "criadaEm">;

/** Registra uma visita sem jogo. Vale como estádio novo no álbum, mas não conta jogos nem resultados. */
export function registrarVisita(entrada: EntradaVisita, publicar: boolean) {
  const d = retrato.dados;
  const estadioNovo = ![...d.presencas, ...d.visitas].some((x) => chaveDoEstadio(x.estadio) === chaveDoEstadio(entrada.estadio));
  const visita: Visita = { ...entrada, id: novoId(), numero: proximoNumero(d), criadaEm: new Date().toISOString() };
  const avisos: Notificacao[] =
    estadioNovo && d.config.notificacoes.conquistas
      ? [{ id: novoId(), tipo: "estadio", titulo: "Sticker novo na coleção", texto: `${visita.estadio.nome} entrou para o seu álbum.`, href: "/colecao?aba=estadios", criadaEm: visita.criadaEm, lida: false }]
      : [];
  try {
    gravar({
      ...d,
      visitas: [...d.visitas, visita],
      publicadas: publicar ? [...d.publicadas, visita.id] : d.publicadas,
      notificacoes: [...avisos, ...d.notificacoes],
    });
  } catch {
    throw new SemEspacoError("Sem espaço no aparelho para guardar essa visita.");
  }
  return { visita, estadioNovo };
}

export function removerVisita(id: string) {
  mudar((d) => ({ ...d, visitas: d.visitas.filter((v) => v.id !== id), publicadas: d.publicadas.filter((x) => x !== id) }));
}

export function publicarPresenca(id: string) {
  mudar((d) => (d.publicadas.includes(id) ? d : { ...d, publicadas: [...d.publicadas, id] }));
}

export function despublicarPresenca(id: string) {
  mudar((d) => ({ ...d, publicadas: d.publicadas.filter((x) => x !== id) }));
}

export function removerPresenca(id: string) {
  mudar((d) => ({
    ...d,
    presencas: d.presencas.filter((p) => p.id !== id),
    publicadas: d.publicadas.filter((x) => x !== id),
  }));
}

// ---------------------------------------------------------------- Torcida

export function alternarSeguir(usuario: string) {
  mudar((d) => ({
    ...d,
    seguindo: d.seguindo.includes(usuario) ? d.seguindo.filter((u) => u !== usuario) : [...d.seguindo, usuario],
  }));
}

export function alternarCurtida(itemId: string) {
  mudar((d) => ({
    ...d,
    curtidas: d.curtidas.includes(itemId) ? d.curtidas.filter((c) => c !== itemId) : [...d.curtidas, itemId],
  }));
}

export function comentar(itemId: string, texto: string) {
  const limpo = texto.trim();
  if (!limpo) return;
  mudar((d) => {
    const novo: Comentario = { id: novoId(), autor: d.perfil.usuario || "voce", texto: limpo, criadoEm: new Date().toISOString() };
    return { ...d, comentarios: { ...d.comentarios, [itemId]: [...(d.comentarios[itemId] ?? []), novo] } };
  });
}

export function alternarFavorita(conquistaId: string) {
  mudar((d) => ({
    ...d,
    favoritas: d.favoritas.includes(conquistaId)
      ? d.favoritas.filter((f) => f !== conquistaId)
      : [...d.favoritas, conquistaId].slice(-3),
  }));
}

export function marcarNotificacoesLidas() {
  mudar((d) => ({ ...d, notificacoes: d.notificacoes.map((n) => ({ ...n, lida: true })) }));
}

export function apagarTudo() {
  localStorage.removeItem(CHAVE);
  retrato = { status: "pronto", dados: vazio() };
  emitir();
}

// ---------------------------------------------------------------- Feed

/** Quando cada conquista de alguém destravou, refazendo a história em ordem. */
function marcosDeConquista(presencas: Presenca[]) {
  const ordem = [...presencas].sort((a, b) => a.partida.data.localeCompare(b.partida.data));
  const marcos: { conquistaId: string; data: string; presencaId: string }[] = [];
  const tinha = new Set<string>();
  ordem.forEach((_, i) => {
    const agora = desbloqueadas(estatisticas(ordem.slice(0, i + 1)));
    agora.filter((id) => !tinha.has(id)).forEach((id) => {
      tinha.add(id);
      marcos.push({ conquistaId: id, data: ordem[i].partida.data, presencaId: ordem[i].id });
    });
  });
  return marcos;
}

export const EU = "eu";

/** Feed: presenças e conquistas de quem você acompanha + o que você publicou. */
export function montarFeed(d: DadosDoTorcedor): ItemDoFeed[] {
  const itens: ItemDoFeed[] = [];
  TORCEDORES_DEMONSTRACAO.filter((t) => d.seguindo.includes(t.usuario)).forEach((t) => {
    t.presencas.forEach((p) =>
      itens.push({ tipo: "presenca", id: p.id, data: p.partida.data, autor: t.usuario, presenca: p, curtidasBase: CURTIDAS_DEMONSTRACAO[p.id] ?? 0 }),
    );
    marcosDeConquista(t.presencas)
      .filter((m) => m.conquistaId !== "estava-la")
      .forEach((m) =>
        itens.push({ tipo: "conquista", id: `${t.usuario}:${m.conquistaId}`, data: m.data, autor: t.usuario, conquistaId: m.conquistaId, curtidasBase: 0 }),
      );
  });
  d.presencas
    .filter((p) => d.config.perfilPublico && d.publicadas.includes(p.id))
    .forEach((p) => itens.push({ tipo: "presenca", id: p.id, data: p.partida.data, autor: EU, presenca: p, curtidasBase: 0 }));
  d.visitas
    .filter((v) => d.config.perfilPublico && d.publicadas.includes(v.id))
    .forEach((v) => itens.push({ tipo: "visita", id: v.id, data: v.data, autor: EU, visita: v, curtidasBase: 0 }));
  return itens.sort((a, b) => b.data.localeCompare(a.data) || (a.tipo === "conquista" ? 1 : -1));
}

// ---------------------------------------------------------------- Leituras prontas

export function resumoDoTorcedor(d: DadosDoTorcedor) {
  const est = estatisticas(d.presencas, new Date(), d.visitas);
  return {
    est,
    conquistas: statusDasConquistas(est),
    recentes: ordenarPorData(d.presencas),
    visitas: d.visitas,
    naoLidas: d.notificacoes.filter((n) => !n.lida).length,
  };
}

export { nivelAtual };

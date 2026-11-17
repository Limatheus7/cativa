"use client";

import { numeroPresenca } from "@/lib/dados/formato";
import { pngDoModelo } from "./useImagem";
import { numeroDe, type DadosCompartilhar, type Formato } from "./tipos";

export type ResultadoCompartilhar =
  | { resultado: "compartilhado" | "baixado" | "cancelado" }
  /** iPhone sem folha de compartilhar: mostra a imagem para segurar o dedo e salvar nas Fotos. */
  | { resultado: "mostrar"; url: string };

export function ehIOS() {
  const ua = navigator.userAgent;
  return /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function baixar(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const nomeDoArquivo = (d: DadosCompartilhar) => `cativa-presenca-${numeroPresenca(numeroDe(d)).replace(/D/g, "")}.png`;

/** Abre a folha de compartilhar do sistema. Devolve null se o aparelho não compartilha arquivos. */
async function folha(arquivo: File): Promise<ResultadoCompartilhar | null> {
  if (!navigator.canShare?.({ files: [arquivo] })) return null;
  try {
    await navigator.share({ files: [arquivo] });
    return { resultado: "compartilhado" };
  } catch (e) {
    // Fechar a folha de compartilhamento não é erro.
    if (e instanceof DOMException && e.name === "AbortError") return { resultado: "cancelado" };
    throw e;
  }
}

/**
 * Sem folha de compartilhar: no iPhone um arquivo baixado vai para o app Arquivos, não para as Fotos.
 * Por isso lá mostramos a imagem para segurar e salvar. Nos demais aparelhos, baixa o arquivo.
 */
function entregar(blob: Blob, nome: string): ResultadoCompartilhar {
  if (ehIOS()) return { resultado: "mostrar", url: URL.createObjectURL(blob) };
  baixar(blob, nome);
  return { resultado: "baixado" };
}

/** Abre a folha de compartilhar do sistema (Stories, Feed…). */
export async function compartilharImagem(d: DadosCompartilhar, modelo: string, formato: Formato): Promise<ResultadoCompartilhar> {
  const blob = await pngDoModelo(d, modelo, formato, 1, 3);
  const nome = nomeDoArquivo(d);
  return (await folha(new File([blob], nome, { type: "image/png" }))) ?? entregar(blob, nome);
}

/**
 * Salvar a imagem. No iPhone, a folha de compartilhar tem "Salvar imagem", que vai para as Fotos
 * (um download iria para o app Arquivos). Nos demais aparelhos, baixa o arquivo.
 */
export async function salvarImagem(d: DadosCompartilhar, modelo: string, formato: Formato): Promise<ResultadoCompartilhar> {
  const blob = await pngDoModelo(d, modelo, formato, 1, 3);
  const nome = nomeDoArquivo(d);
  if (ehIOS()) return (await folha(new File([blob], nome, { type: "image/png" }))) ?? entregar(blob, nome);
  baixar(blob, nome);
  return { resultado: "baixado" };
}

/**
 * Abre a câmera de Stories do Instagram (iPhone e Android). Um site não consegue mandar a imagem
 * para dentro do Story (isso só existe para apps nativos): a imagem salva aparece como a primeira
 * da galeria do Stories. Devolve false se o Instagram não abriu (app não instalado, por exemplo).
 */
export function abrirStoriesDoInstagram(): Promise<boolean> {
  return new Promise((ok) => {
    let saiu = false;
    const aoMudar = () => {
      if (document.hidden) saiu = true;
    };
    document.addEventListener("visibilitychange", aoMudar);
    window.location.href = "instagram://story-camera";
    setTimeout(() => {
      document.removeEventListener("visibilitychange", aoMudar);
      ok(saiu);
    }, 1800);
  });
}

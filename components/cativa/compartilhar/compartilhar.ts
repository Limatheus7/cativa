"use client";

import { numeroPresenca } from "@/lib/dados/formato";
import { pngDoModelo } from "./useImagem";
import { numeroDe, type DadosCompartilhar, type Formato } from "./tipos";

export type ResultadoCompartilhar = "compartilhado" | "baixado" | "cancelado";

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

const nomeDoArquivo = (d: DadosCompartilhar) => `cativa-presenca-${numeroPresenca(numeroDe(d)).replace(/\D/g, "")}.png`;

/** Abre a folha de compartilhar do sistema (Stories, Feed…). Sem suporte a arquivo, baixa a imagem. */
export async function compartilharImagem(d: DadosCompartilhar, modelo: string, formato: Formato): Promise<ResultadoCompartilhar> {
  const blob = await pngDoModelo(d, modelo, formato, 1);
  const nome = nomeDoArquivo(d);
  const arquivo = new File([blob], nome, { type: "image/png" });
  if (navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo] });
      return "compartilhado";
    } catch (e) {
      // Fechar a folha de compartilhamento não é erro.
      if (e instanceof DOMException && e.name === "AbortError") return "cancelado";
      throw e;
    }
  }
  baixar(blob, nome);
  return "baixado";
}

/** Sempre baixa o arquivo, sem abrir a folha de compartilhamento. */
export async function salvarImagem(d: DadosCompartilhar, modelo: string, formato: Formato) {
  baixar(await pngDoModelo(d, modelo, formato, 1), nomeDoArquivo(d));
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

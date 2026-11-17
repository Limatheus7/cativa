"use client";

import { useEffect, useState } from "react";
import { gerarPng } from "./gerar";
import { emCinza, suavizar } from "./suavizar";
import { elementoDoModelo } from "./Modelos";
import { OPCOES_PADRAO, TAMANHO, idDe, type DadosCompartilhar, type Formato } from "./tipos";

// Guarda em memória por presença, modelo e tamanho: não gera de novo ao voltar para a tela.
const cache = new Map<string, Promise<Blob>>();
const urls = new Map<string, string>();

const resumoFotos = (fotos: string[]) => fotos.map((f) => f.length + f.slice(-14)).join(",");

function chave(d: DadosCompartilhar, modelo: string, escala: number) {
  const o = d.opcoes ?? OPCOES_PADRAO;
  const base = d.tipo === "jogo"
    ? `${resumoFotos(d.presenca.fotos)}|${d.presenca.frase}|${d.presenca.partida.golsTime}-${d.presenca.partida.golsAdversario}|${d.presenca.lugar?.setor ?? ""}|${d.nEstadio}`
    : `${resumoFotos(d.visita.fotos)}|${d.visita.frase}|${d.nEstadios}`;
  return `${idDe(d)}|${modelo}|${escala}|${JSON.stringify(o)}|${base}`;
}

/**
 * Prepara as fotos que os filtros do CSS não conseguem tratar na captura: o fundo suave do Canhoto
 * e a foto em preto e branco do Jornal. Usado na geração do PNG e na edição ao vivo.
 */
export async function preparar(d: DadosCompartilhar, modelo: string): Promise<DadosCompartilhar> {
  if (d.tipo !== "jogo" || !d.presenca.fotos[0]) return d;
  try {
    if (modelo === "canhoto") return { ...d, fundoSuave: await suavizar(d.presenca.fotos[0], 1120, 1380) };
    if (modelo === "jornal") return { ...d, fotoCinza: await emCinza(d.presenca.fotos[0], 936, 720) };
  } catch {
    // sem o tratamento, o modelo usa a foto original
  }
  return d;
}

/** PNG do modelo. `escala` 1 = 1080 de largura; use menos para miniaturas. */
export function pngDoModelo(d: DadosCompartilhar, modelo: string, formato: Formato, escala = 1) {
  const k = chave(d, modelo, escala);
  let p = cache.get(k);
  if (!p) {
    p = preparar(d, modelo).then((dados) => gerarPng(elementoDoModelo(modelo, dados), formato, escala));
    p.catch(() => cache.delete(k));
    cache.set(k, p);
  }
  return p;
}

/** URL da imagem (para <img>), ou null enquanto gera. `erro` vira true se a geração falhar. */
export function useImagem(d: DadosCompartilhar, modelo: string | null, formato: Formato, escala: number, tentativa = 0) {
  const [estado, setEstado] = useState<{ url: string | null; erro: boolean }>({ url: null, erro: false });
  const k = modelo ? chave(d, modelo, escala) : "";

  useEffect(() => {
    if (!modelo) return;
    const pronta = urls.get(k);
    if (pronta) {
      setEstado({ url: pronta, erro: false });
      return;
    }
    let vivo = true;
    setEstado({ url: null, erro: false });
    pngDoModelo(d, modelo, formato, escala).then(
      (blob) => {
        const url = URL.createObjectURL(blob);
        urls.set(k, url);
        if (vivo) setEstado({ url, erro: false });
      },
      () => vivo && setEstado({ url: null, erro: true }),
    );
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, tentativa]);

  return estado;
}

export const escalaMiniatura = (formato: Formato, largura: number) => largura / TAMANHO[formato].w;

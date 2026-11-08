"use client";

// Modo claro/escuro. A escolha fica no aparelho; sem escolha, segue o celular.
// O atributo data-tema no <html> é aplicado antes da página aparecer (script no layout).

import { useSyncExternalStore } from "react";
import { CHAVE_TEMA as CHAVE } from "./tema-script";

export type Tema = "claro" | "escuro";

const EVENTO = "cativa:tema";

function ler(): Tema {
  return document.documentElement.dataset.tema === "escuro" ? "escuro" : "claro";
}

function inscrever(aviso: () => void) {
  window.addEventListener(EVENTO, aviso);
  return () => window.removeEventListener(EVENTO, aviso);
}

export function useTema(): Tema {
  return useSyncExternalStore(inscrever, ler, () => "claro");
}

export function definirTema(tema: Tema) {
  document.documentElement.dataset.tema = tema;
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {}
  window.dispatchEvent(new Event(EVENTO));
}

export function alternarTema() {
  definirTema(ler() === "escuro" ? "claro" : "escuro");
}

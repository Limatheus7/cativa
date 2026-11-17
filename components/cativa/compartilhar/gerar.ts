"use client";

import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { toBlob } from "html-to-image";
import { TAMANHO, type Formato } from "./tipos";

// Uma captura por vez: cada uma monta o modelo fora da tela, espera fontes e fotos e tira o PNG.
let fila: Promise<unknown> = Promise.resolve();

const quadro = () => new Promise<void>((ok) => requestAnimationFrame(() => requestAnimationFrame(() => ok())));

async function prontas(el: HTMLElement) {
  await document.fonts?.ready;
  await Promise.all(
    [...el.querySelectorAll("img")].map((i) => (i.complete && i.naturalWidth ? Promise.resolve() : i.decode().catch(() => undefined))),
  );
  await quadro();
  await new Promise((r) => setTimeout(r, 60));
}

/** Gera o PNG do modelo. `escala` 1 = tamanho cheio (1080 de largura); menor serve para miniaturas. */
export function gerarPng(elemento: React.ReactElement, formato: Formato, escala = 1): Promise<Blob> {
  const tarefa = fila.then(async () => {
    const { w, h } = TAMANHO[formato];
    const palco = document.createElement("div");
    palco.setAttribute("aria-hidden", "true");
    palco.style.cssText = `position:fixed;left:-99999px;top:0;width:${w}px;height:${h}px;pointer-events:none;`;
    document.body.appendChild(palco);
    const raiz = createRoot(palco);
    try {
      flushSync(() => raiz.render(elemento));
      await prontas(palco);
      const alvo = palco.firstElementChild as HTMLElement;
      const blob = await toBlob(alvo, { width: w, height: h, pixelRatio: escala, cacheBust: true });
      if (!blob) throw new Error("sem imagem");
      return blob;
    } finally {
      raiz.unmount();
      palco.remove();
    }
  });
  fila = tarefa.catch(() => undefined);
  return tarefa;
}

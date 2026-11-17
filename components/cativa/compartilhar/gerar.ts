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

/**
 * iPhone (qualquer navegador) e Safari usam WebKit, que não desenha as imagens incorporadas
 * na primeira captura: o PNG sai sem as fotos. A solução usual é capturar antes, para aquecer.
 */
function ehWebKit() {
  const ua = navigator.userAgent;
  const ios = /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const safari = /safari/i.test(ua) && !/chrome|chromium|crios|fxios|android/i.test(ua);
  return ios || safari;
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
      const opcoes = { width: w, height: h, cacheBust: true };
      if (ehWebKit()) {
        // Duas capturas pequenas e descartadas: depois delas o WebKit já carregou as fotos.
        for (let i = 0; i < 2; i++) {
          await toBlob(alvo, { ...opcoes, pixelRatio: 0.1 }).catch(() => null);
          await quadro();
        }
      }
      const blob = await toBlob(alvo, { ...opcoes, pixelRatio: escala });
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

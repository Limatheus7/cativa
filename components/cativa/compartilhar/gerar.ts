"use client";

import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { toCanvas } from "html-to-image";
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
export function ehWebKit() {
  const ua = navigator.userAgent;
  const ios = /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const safari = /safari/i.test(ua) && !/chrome|chromium|crios|fxios|android/i.test(ua);
  return ios || safari;
}

// ---------------------------------------------------------------- Fotos menores

/**
 * Reduz cada foto (JPEG em base64) ao tamanho com que ela aparece na imagem, vezes `fator`.
 * No iPhone as imagens grandes embutidas na captura simplesmente não são desenhadas: o PNG sai com
 * as molduras vazias. Fotos menores passam. Parte sempre da foto original (guardada em data-orig).
 */
async function reduzirFotos(raiz: HTMLElement, fator: number) {
  const imgs = [...raiz.querySelectorAll<HTMLImageElement>("img")];
  for (const img of imgs) {
    const original = img.dataset.orig ?? img.src;
    if (!original.startsWith("data:image/") || original.startsWith("data:image/svg")) continue;
    img.dataset.orig = original;
    const rw = img.offsetWidth || img.getBoundingClientRect().width;
    const rh = img.offsetHeight || img.getBoundingClientRect().height;
    if (!rw || !rh) continue;
    try {
      const base = new Image();
      base.src = original;
      await base.decode();
      // Escala para a foto cobrir a área onde aparece (object-fit: cover), nunca ampliando.
      const s = Math.min(1, Math.max(rw / base.naturalWidth, rh / base.naturalHeight) * fator);
      if (s >= 0.999) {
        if (img.src !== original) img.src = original;
        continue;
      }
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(base.naturalWidth * s));
      c.height = Math.max(1, Math.round(base.naturalHeight * s));
      const ctx = c.getContext("2d");
      if (!ctx) continue;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(base, 0, 0, c.width, c.height);
      img.src = c.toDataURL("image/jpeg", 0.75);
      await img.decode().catch(() => undefined);
      c.width = 0;
      c.height = 0;
    } catch {
      // mantém a foto como está
    }
  }
  await quadro();
}

// ---------------------------------------------------------------- Verificação do resultado

type Rgba = [number, number, number, number];

function amostrar(canvas: HTMLCanvasElement, x: number, y: number): Rgba | null {
  try {
    const d = canvas.getContext("2d")!.getImageData(Math.max(0, Math.min(canvas.width - 1, Math.round(x))), Math.max(0, Math.min(canvas.height - 1, Math.round(y))), 1, 1).data;
    return [d[0], d[1], d[2], d[3]];
  } catch {
    return null; // canvas protegido: não dá para verificar
  }
}

const perto = (a: Rgba, b: Rgba, tol: number) => Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol && Math.abs(a[3] - b[3]) <= tol;

/** A maioria dos pontos tem praticamente a mesma cor (imagem em branco ou moldura sem foto). */
function uniforme(pts: Rgba[], tol: number) {
  if (pts.length < 4) return false;
  const mediana = (i: number) => [...pts].map((p) => p[i]).sort((a, b) => a - b)[Math.floor(pts.length / 2)];
  const ref: Rgba = [mediana(0), mediana(1), mediana(2), mediana(3)];
  return pts.filter((p) => perto(p, ref, tol)).length / pts.length >= 0.8;
}

/** A imagem inteira saiu vazia? */
function emBranco(canvas: HTMLCanvasElement) {
  const pts: Rgba[] = [];
  for (let i = 1; i <= 12; i++) for (let j = 1; j <= 20; j++) {
    const p = amostrar(canvas, (canvas.width * i) / 13, (canvas.height * j) / 21);
    if (!p) return false;
    pts.push(p);
  }
  return pts.every((p) => p[3] === 0) || uniforme(pts, 3);
}

/** Alguma área de foto saiu lisa, sem a foto? Usa a posição real de cada foto no modelo. */
function fotosAusentes(canvas: HTMLCanvasElement, alvo: HTMLElement) {
  const ar = alvo.getBoundingClientRect();
  const k = canvas.width / ar.width;
  for (const el of alvo.querySelectorAll<HTMLElement>("[data-foto]")) {
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) continue;
    const pts: Rgba[] = [];
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
      const x = (r.left - ar.left + r.width * (0.2 + 0.15 * i)) * k;
      const y = (r.top - ar.top + r.height * (0.2 + 0.15 * j)) * k;
      const p = amostrar(canvas, x, y);
      if (!p) return false;
      pts.push(p);
    }
    if (uniforme(pts, 10)) return true;
  }
  return false;
}

// ---------------------------------------------------------------- Captura

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

      // Capturas pequenas e descartadas antes da definitiva: a primeira captura pode sair sem as
      // imagens incorporadas (sempre no WebKit, e em celulares mais lentos). No WebKit são duas.
      for (let i = 0; i < (ehWebKit() ? 2 : 1); i++) {
        const c = await toCanvas(alvo, { ...opcoes, pixelRatio: 0.1 }).catch(() => null);
        if (c) {
          c.width = 0;
          c.height = 0;
        }
        await quadro();
      }

      // Tentativas: fotos até 1,5× o tamanho em que aparecem; se não aparecerem (iPhone), cada vez menores.
      const fatores = [1.5, 1, 0.6, 0.35];
      let ultimo: Blob | null = null;
      for (let t = 0; t < fatores.length; t++) {
        await reduzirFotos(alvo, fatores[t]);
        const canvas = await toCanvas(alvo, { ...opcoes, pixelRatio: escala });
        const ruim = emBranco(canvas) || fotosAusentes(canvas, alvo);
        const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/png"));
        canvas.width = 0; // libera a memória do canvas (o iOS é rígido com isso)
        canvas.height = 0;
        if (blob) ultimo = blob;
        if (!ruim && blob) return blob;
        await new Promise((r) => setTimeout(r, 250));
      }
      if (!ultimo) throw new Error("sem imagem");
      return ultimo;
    } finally {
      raiz.unmount();
      palco.remove();
    }
  });
  fila = tarefa.catch(() => undefined);
  return tarefa;
}

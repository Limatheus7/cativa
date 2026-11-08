"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import s from "./RecorteFoto.module.css";

const VISOR = 280; // lado do quadrado de enquadramento (px)
const SAIDA = 480; // lado da foto final salva (px)
const ZOOM_MAX = 4;

type Props = {
  /** Imagem a enquadrar (data URL ou URL). */
  src: string;
  onCancelar: () => void;
  /** Recebe a foto final, quadrada, já recortada. */
  onSalvar: (fotoQuadrada: string) => void;
};

/**
 * Enquadrar foto de perfil: arrastar para reposicionar, zoom pelo controle,
 * pela roda do mouse ou com dois dedos. O círculo mostra o que vai aparecer.
 */
export default function RecorteFoto({ src, onCancelar, onSalvar }: Props) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ponteiros = useRef(new Map<number, { x: number; y: number }>());
  const pinca = useRef<{ dist: number; zoom: number } | null>(null);

  useEffect(() => {
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = src;
  }, [src]);

  useEffect(() => {
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && onCancelar();
    window.addEventListener("keydown", fechar);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fechar);
      document.body.style.overflow = antes;
    };
  }, [onCancelar]);

  // Escala base: a foto cobre o quadrado inteiro com zoom 1.
  const base = img ? VISOR / Math.min(img.width, img.height) : 1;
  const largura = img ? img.width * base * zoom : VISOR;
  const altura = img ? img.height * base * zoom : VISOR;

  /** Mantém a foto cobrindo o quadrado: nunca aparece borda vazia. */
  function limitar(p: { x: number; y: number }, l = largura, a = altura) {
    const mx = Math.max(0, (l - VISOR) / 2);
    const my = Math.max(0, (a - VISOR) / 2);
    return { x: Math.min(mx, Math.max(-mx, p.x)), y: Math.min(my, Math.max(-my, p.y)) };
  }

  function mudarZoom(novo: number) {
    const z = Math.min(ZOOM_MAX, Math.max(1, novo));
    if (!img) return setZoom(z);
    const l = img.width * base * z;
    const a = img.height * base * z;
    // Zoom em torno do centro do círculo.
    setPos((p) => limitar({ x: (p.x * z) / zoom, y: (p.y * z) / zoom }, l, a));
    setZoom(z);
  }

  function aoPressionar(e: React.PointerEvent) {
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {}
    ponteiros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ponteiros.current.size === 2) {
      const [a, b] = [...ponteiros.current.values()];
      pinca.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
  }

  function aoMover(e: React.PointerEvent) {
    const antes = ponteiros.current.get(e.pointerId);
    if (!antes) return;
    ponteiros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ponteiros.current.size >= 2 && pinca.current) {
      const [a, b] = [...ponteiros.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      mudarZoom((pinca.current.zoom * dist) / pinca.current.dist);
    } else if (ponteiros.current.size === 1) {
      setPos((p) => limitar({ x: p.x + e.clientX - antes.x, y: p.y + e.clientY - antes.y }));
    }
  }

  function aoSoltar(e: React.PointerEvent) {
    ponteiros.current.delete(e.pointerId);
    if (ponteiros.current.size < 2) pinca.current = null;
  }

  function salvar() {
    if (!img) return;
    const escala = base * zoom;
    const lado = VISOR / escala;
    const sx = (largura / 2 - VISOR / 2 - pos.x) / escala;
    const sy = (altura / 2 - VISOR / 2 - pos.y) / escala;
    const canvas = document.createElement("canvas");
    canvas.width = SAIDA;
    canvas.height = SAIDA;
    const g = canvas.getContext("2d")!;
    g.imageSmoothingQuality = "high";
    g.drawImage(img, sx, sy, lado, lado, 0, 0, SAIDA, SAIDA);
    onSalvar(canvas.toDataURL("image/jpeg", 0.86));
  }

  return createPortal(
    <div className={s.fundo} role="dialog" aria-modal="true" aria-label="Enquadrar foto de perfil">
      <div className={s.painel}>
        <p className={s.titulo}>Enquadre sua foto</p>
        <p className={s.dica}>Arraste para posicionar. Use o controle ou dois dedos para dar zoom.</p>

        <div
          className={s.visor}
          style={{ width: VISOR, height: VISOR }}
          onPointerDown={aoPressionar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
          onWheel={(e) => mudarZoom(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08))}
        >
          {img && (
            <img
              src={src}
              alt=""
              draggable={false}
              className={s.imagem}
              style={{
                width: largura,
                height: altura,
                left: VISOR / 2 - largura / 2 + pos.x,
                top: VISOR / 2 - altura / 2 + pos.y,
              }}
            />
          )}
          <span className={s.mascara} aria-hidden="true" />
        </div>

        <label className={s.zoom}>
          <span aria-hidden="true">−</span>
          <input
            type="range"
            min={1}
            max={ZOOM_MAX}
            step={0.01}
            value={zoom}
            onChange={(e) => mudarZoom(Number(e.target.value))}
            aria-label="Zoom"
          />
          <span aria-hidden="true">+</span>
        </label>

        <div className={s.acoes}>
          <button type="button" className={s.cancelar} onClick={onCancelar}>
            Cancelar
          </button>
          <button type="button" className={s.salvar} onClick={salvar} disabled={!img}>
            Usar foto
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

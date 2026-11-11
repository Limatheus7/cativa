"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconeFechar, IconeVoltar } from "./Icones";
import v from "./VisualizadorFotos.module.css";

/** Foto em tela cheia, com setas, deslizar e Esc para fechar. */
export function VisualizadorFotos({ fotos, inicio, onFechar }: { fotos: string[]; inicio: number; onFechar: () => void }) {
  const [atual, setAtual] = useState(inicio);
  const toqueX = useRef<number | null>(null);
  const total = fotos.length;

  const ir = useCallback((passo: number) => setAtual((i) => Math.min(total - 1, Math.max(0, i + passo))), [total]);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
      if (e.key === "ArrowLeft") ir(-1);
      if (e.key === "ArrowRight") ir(1);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoTeclar);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflow;
    };
  }, [ir, onFechar]);

  return createPortal(
    <div
      className={v.fundo}
      role="dialog"
      aria-modal="true"
      aria-label="Foto do jogo"
      onClick={onFechar}
      onTouchStart={(e) => (toqueX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (toqueX.current === null) return;
        const dx = e.changedTouches[0].clientX - toqueX.current;
        toqueX.current = null;
        if (Math.abs(dx) > 50) ir(dx < 0 ? 1 : -1);
      }}
    >
      <button type="button" className={v.fechar} onClick={onFechar} aria-label="Fechar foto">
        <IconeFechar tamanho={22} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={v.foto} src={fotos[atual]} alt={`Foto ${atual + 1} de ${total}`} onClick={(e) => e.stopPropagation()} />
      {total > 1 && (
        <>
          <button
            type="button"
            className={`${v.seta} ${v.anterior}`}
            onClick={(e) => {
              e.stopPropagation();
              ir(-1);
            }}
            disabled={atual === 0}
            aria-label="Foto anterior"
          >
            <IconeVoltar tamanho={22} />
          </button>
          <button
            type="button"
            className={`${v.seta} ${v.proxima}`}
            onClick={(e) => {
              e.stopPropagation();
              ir(1);
            }}
            disabled={atual === total - 1}
            aria-label="Próxima foto"
          >
            <IconeVoltar tamanho={22} />
          </button>
          <span className={v.contador}>
            {atual + 1} / {total}
          </span>
        </>
      )}
    </div>,
    document.body,
  );
}

/** Grade de fotos que abre o visualizador ao tocar. `limite` mostra só as primeiras na grade. */
export function FotosExpansiveis({ fotos, className, limite, dataQtd }: { fotos: string[]; className: string; limite?: number; dataQtd?: number }) {
  const [aberta, setAberta] = useState<number | null>(null);
  const fechar = useCallback(() => setAberta(null), []);
  const visiveis = limite ? fotos.slice(0, limite) : fotos;

  return (
    <>
      <div className={className} data-qtd={dataQtd}>
        {visiveis.map((f, i) => (
          <button key={i} type="button" className={v.miniatura} onClick={() => setAberta(i)} aria-label={`Ampliar foto ${i + 1} do jogo`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f} alt={`Foto ${i + 1} do jogo`} />
          </button>
        ))}
      </div>
      {aberta !== null && <VisualizadorFotos fotos={fotos} inicio={aberta} onFechar={fechar} />}
    </>
  );
}

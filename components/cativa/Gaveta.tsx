"use client";

import { useEffect, useId, useRef, useState } from "react";
import { IconeFechar } from "./Icones";
import g from "./Gaveta.module.css";

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Props = {
  aberta: boolean;
  /** Pede para fechar (véu, Esc, arrastar, botão). Quem usa decide se confirma antes. */
  onFechar: () => void;
  /** Elemento que recebe o foco de volta ao fechar. */
  origem?: React.RefObject<HTMLElement | null>;
  titulo: string;
  sobretitulo?: string;
  /** Área fixa abaixo do cabeçalho (ingresso vivo e régua). Não rola. */
  fixo?: React.ReactNode;
  /** Rodapé fixo (botão principal). */
  rodape?: React.ReactNode;
  children: React.ReactNode;
  /** Ref do contêiner que rola (para voltar ao topo ao trocar de etapa). */
  rolagemRef?: React.RefObject<HTMLDivElement | null>;
};

/**
 * Gaveta (bottom sheet) genérica: presa à base, véu, arrastar para fechar,
 * foco preso, Esc e trava de rolagem do fundo.
 */
export default function Gaveta({ aberta, onFechar, origem, titulo, sobretitulo, fixo, rodape, children, rolagemRef }: Props) {
  const idTitulo = useId();
  const folha = useRef<HTMLDivElement>(null);
  const veu = useRef<HTMLDivElement>(null);
  const [montada, setMontada] = useState(aberta);
  const [visivel, setVisivel] = useState(false);
  const arraste = useRef<{ y0: number; t0: number; dy: number; ativo: boolean } | null>(null);

  // Entrada e saída: monta, espera um quadro para a transição rodar, e desmonta depois da saída.
  useEffect(() => {
    if (aberta) {
      setMontada(true);
      const a = requestAnimationFrame(() => requestAnimationFrame(() => setVisivel(true)));
      return () => cancelAnimationFrame(a);
    }
    setVisivel(false);
    const t = setTimeout(() => setMontada(false), 380);
    return () => clearTimeout(t);
  }, [aberta]);

  // Tela de trás encolhe (efeito iOS) e o fundo não rola.
  useEffect(() => {
    if (!visivel) return;
    const html = document.documentElement;
    html.setAttribute("data-gaveta", "aberta");
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      html.removeAttribute("data-gaveta");
      document.body.style.overflow = antes;
    };
  }, [visivel]);

  // Foco: entra na gaveta e volta ao botão de origem.
  useEffect(() => {
    if (!visivel) return;
    const el = origem?.current ?? (document.activeElement as HTMLElement | null);
    folha.current?.focus({ preventScroll: true });
    return () => {
      el?.focus?.({ preventScroll: true });
    };
  }, [visivel, origem]);

  function aoTeclar(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onFechar();
      return;
    }
    if (e.key !== "Tab" || !folha.current) return;
    const itens = [...folha.current.querySelectorAll<HTMLElement>(FOCAVEIS)].filter((i) => i.offsetParent !== null);
    if (!itens.length) return;
    const primeiro = itens[0];
    const ultimo = itens[itens.length - 1];
    if (e.shiftKey && (document.activeElement === primeiro || document.activeElement === folha.current)) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  }

  // Arrastar pela alça e pelo cabeçalho.
  function aoComecar(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return;
    arraste.current = { y0: e.clientY, t0: e.timeStamp, dy: 0, ativo: true };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    folha.current?.setAttribute("data-arrastando", "");
  }
  function aoMover(e: React.PointerEvent) {
    const a = arraste.current;
    if (!a?.ativo || !folha.current) return;
    const bruto = e.clientY - a.y0;
    a.dy = bruto < 0 ? bruto / 4 : bruto;
    folha.current.style.transform = `translateY(${a.dy}px)`;
    if (veu.current) veu.current.style.opacity = String(Math.max(0, 1 - Math.max(0, a.dy) / folha.current.offsetHeight));
  }
  function aoSoltar(e: React.PointerEvent) {
    const a = arraste.current;
    arraste.current = null;
    if (!a?.ativo || !folha.current) return;
    folha.current.removeAttribute("data-arrastando");
    const altura = folha.current.offsetHeight;
    const velocidade = a.dy / Math.max(1, e.timeStamp - a.t0);
    folha.current.style.transform = "";
    if (veu.current) veu.current.style.opacity = "";
    if (a.dy > altura * 0.3 || velocidade > 0.5) onFechar();
  }

  if (!montada) return null;

  return (
    <div className={g.raiz} data-visivel={visivel ? "" : undefined}>
      <div ref={veu} className={g.veu} onClick={onFechar} aria-hidden="true" />
      <div
        ref={folha}
        className={g.folha}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        onKeyDown={aoTeclar}
      >
        <div className={g.arrastavel} onPointerDown={aoComecar} onPointerMove={aoMover} onPointerUp={aoSoltar} onPointerCancel={aoSoltar}>
          <span className={g.alca} aria-hidden="true" />
          <header className={g.cabecalho}>
            <div>
              {sobretitulo && <span className={g.olho}>{sobretitulo}</span>}
              <h2 id={idTitulo}>{titulo}</h2>
            </div>
            <button type="button" className={g.fechar} onClick={onFechar} aria-label="Fechar">
              <IconeFechar tamanho={16} />
            </button>
          </header>
        </div>
        {fixo && <div className={g.fixo}>{fixo}</div>}
        <div ref={rolagemRef} className={g.corpo}>
          {children}
        </div>
        {rodape && <footer className={g.rodape}>{rodape}</footer>}
      </div>
    </div>
  );
}

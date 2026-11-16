"use client";

import Link from "next/link";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { formatarData } from "@/lib/dados/formato";
import { ALTURA_INGRESSO, LARGURA_INGRESSO } from "@/lib/dados/ingressos";
import type { Visita } from "@/lib/dados/tipos";
import s from "./Ticket.module.css";

const CORPO = "#F4EBD9";
const VERDE = "#1F4D3A";
const OURO = "#A9751A";

/** Prévia do registro: o que ainda não foi escolhido aparece em aberto. */
export type PreviaDaVisita = { semEstadio?: boolean };

type Dados = Pick<Visita, "numero" | "data" | "estadio" | "motivo">;

/** "2026-11-15" → "15·11·26" para o carimbo. */
function dataDoCarimbo(iso: string) {
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}·${m}·${a.slice(2)}`;
}

/**
 * Ingresso de visita ao estádio (sem jogo): mesmo tamanho do ingresso de presença
 * (748 × 276), em papel claro, com carimbo no lugar do placar e "sem jogo" no lugar do resultado.
 */
export default function TicketVisita({ visita: v, href, previa }: { visita: Dados; href?: string; previa?: PreviaDaVisita }) {
  const caixa = useRef<HTMLElement>(null);
  const [escala, setEscala] = useState(0);
  const idArco = useId();

  useLayoutEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const medir = () => setEscala(el.clientWidth / LARGURA_INGRESSO);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const nomeEstadio = previa?.semEstadio || !v.estadio.nome ? "Estádio" : v.estadio.nome;
  const local = v.estadio.nome ? `${v.estadio.cidade} · ${v.estadio.uf}` : "próxima etapa";
  const tipo = v.motivo ?? "Visita";
  const rotulo = `Ingresso de visita: ${nomeEstadio}, ${formatarData(v.data)}, sem jogo. Visita Nº ${v.numero}.`;
  const estilo = { aspectRatio: `${LARGURA_INGRESSO} / ${ALTURA_INGRESSO}` };

  const ingresso = (
    <div className={s.ingresso} style={{ transform: `scale(${escala})`, visibility: escala ? "visible" : "hidden" }} aria-hidden={!!href}>
      <svg className={s.camada} viewBox="0 0 748 276" width="748" height="276" aria-hidden="true">
        <path d="M24 0 H596 V276 H24 A24 24 0 0 1 0 252 V24 A24 24 0 0 1 24 0 Z" fill={CORPO} />
        <path d="M596 0 H724 A24 24 0 0 1 748 24 V252 A24 24 0 0 1 724 276 H596 Z" fill={VERDE} />
        <path d="M596 16 V260" stroke={CORPO} strokeOpacity=".55" strokeWidth="2" strokeDasharray="3 6" fill="none" />
        <circle cx="596" cy="0" r="11" className={s.furo} />
        <circle cx="596" cy="276" r="11" className={s.furo} />
        <path d="M30 182 H568" stroke={VERDE} strokeOpacity=".25" strokeDasharray="3 4" fill="none" />
        <g transform="translate(672 98)" fill="none" stroke={CORPO} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round">
          <path d="M-10 -22 Q0 -27 10 -22 V-2 H-10 Z" />
          <path d="M-15 3 H15 V13 H-15 Z" />
          <path d="M-8 13 V21 M8 13 V21" />
        </g>

        {/* Carimbo */}
        <g transform="translate(500 100) rotate(-8)" fill="none" stroke={OURO} opacity=".85">
          <circle r="62" strokeWidth="2.5" />
          <circle r="55" strokeWidth="1" strokeDasharray="2 3" />
          <circle r="35" strokeWidth="1" />
          <defs>
            <path id={`${idArco}-a`} d="M-45 0 A45 45 0 0 1 45 0" />
            <path id={`${idArco}-b`} d="M-50 0 A50 50 0 0 0 50 0" />
          </defs>
          <text fill={OURO} stroke="none" fontSize="11" fontWeight="700" letterSpacing="3.5" textAnchor="middle" fontFamily="var(--font-jost), sans-serif">
            <textPath href={`#${idArco}-a`} startOffset="50%">VISITA</textPath>
          </text>
          <text fill={OURO} stroke="none" fontSize="11" fontWeight="700" letterSpacing="2" textAnchor="middle" fontFamily="var(--font-jost), sans-serif">
            <textPath href={`#${idArco}-b`} startOffset="50%" dominantBaseline="hanging">{dataDoCarimbo(v.data)}</textPath>
          </text>
          <text y="7" fill={OURO} stroke="none" fontSize={tipo.length > 6 ? 17 : 24} fontWeight="600" fontStyle="italic" textAnchor="middle" fontFamily="var(--font-fraunces), Georgia, serif">
            {tipo}
          </text>
        </g>
      </svg>

      <div className={s.abs} style={{ left: 30, top: 30, fontSize: 15, fontWeight: 500, letterSpacing: ".2em", color: OURO }}>
        VISITA · TURISMO
      </div>
      <div
        className={s.abs}
        style={{
          left: 30,
          top: 72,
          maxWidth: 350,
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: nomeEstadio.length > 14 ? 40 : 54,
          color: previa?.semEstadio ? OURO : VERDE,
          opacity: previa?.semEstadio ? 0.7 : 1,
        }}
      >
        {nomeEstadio}
      </div>
      <div className={s.abs} style={{ left: 30, top: 140, fontSize: 18, color: VERDE, opacity: 0.8 }}>
        {previa?.semEstadio ? <em className={s.pendente}>próxima etapa</em> : local}
      </div>

      <div className={`${s.abs} ${s.rotulo}`} style={{ left: 30, color: OURO }}>DATA</div>
      <div className={`${s.abs} ${s.valor}`} style={{ left: 30, color: VERDE }}>{formatarData(v.data)}</div>
      <div className={`${s.abs} ${s.rotulo}`} style={{ left: 190, color: OURO }}>TIPO</div>
      <div className={`${s.abs} ${s.valor}`} style={{ left: 190, color: VERDE }}>{v.motivo ? (v.motivo === "Tour" ? "Tour guiado" : v.motivo) : "Visita"}</div>
      <div className={`${s.abs} ${s.rotulo}`} style={{ right: 180, color: OURO, textAlign: "right" }}>SEM</div>
      <div className={`${s.abs} ${s.valor}`} style={{ right: 180, color: VERDE, fontWeight: 600, letterSpacing: ".12em" }}>JOGO</div>

      <div className={`${s.abs} ${s.presenca}`} style={{ color: "#E6C46B" }}>VISITA</div>
      <div className={`${s.abs} ${s.numero}`} style={{ color: CORPO }}>Nº {String(v.numero).padStart(4, "0")}</div>
    </div>
  );

  return href ? (
    <Link ref={caixa as React.Ref<HTMLAnchorElement>} href={href} className={s.caixa} style={estilo} aria-label={rotulo}>
      {ingresso}
    </Link>
  ) : (
    <div ref={caixa as React.Ref<HTMLDivElement>} className={s.caixa} style={estilo} role="img" aria-label={rotulo}>
      {ingresso}
    </div>
  );
}

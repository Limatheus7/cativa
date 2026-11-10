"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import Monograma from "@/components/Monograma";
import { NOME_RESULTADO } from "@/lib/dados/estatisticas";
import { formatarData } from "@/lib/dados/formato";
import { ALTURA_INGRESSO, LARGURA_INGRESSO, ehFinal, temaDoIngresso } from "@/lib/dados/ingressos";
import type { Presenca } from "@/lib/dados/tipos";
import MolduraFinal, { ALTURA_MOLDURA, LARGURA_MOLDURA, MOLDURA } from "./MolduraFinal";
import s from "./Ticket.module.css";

/**
 * Ingresso de presença, fiel ao kit de design (ingressos.html): desenhado em
 * 748 × 276 px e escalado para a largura disponível. O tema vem da competição.
 * Camadas: corpo/canhoto (SVG) → taça (PNG recortado pelo corpo) → escudos → textos.
 */
export default function Ticket({ presenca: p, href }: { presenca: Presenca; href?: string }) {
  const final = ehFinal(p.partida.fase);
  const caixa = useRef<HTMLElement>(null);
  const [escala, setEscala] = useState(0);

  useLayoutEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const medir = () => setEscala(el.clientWidth / (final ? LARGURA_MOLDURA : LARGURA_INGRESSO));
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [final]);

  const t = temaDoIngresso(p.partida.competicao);
  const emCasa = p.partida.mando !== "fora";
  const casa = emCasa ? p.time : p.partida.adversario;
  const fora = emCasa ? p.partida.adversario : p.time;
  const golsCasa = emCasa ? p.partida.golsTime : p.partida.golsAdversario;
  const golsFora = emCasa ? p.partida.golsAdversario : p.partida.golsTime;
  const lado = p.partida.mando === "casa" ? "EM CASA" : p.partida.mando === "fora" ? "FORA" : "CAMPO NEUTRO";
  const aro = t.crestRing ? `0 0 0 1.5px ${t.crestRing}` : undefined;

  const deslocamento = final ? `translate(${MOLDURA.lado * escala}px, ${MOLDURA.topo * escala}px) ` : "";
  const ingresso = (
    <div
      className={s.ingresso}
      style={{ transform: `${deslocamento}scale(${escala})`, visibility: escala ? "visible" : "hidden" }}
      aria-hidden={!!href}
    >
      {/* Corpo, canhoto, picote e divisória */}
      <svg className={s.camada} viewBox="0 0 748 276" width="748" height="276" aria-hidden="true">
        <path d="M24 0 H596 V276 H24 A24 24 0 0 1 0 252 V24 A24 24 0 0 1 24 0 Z" fill={t.body} />
        <path d="M596 0 H724 A24 24 0 0 1 748 24 V252 A24 24 0 0 1 724 276 H596 Z" fill={t.stub} />
        <path d="M596 16 V260" stroke={t.perforation} strokeOpacity={t.perforationOpacity} strokeWidth="2" strokeDasharray="3 6" fill="none" />
        <circle cx="596" cy="0" r="11" className={s.furo} />
        <circle cx="596" cy="276" r="11" className={s.furo} />
        <path d="M30 182 H568" stroke={t.divider} strokeOpacity={t.dividerOpacity} strokeDasharray="3 4" fill="none" />
        <g transform="translate(672 98)" fill="none" stroke={t.stubIcon} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round">
          <path d="M-10 -22 Q0 -27 10 -22 V-2 H-10 Z" />
          <path d="M-15 3 H15 V13 H-15 Z" />
          <path d="M-8 13 V21 M8 13 V21" />
        </g>
      </svg>

      {/* Taça: PNG transparente, recortado pelo corpo (raio 24 à esquerda, sem invadir o canhoto) */}
      {t.taca && (
        <div className={s.recorteTaca}>
          <img
            alt=""
            src={t.taca.src}
            style={{
              left: t.taca.left,
              top: t.taca.top,
              width: t.taca.width,
              height: t.taca.height,
              transform: `rotate(${t.taca.rotate}deg)`,
              opacity: t.taca.opacity,
            }}
          />
        </div>
      )}

      {/* Escudos (identidade do time: sigla e cores), acima da taça */}
      <span className={s.escudo} style={{ left: 138 - 26, boxShadow: aro }}>
        <Monograma time={{ ...casa, iniciais: casa.sigla }} tamanho={52} />
      </span>
      <span className={s.escudo} style={{ left: 460 - 26, boxShadow: aro }}>
        <Monograma time={{ ...fora, iniciais: fora.sigla }} tamanho={52} />
      </span>

      {/* Textos */}
      <div className={s.abs} style={{ left: 30, top: 30, fontSize: 15, fontWeight: 500, letterSpacing: ".2em", color: t.accent }}>
        {p.partida.competicao.toUpperCase()} · {lado}
        {p.partida.fase && ` · ${p.partida.fase.toUpperCase()}`}
      </div>
      <div className={`${s.abs} ${s.nomeTime}`} style={{ left: 68, color: t.teamText }}>
        {casa.nome}
      </div>
      <div className={`${s.abs} ${s.nomeTime}`} style={{ left: 390, color: t.teamText }}>
        {fora.nome}
      </div>
      <div className={`${s.abs} ${s.placar}`} style={{ color: t.text }}>
        <span className={s.gol}>{golsCasa}</span>
        <span className={s.vezes} style={{ color: t.accent }}>
          ×
        </span>
        <span className={s.gol}>{golsFora}</span>
      </div>
      <div className={`${s.abs} ${s.resultado}`} style={{ color: t.accent }}>
        {NOME_RESULTADO[p.resultado].toUpperCase()}
      </div>

      <div className={`${s.abs} ${s.rotulo}`} style={{ left: 30, color: t.accent }}>
        DATA
      </div>
      <div className={`${s.abs} ${s.valor}`} style={{ left: 30, color: t.text }}>
        {formatarData(p.partida.data)}
      </div>
      <div className={`${s.abs} ${s.rotulo}`} style={{ left: 160, color: t.accent }}>
        ESTÁDIO
      </div>
      <div className={`${s.abs} ${s.valor} ${s.estadio}`} style={{ left: 160, color: t.text }}>
        {p.estadio.nome}
      </div>
      <div className={`${s.abs} ${s.rotulo}`} style={{ right: 180, color: t.accent }}>
        SETOR
      </div>
      <div className={`${s.abs} ${s.valor}`} style={{ right: 180, color: t.text }}>
        {(p.lugar?.setor || "—").toUpperCase()}
      </div>

      <div className={`${s.abs} ${s.presenca}`} style={{ color: t.stubLabel }}>
        PRESENÇA
      </div>
      <div className={`${s.abs} ${s.numero}`} style={{ color: t.stubNumber }}>
        Nº {String(p.numero).padStart(4, "0")}
      </div>
    </div>
  );

  // Final: a moldura dourada fica em volta do ingresso, na mesma escala.
  const conteudo = final ? (
    <>
      <div
        className={s.moldura}
        style={{ width: LARGURA_MOLDURA, height: ALTURA_MOLDURA, transform: `scale(${escala})`, visibility: escala ? "visible" : "hidden" }}
      >
        <MolduraFinal />
      </div>
      {ingresso}
    </>
  ) : (
    ingresso
  );

  const rotulo = `${final ? "Ingresso de final" : "Ingresso"}: ${casa.nome} ${golsCasa} × ${golsFora} ${fora.nome}, ${p.partida.competicao}, ${formatarData(p.partida.data)}, ${p.estadio.nome}. Presença Nº ${p.numero}.`;
  const estilo = { aspectRatio: final ? `${LARGURA_MOLDURA} / ${ALTURA_MOLDURA}` : `${LARGURA_INGRESSO} / ${ALTURA_INGRESSO}` };

  return href ? (
    <Link ref={caixa as React.Ref<HTMLAnchorElement>} href={href} className={s.caixa} style={estilo} aria-label={rotulo}>
      {conteudo}
    </Link>
  ) : (
    <div ref={caixa as React.Ref<HTMLDivElement>} className={s.caixa} style={estilo} role="img" aria-label={rotulo}>
      {conteudo}
    </div>
  );
}

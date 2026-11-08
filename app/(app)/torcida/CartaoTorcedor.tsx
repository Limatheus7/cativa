"use client";

import Link from "next/link";
import { Avatar, SeloPresenca } from "@/components/cativa/Basicos";
import { IconeCadeira } from "@/components/cativa/Icones";
import { chaveDoEstadio } from "@/lib/dados/estadios";
import { estatisticas } from "@/lib/dados/estatisticas";
import { formatarData, noEstadio, placar } from "@/lib/dados/formato";
import type { Presenca, TorcedorPublico } from "@/lib/dados/tipos";
import v from "./torcida.module.css";

type Props = {
  torcedor: TorcedorPublico;
  seguindo: boolean;
  onSeguir: () => void;
  /** Suas presenças, para contar jogos juntos. */
  minhasPresencas: Presenca[];
  /** Estádio da casa do seu time, para o convite. */
  meuEstadio?: string;
  gerenciando?: boolean;
  onCombinar: (texto: string) => void;
};

/** Cartão de um torcedor da sua rede: identidade, números, última presença e jogos juntos. */
export default function CartaoTorcedor({ torcedor: t, seguindo, onSeguir, minhasPresencas, meuEstadio, gerenciando, onCombinar }: Props) {
  const est = estatisticas(t.presencas);
  const invicta = est.total ? Math.round(((est.V + est.E) / est.total) * 100) : null;
  const ultima = est.ultima;
  const juntos = t.presencas.filter((p) =>
    minhasPresencas.some((m) => m.partida.data === p.partida.data && chaveDoEstadio(m.estadio) === chaveDoEstadio(p.estadio)),
  ).length;
  const primeiro = t.nome.split(" ")[0];
  const mando = ultima?.partida.mando === "fora" ? "Visitante" : ultima?.partida.mando === "casa" ? "Mandante" : "Campo neutro";

  return (
    <article className={v.cartao}>
      <div className={v.cartaoTopo}>
        <Link href={`/torcedor/${t.usuario}`} className={v.quem}>
          <Avatar nome={t.nome} time={t.time} tamanho={58} />
          <div>
            <strong>{t.nome}</strong>
            <span>
              @{t.usuario} · {t.time.nome}
            </span>
            <em className={v.nivel}>{est.nivel?.nome ?? "Estreante"}</em>
          </div>
        </Link>
        {gerenciando ? (
          <button type="button" className={v.remover} onClick={onSeguir} aria-label={`Deixar de acompanhar ${t.nome}`}>
            Remover
          </button>
        ) : (
          <button
            type="button"
            className={seguindo ? v.seguindo : v.seguir}
            onClick={onSeguir}
            aria-pressed={seguindo}
            aria-label={seguindo ? `Deixar de acompanhar ${t.nome}` : `Acompanhar ${t.nome}`}
          >
            {seguindo && (
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {seguindo ? "Seguindo" : "Acompanhar"}
          </button>
        )}
      </div>

      <div className={v.numeros}>
        <div>
          <strong>{est.total}</strong>
          <span>Jogos</span>
        </div>
        <div>
          <strong>{est.estadios}</strong>
          <span>Estádios</span>
        </div>
        <div>
          <strong>{invicta === null ? "—" : `${invicta}%`}</strong>
          <span>Invicta</span>
        </div>
      </div>

      {ultima && (
        <div className={v.ultima}>
          <SeloPresenca resultado={ultima.resultado} tamanho={28} />
          <div>
            <small>Última presença</small>
            <strong>{placar(ultima).texto}</strong>
            <span>
              {ultima.estadio.nome} · {formatarData(ultima.partida.data)} · {mando}
            </span>
          </div>
        </div>
      )}

      <div className={v.juntos}>
        <IconeCadeira tamanho={22} />
        <div>
          <strong>
            {juntos > 0 ? `Vocês estiveram juntos em ${juntos} ${juntos === 1 ? "jogo" : "jogos"}.` : "Nenhum jogo juntos ainda."}
          </strong>
          <span>{meuEstadio ? `Quem sabe no próximo, ${noEstadio(meuEstadio)}.` : "Quem sabe no próximo jogo."}</span>
        </div>
        <button
          type="button"
          onClick={() =>
            onCombinar(
              `${primeiro}, bora no próximo jogo${meuEstadio ? ` ${noEstadio(meuEstadio)}` : ""}? Vamos registrar juntos na Cativa.`,
            )
          }
        >
          Combinar
        </button>
      </div>
    </article>
  );
}

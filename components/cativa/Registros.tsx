"use client";

import Link from "next/link";
import { formatarData, numeroPresenca, placar } from "@/lib/dados/formato";
import type { StatusConquista } from "@/lib/dados/conquistas";
import type { Estadio, Presenca } from "@/lib/dados/tipos";
import { IdentidadeTime, Progresso, SeloPresenca } from "./Basicos";
import { IconeCadeira, IconeEstrela } from "./Icones";
import s from "./ui.module.css";

// ------------------------------------------------------------ MatchCard

export function CartaoPartida({ presenca, href }: { presenca: Presenca; href?: string }) {
  const pl = placar(presenca);
  const timeCasa = presenca.partida.mando !== "fora" ? presenca.time : presenca.partida.adversario;
  const timeFora = presenca.partida.mando !== "fora" ? presenca.partida.adversario : presenca.time;

  const conteudo = (
    <>
      <SeloPresenca resultado={presenca.resultado} tamanho={40} />
      <div className={s.partidaCorpo}>
        <div className={s.partidaPlacar}>
          <IdentidadeTime time={timeCasa} tamanho={22} />
          <strong>
            {pl.casa.sigla} {pl.casa.gols} <span>×</span> {pl.fora.gols} {pl.fora.sigla}
          </strong>
          <IdentidadeTime time={timeFora} tamanho={22} />
        </div>
        <p className={s.partidaMeta}>
          {formatarData(presenca.partida.data)} · {presenca.estadio.nome}
        </p>
        <p className={s.partidaMeta}>{presenca.partida.competicao}</p>
      </div>
      {presenca.fotos[0] && <img className={s.partidaFoto} src={presenca.fotos[0]} alt="" />}
    </>
  );

  return href ? (
    <Link href={href} className={`${s.partida} ${s.partidaLink}`}>
      {conteudo}
    </Link>
  ) : (
    <div className={s.partida}>{conteudo}</div>
  );
}

// ------------------------------------------------------------ Ingresso (slide 15)

export function Ingresso({ presenca }: { presenca: Presenca }) {
  const l = presenca.lugar ?? {};
  return (
    <div className={s.ingresso}>
      <div className={s.ingressoCorpo}>
        <img src="/marca/logotipo-cativa-papel.svg" alt="Cativa" width={762} height={185} className={s.ingressoLogo} />
        <p className={s.ingressoJogo}>{placar(presenca).texto}</p>
        <div className={s.ingressoLugar}>
          <div>
            <span>Setor</span>
            <strong>{l.setor || "—"}</strong>
          </div>
          <div>
            <span>Fila</span>
            <strong>{l.fila || "—"}</strong>
          </div>
          <div>
            <span>Cadeira</span>
            <strong>{l.cadeira || "—"}</strong>
          </div>
        </div>
        <p className={s.ingressoRodape}>Você estava lá · {formatarData(presenca.partida.data)}</p>
      </div>
      <div className={s.ingressoCanhoto}>
        <IconeCadeira tamanho={30} />
        <span>Presença</span>
        <strong>{numeroPresenca(presenca.numero)}</strong>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ StadiumSticker

const TINTAS = ["#2F5D4A", "#A9791A", "#9C4A32", "#2F5577"];

/** Sticker vintage do estádio: borda de adesivo, arquibancada em traço, gramado. */
export function AdesivoEstadio({
  estadio,
  desbloqueado,
  visitas = 0,
  indice = 0,
  href,
}: {
  estadio: Estadio;
  desbloqueado: boolean;
  visitas?: number;
  indice?: number;
  href?: string;
}) {
  const tinta = TINTAS[indice % TINTAS.length];
  const giro = ((indice * 37) % 7) - 3;
  const conteudo = (
    <>
      <span className={s.adesivoArte} style={{ transform: desbloqueado ? `rotate(${giro}deg)` : undefined }}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <rect width="100" height="100" fill={desbloqueado ? "#FBF5E8" : "transparent"} />
          {desbloqueado && <circle cx="74" cy="26" r="11" fill="#E6C46B" opacity="0.85" />}
          <path d="M14 34v24M86 34v24" stroke={desbloqueado ? tinta : "#C9BC9F"} strokeWidth="2.5" strokeLinecap="round" />
          <rect x="10" y="29" width="8" height="5" rx="1.5" fill={desbloqueado ? tinta : "#C9BC9F"} />
          <rect x="82" y="29" width="8" height="5" rx="1.5" fill={desbloqueado ? tinta : "#C9BC9F"} />
          <path d="M8 66Q50 34 92 66v8Q50 46 8 74z" fill={desbloqueado ? tinta : "none"} stroke={desbloqueado ? "none" : "#C9BC9F"} strokeWidth="2" />
          <path d="M8 66Q50 34 92 66" fill="none" stroke={desbloqueado ? "#F4EBD9" : "#C9BC9F"} strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M14 76h72l8 14H6z" fill={desbloqueado ? "#3C7A4E" : "none"} stroke={desbloqueado ? "none" : "#C9BC9F"} strokeWidth="2" />
          {desbloqueado && <path d="M50 76v14M38 83h24" stroke="#F4EBD9" strokeWidth="1.2" opacity="0.8" />}
        </svg>
        {desbloqueado && visitas > 1 && <span className={s.adesivoVisitas}>×{visitas}</span>}
      </span>
      <span className={s.adesivoNome}>{estadio.nome}</span>
      <span className={s.adesivoLocal}>
        {estadio.cidade} · {estadio.uf}
      </span>
    </>
  );
  const cls = `${s.adesivo} ${desbloqueado ? "" : s.adesivoTrancado}`;
  return href ? (
    <Link href={href} className={cls} aria-label={`${estadio.nome}${desbloqueado ? "" : ", ainda não visitado"}`}>
      {conteudo}
    </Link>
  ) : (
    <div className={cls}>{conteudo}</div>
  );
}

// ------------------------------------------------------------ AchievementBadge

export function SeloConquista({
  status,
  favorita,
  onFavoritar,
  compacto = false,
}: {
  status: StatusConquista;
  favorita?: boolean;
  onFavoritar?: () => void;
  compacto?: boolean;
}) {
  const { conquista, desbloqueada, valor, progresso } = status;
  return (
    <div className={`${s.conquista} ${desbloqueada ? "" : s.conquistaTrancada} ${compacto ? s.conquistaCompacta : ""}`}>
      <span className={s.conquistaMedalha} aria-hidden="true">
        <IconeCadeira tamanho={compacto ? 20 : 24} />
      </span>
      <div className={s.conquistaTexto}>
        <strong>{conquista.nome}</strong>
        {!compacto && <span>{conquista.descricao}</span>}
        {!compacto && !desbloqueada && (
          <div className={s.conquistaProgresso}>
            <Progresso valor={progresso} rotulo={`Progresso de ${conquista.nome}`} />
            <span>
              {valor}/{conquista.meta}
            </span>
          </div>
        )}
      </div>
      {desbloqueada && onFavoritar && (
        <button
          type="button"
          className={`${s.favoritar} ${favorita ? s.favoritarAtiva : ""}`}
          onClick={onFavoritar}
          aria-pressed={favorita}
          aria-label={favorita ? `Tirar ${conquista.nome} das favoritas` : `Marcar ${conquista.nome} como favorita`}
        >
          <IconeEstrela cheia={favorita} />
        </button>
      )}
    </div>
  );
}

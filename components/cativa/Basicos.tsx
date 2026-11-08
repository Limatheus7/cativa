"use client";

import Link from "next/link";
import Monograma from "@/components/Monograma";
import { iniciaisDoNome } from "@/lib/dados/formato";
import { NOME_RESULTADO } from "@/lib/dados/estatisticas";
import type { IdentidadeDoTime, Resultado } from "@/lib/dados/tipos";
import type { Time } from "@/lib/time";
import s from "./ui.module.css";

// ------------------------------------------------------------ SectionHeader

export function TituloSecao({ titulo, acao }: { titulo: string; acao?: { rotulo: string; href: string } }) {
  return (
    <div className={s.tituloSecao}>
      <h2>{titulo}</h2>
      {acao && <Link href={acao.href}>{acao.rotulo}</Link>}
    </div>
  );
}

// ------------------------------------------------------------ EmptyState / erro / indisponível

type Acao = { rotulo: string; href?: string; onClick?: () => void };

export function EstadoVazio({
  titulo,
  texto,
  acao,
  acaoSecundaria,
  tom = "vazio",
}: {
  titulo: string;
  texto?: string;
  acao?: Acao;
  acaoSecundaria?: Acao;
  tom?: "vazio" | "erro" | "indisponivel";
}) {
  return (
    <section className={`${s.vazio} ${tom === "erro" ? s.vazioErro : ""}`} role={tom === "erro" ? "alert" : undefined}>
      <img src="/marca/cadeira-verde.svg" alt="" width={824} height={896} className={tom !== "vazio" ? s.vazioApagado : undefined} />
      <h2>{titulo}</h2>
      {texto && <p>{texto}</p>}
      {acao && <BotaoAcao acao={acao} principal />}
      {acaoSecundaria && <BotaoAcao acao={acaoSecundaria} />}
    </section>
  );
}

function BotaoAcao({ acao, principal }: { acao: Acao; principal?: boolean }) {
  const cls = principal ? s.botao : s.botaoTexto;
  return acao.href ? (
    <Link href={acao.href} className={cls}>
      {acao.rotulo}
    </Link>
  ) : (
    <button type="button" className={cls} onClick={acao.onClick}>
      {acao.rotulo}
    </button>
  );
}

/** Esqueleto enquanto os dados abrem. */
export function Carregando({ linhas = 3 }: { linhas?: number }) {
  return (
    <div className={s.carregando} aria-busy="true" aria-label="Carregando">
      {Array.from({ length: linhas }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}

// ------------------------------------------------------------ TeamIdentity

/** Time do torcedor (lib/time) no formato de identidade usado nos registros. */
export function paraIdentidade(time: Time): IdentidadeDoTime {
  return {
    nome: time.nome,
    sigla: time.iniciais,
    corPrincipal: time.corPrincipal,
    corSegunda: time.corSegunda,
    padrao: time.padrao,
    faixas: time.faixas,
  };
}

export function IdentidadeTime({
  time,
  tamanho = 28,
  mostrarNome = false,
}: {
  time: IdentidadeDoTime;
  tamanho?: number;
  mostrarNome?: boolean;
}) {
  return (
    <span className={s.identidade}>
      <Monograma time={{ ...time, iniciais: time.sigla }} tamanho={tamanho} />
      {mostrarNome && <span>{time.nome}</span>}
    </span>
  );
}

/** Faixa fina nas cores do time: o time aparece sem tomar a interface. */
export function FaixaDoTime({ time }: { time: IdentidadeDoTime }) {
  const cores = time.faixas?.length ? time.faixas : [time.corPrincipal, time.corSegunda];
  return (
    <div className={s.faixaTime} aria-hidden="true">
      {cores.map((c, i) => (
        <span key={i} style={{ background: c }} />
      ))}
    </div>
  );
}

// ------------------------------------------------------------ UserAvatar

export function Avatar({
  nome,
  foto,
  time,
  tamanho = 44,
}: {
  nome: string;
  foto?: string;
  time?: IdentidadeDoTime;
  tamanho?: number;
}) {
  return (
    <span className={s.avatar} style={{ width: tamanho, height: tamanho }}>
      {foto ? (
        <span className={s.avatarFoto}>
          <img src={foto} alt="" />
        </span>
      ) : (
        <span className={s.avatarIniciais} style={{ fontSize: tamanho * 0.36 }}>
          {iniciaisDoNome(nome)}
        </span>
      )}
      {time && (
        <span className={s.avatarTime}>
          <IdentidadeTime time={time} tamanho={Math.max(16, Math.round(tamanho * 0.42))} />
        </span>
      )}
    </span>
  );
}

// ------------------------------------------------------------ PresenceBadge

/** Selo circular V/E/D. A letra vai sempre junto da cor (slide 11). */
export function SeloPresenca({
  resultado,
  tamanho = 36,
  comNome = false,
}: {
  resultado: Resultado;
  tamanho?: number;
  comNome?: boolean;
}) {
  return (
    <span className={s.seloWrap}>
      <span
        className={`${s.selo} ${s[`selo${resultado}`]}`}
        style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.48 }}
        role="img"
        aria-label={NOME_RESULTADO[resultado]}
      >
        {resultado}
      </span>
      {comNome && <span className={s.seloNome}>{NOME_RESULTADO[resultado]}</span>}
    </span>
  );
}

// ------------------------------------------------------------ Abas

export function Abas<T extends string>({
  abas,
  ativa,
  onChange,
}: {
  abas: { valor: T; rotulo: string; contagem?: number }[];
  ativa: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className={s.abas} role="tablist">
      {abas.map((a) => (
        <button
          key={a.valor}
          type="button"
          role="tab"
          aria-selected={a.valor === ativa}
          className={s.aba}
          onClick={() => onChange(a.valor)}
        >
          {a.rotulo}
          {a.contagem !== undefined && <span>{a.contagem}</span>}
        </button>
      ))}
    </div>
  );
}

// ------------------------------------------------------------ Barra de progresso

export function Progresso({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <div className={s.progresso} role="progressbar" aria-label={rotulo} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(valor * 100)}>
      <span style={{ width: `${Math.max(0, Math.min(1, valor)) * 100}%` }} />
    </div>
  );
}

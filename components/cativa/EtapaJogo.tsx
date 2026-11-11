"use client";

import { useRef, useState } from "react";
import Monograma from "@/components/Monograma";
import { NOME_RESULTADO, resultadoDoPlacar } from "@/lib/dados/estatisticas";
import { formatarData } from "@/lib/dados/formato";
import { FASES, ehFinal, temaDoIngresso } from "@/lib/dados/ingressos";
import type { IdentidadeDoTime, Mando, Presenca } from "@/lib/dados/tipos";
import { CLUBES, buscarClubes } from "@/lib/times";
import { sugerirIniciais } from "@/lib/time";
import { SeloPresenca } from "./Basicos";
import { IconeCadeira, IconeEstrela } from "./Icones";
import { CartaoPartida } from "./Registros";
import j from "./EtapaJogo.module.css";
import s from "./ui.module.css";

export const COMPETICOES = ["Brasileirão", "Copa do Brasil", "Estadual", "Libertadores", "Sul-Americana", "Série B", "Série C", "Amistoso", "Outra"];

/** Pontos corridos não têm mata-mata: nelas a fase some e o jogo é "comum". */
const SEM_FASE = new Set(["Brasileirão", "Série B", "Série C", "Amistoso"]);

const NOME_MANDO: Record<Mando, string> = { casa: "Em casa", fora: "Fora", neutro: "Campo neutro" };

export function hojeIso(deslocamentoDias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + deslocamentoDias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function identidadeDeClube(sigla: string): IdentidadeDoTime | null {
  const c = CLUBES.find((x) => x.sigla === sigla);
  return c ? { nome: c.nome, sigla: c.sigla, corPrincipal: c.corPrincipal, corSegunda: c.corSegunda, padrao: c.padrao, faixas: c.faixas } : null;
}

export function competicaoTemFase(competicao: string) {
  return !SEM_FASE.has(competicao);
}

type Props = {
  meuTime: IdentidadeDoTime;
  numero: number;
  adversario: IdentidadeDoTime | null;
  onAdversario: (t: IdentidadeDoTime | null) => void;
  mando: Mando;
  onMando: (m: Mando) => void;
  data: string;
  onData: (d: string) => void;
  competicao: string;
  onCompeticao: (c: string) => void;
  fase: string;
  onFase: (f: string) => void;
  gols: [number, number];
  onGols: (g: [number, number]) => void;
  rede: { p: Presenca; quem: string }[];
  onJogoDaRede: (p: Presenca) => void;
};

/** Etapa 1 do registro de presença: o ingresso vai se montando enquanto o torcedor escolhe. */
export default function EtapaJogo(props: Props) {
  const { meuTime, adversario, onAdversario, mando, onMando, data, onData, competicao, onCompeticao, fase, onFase, gols, onGols, rede } = props;
  const [busca, setBusca] = useState("");
  const campoBusca = useRef<HTMLInputElement>(null);
  const campoData = useRef<HTMLInputElement>(null);

  const termo = busca.trim();
  const clubes = buscarClubes(busca).filter((c) => c.sigla !== meuTime.sigla);
  const visiveis = clubes.slice(0, termo ? 12 : 8);
  const exato = clubes.some((c) => c.nome.toLowerCase() === termo.toLowerCase() || c.sigla.toLowerCase() === termo.toLowerCase());

  const hoje = hojeIso();
  const ontem = hojeIso(-1);
  const dataLivre = data !== hoje && data !== ontem;

  function escolher(t: IdentidadeDoTime | null) {
    onAdversario(t);
    setBusca("");
  }

  function usarDigitado() {
    if (termo.length < 2) return;
    escolher({ nome: termo, sigla: sugerirIniciais(termo).slice(0, 3) || "?", corPrincipal: "#1E2A22", corSegunda: "#F4EBD9" });
  }

  function trocarCompeticao(c: string) {
    onCompeticao(c);
    if (!competicaoTemFase(c)) onFase("");
  }

  return (
    <>
      <header className={j.cabeca}>
        <h2 className={s.checkinTitulo}>Qual foi o jogo?</h2>
        <p className={s.textoSuave}>Vale o jogo de hoje e aquele de anos atrás. O ingresso vai se montando com você.</p>
      </header>

      <IngressoEmMontagem {...props} onVazio={() => campoBusca.current?.focus()} />

      {rede.length > 0 && !adversario && (
        <section className={s.bloco}>
          <h3 className={s.rotulo}>Jogos da sua torcida</h3>
          <div className={s.lista}>
            {rede.slice(0, 2).map(({ p, quem }) => (
              <button key={p.id} type="button" className={s.opcaoJogo} onClick={() => props.onJogoDaRede(p)}>
                <CartaoPartida presenca={p} />
                <span>{quem} esteve lá · Usar este jogo</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- Adversário */}
      <section className={j.secao} aria-labelledby="titulo-adversario">
        <h3 id="titulo-adversario" className={j.titulo}>
          <span className={j.numero}>1</span> Contra quem?
          {adversario && <span className={j.ok} aria-label="feito">✓</span>}
        </h3>

        {adversario ? (
          <div className={j.escolhido}>
            <Monograma time={{ ...adversario, iniciais: adversario.sigla }} tamanho={40} />
            <span>
              <small>Adversário</small>
              <strong>{adversario.nome}</strong>
            </span>
            <button type="button" className={j.trocar} onClick={() => escolher(null)}>
              Trocar
            </button>
          </div>
        ) : (
          <>
            <label className={j.busca}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className={s.somenteLeitor}>Buscar adversário</span>
              <input
                ref={campoBusca}
                type="search"
                enterKeyHint="done"
                placeholder="Nome ou sigla do time"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  if (clubes.length === 1) escolher(identidadeDeClube(clubes[0].sigla));
                  else if (!clubes.length) usarDigitado();
                }}
              />
            </label>

            <div className={j.grade}>
              {visiveis.map((c, i) => (
                <button
                  key={c.sigla}
                  type="button"
                 
                  className={j.time}
                  style={{ animationDelay: `${i * 24}ms` }}
                  onClick={() => escolher(identidadeDeClube(c.sigla))}
                >
                  <Monograma time={{ ...identidadeDeClube(c.sigla)!, iniciais: c.sigla }} tamanho={46} />
                  <span>{c.nome}</span>
                </button>
              ))}
              {termo.length >= 2 && !exato && (
                <button type="button" className={`${j.time} ${j.timeNovo}`} onClick={usarDigitado}>
                  <span className={j.timeNovoCirculo}>{sugerirIniciais(termo).slice(0, 3) || "?"}</span>
                  <span>Usar “{termo}”</span>
                </button>
              )}
            </div>
            {!termo && <p className={j.dica}>Não achou? Digite o nome na busca e use como está.</p>}
            {termo && !clubes.length && <p className={j.dica}>Nenhum time com esse nome na lista. Toque em “Usar” para seguir com ele.</p>}
          </>
        )}
      </section>

      {/* ---------------------------------------------------------------- Mando */}
      <section className={j.secao} aria-labelledby="titulo-mando">
        <h3 id="titulo-mando" className={j.titulo}>
          <span className={j.numero}>2</span> Onde o {meuTime.nome} jogou?
        </h3>
        <div className={j.mando} role="radiogroup" aria-labelledby="titulo-mando">
          {(["casa", "fora", "neutro"] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mando === m} onClick={() => onMando(m)}>
              {NOME_MANDO[m]}
            </button>
          ))}
          <span className={j.mandoMarca} style={{ transform: `translateX(${["casa", "fora", "neutro"].indexOf(mando) * 100}%)` }} aria-hidden="true" />
        </div>
      </section>

      {/* ---------------------------------------------------------------- Quando e qual competição */}
      <section className={j.secao} aria-labelledby="titulo-quando">
        <h3 id="titulo-quando" className={j.titulo}>
          <span className={j.numero}>3</span> Quando e por qual competição?
        </h3>

        <div className={j.fichas} role="radiogroup" aria-label="Data do jogo">
          <button type="button" role="radio" aria-checked={data === hoje} onClick={() => onData(hoje)}>
            Hoje
          </button>
          <button type="button" role="radio" aria-checked={data === ontem} onClick={() => onData(ontem)}>
            Ontem
          </button>
          <label className={j.fichaData} data-ativa={dataLivre || undefined}>
            <span>{dataLivre ? formatarData(data) : "Outra data"}</span>
            <input
              ref={campoData}
              type="date"
              aria-label="Escolher outra data"
              value={data}
              max={hoje}
              min="1900-01-01"
              onChange={(e) => e.target.value && onData(e.target.value)}
              onClick={(e) => {
                try {
                  (e.currentTarget as HTMLInputElement).showPicker?.();
                } catch {}
              }}
            />
          </label>
        </div>

        <div className={j.rolagem}>
          <div className={j.fichas} role="radiogroup" aria-label="Competição">
            {COMPETICOES.map((c) => (
              <button key={c} type="button" role="radio" aria-checked={competicao === c} onClick={() => trocarCompeticao(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {competicaoTemFase(competicao) && (
          <div className={j.fase}>
            <span className={j.subrotulo}>Fase</span>
            <div className={j.fichas} role="radiogroup" aria-label="Fase">
              {["", ...FASES].map((f) => (
                <button key={f || "comum"} type="button" role="radio" aria-checked={fase === f} data-final={ehFinal(f) || undefined} onClick={() => onFase(f)}>
                  {ehFinal(f) && <IconeEstrela tamanho={13} cheia />}
                  {f ? f.replace(" de final", "") : "Jogo comum"}
                </button>
              ))}
            </div>
            {ehFinal(fase) && <p className={j.dica}>Final ganha moldura dourada no ingresso.</p>}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- Placar */}
      <section className={j.secao} aria-labelledby="titulo-placar">
        <h3 id="titulo-placar" className={j.titulo}>
          <span className={j.numero}>4</span> Como terminou?
        </h3>
        <div className={j.placar}>
          <Marcador time={meuTime} valor={gols[0]} onChange={(v) => onGols([v, gols[1]])} />
          <span className={j.vezes} aria-hidden="true">
            ×
          </span>
          <Marcador time={adversario} valor={gols[1]} onChange={(v) => onGols([gols[0], v])} />
        </div>
        <p className={j.resultado} aria-live="polite">
          <SeloPresenca resultado={resultadoDoPlacar(gols[0], gols[1])} tamanho={22} />
          {fraseDoResultado(resultadoDoPlacar(gols[0], gols[1]), meuTime.nome)}
        </p>
      </section>
    </>
  );
}

function fraseDoResultado(r: "V" | "E" | "D", nome: string) {
  if (r === "V") return `Vitória do ${nome}.`;
  if (r === "D") return `Derrota do ${nome}. Também conta.`;
  return "Empate. Pênaltis? Você ajusta na etapa 4.";
}

function Marcador({ time, valor, onChange }: { time: IdentidadeDoTime | null; valor: number; onChange: (v: number) => void }) {
  const sigla = time?.sigla ?? "ADV";
  return (
    <div className={j.marcador}>
      <span className={j.marcadorSigla}>{sigla}</span>
      <div>
        <button type="button" onClick={() => onChange(Math.max(0, valor - 1))} disabled={valor === 0} aria-label={`Menos um gol para ${sigla}`}>
          −
        </button>
        <strong key={valor} aria-live="polite">
          {valor}
        </strong>
        <button type="button" onClick={() => onChange(Math.min(30, valor + 1))} aria-label={`Mais um gol para ${sigla}`}>
          +
        </button>
      </div>
    </div>
  );
}

/** Prévia do ingresso: mesmo tema da competição, preenchido conforme as escolhas. */
function IngressoEmMontagem({
  meuTime,
  adversario,
  mando,
  data,
  competicao,
  fase,
  gols,
  numero,
  onVazio,
}: Props & { onVazio: () => void }) {
  const t = temaDoIngresso(competicao);
  const emCasa = mando !== "fora";
  const casa = emCasa ? meuTime : adversario;
  const fora = emCasa ? adversario : meuTime;
  const golsCasa = emCasa ? gols[0] : gols[1];
  const golsFora = emCasa ? gols[1] : gols[0];
  const final = ehFinal(fase);
  const estilo = {
    "--corpo": t.body,
    "--canhoto": t.stub,
    "--acento-ingresso": t.accent,
    "--texto-ingresso": t.text,
    "--rotulo-canhoto": t.stubLabel,
    "--numero-canhoto": t.stubNumber,
    "--picote": t.perforation,
  } as React.CSSProperties;

  const lado = (time: IdentidadeDoTime | null) =>
    time ? (
      <span className={j.lado} key={time.sigla}>
        <span className={j.escudo} style={t.crestRing ? { boxShadow: `0 0 0 1.5px ${t.crestRing}` } : undefined}>
          <Monograma time={{ ...time, iniciais: time.sigla }} tamanho={40} />
        </span>
        <span className={j.nomeLado}>{time.nome}</span>
      </span>
    ) : (
      <button type="button" className={`${j.lado} ${j.ladoVazio}`} onClick={onVazio}>
        <span className={j.escudoVazio}>?</span>
        <span className={j.nomeLado}>Adversário</span>
      </button>
    );

  return (
    <div
      className={j.ingresso}
      style={estilo}
      data-final={final || undefined}
      aria-label={`Ingresso em montagem: ${casa?.nome ?? "adversário"} ${golsCasa} × ${golsFora} ${fora?.nome ?? "adversário"}, ${competicao}, ${formatarData(data)}.`}
    >
      <div className={j.corpo}>
        <p className={j.sobre}>
          {competicao} · {NOME_MANDO[mando]}
          {fase && ` · ${fase}`}
        </p>
        <div className={j.confronto}>
          {lado(casa)}
          <span className={j.placarIngresso}>
            <b key={`c${golsCasa}`}>{golsCasa}</b>
            <i>×</i>
            <b key={`f${golsFora}`}>{golsFora}</b>
          </span>
          {lado(fora)}
        </div>
        <div className={j.rodape}>
          <span>
            <small>Data</small>
            {formatarData(data)}
          </span>
          <span>
            <small>Estádio</small>
            <em>próxima etapa</em>
          </span>
          <span className={j.resultadoIngresso}>{NOME_RESULTADO[resultadoDoPlacar(gols[0], gols[1])]}</span>
        </div>
      </div>
      <div className={j.canhoto}>
        <IconeCadeira tamanho={22} />
        <small>Presença</small>
        <strong>Nº {String(numero).padStart(4, "0")}</strong>
      </div>
    </div>
  );
}

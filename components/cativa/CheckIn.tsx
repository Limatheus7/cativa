"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTime } from "@/components/app/TimeProvider";
import { buscarEstadios, estadioDeCasa, estadioPorId } from "@/lib/dados/estadios";
import { NOME_RESULTADO, resultadoDoPlacar } from "@/lib/dados/estatisticas";
import { formatarData, numeroPresenca } from "@/lib/dados/formato";
import { reduzirFoto } from "@/lib/dados/imagens";
import { publicarPresenca, registrarPresenca, SemEspacoError, type Novidades } from "@/lib/dados/loja";
import { TORCEDORES_DEMONSTRACAO } from "@/lib/dados/mock/torcedores";
import type { Companhia, DadosDoTorcedor, EstadioDaPresenca, IdentidadeDoTime, Mando, Presenca, Resultado } from "@/lib/dados/tipos";
import { CLUBES, buscarClubes } from "@/lib/times";
import { sugerirIniciais } from "@/lib/time";
import { IdentidadeTime, SeloPresenca, paraIdentidade } from "./Basicos";
import { IconeCamera, IconeFechar, IconeVoltar } from "./Icones";
import { AdesivoEstadio, CartaoPartida, Ingresso, SeloConquista } from "./Registros";
import s from "./ui.module.css";

const COMPETICOES = ["Brasileirão", "Copa do Brasil", "Estadual", "Libertadores", "Sul-Americana", "Série B", "Série C", "Amistoso", "Outra"];
const UFS = "AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO".split(" ");
const ETAPAS = ["O jogo", "O estádio", "Companhia e fotos", "A memória", "Confirmar"];
const MAX_FOTOS = 4;

function hojeIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function identidadeDeClube(sigla: string): IdentidadeDoTime | null {
  const c = CLUBES.find((x) => x.sigla === sigla);
  return c ? { nome: c.nome, sigla: c.sigla, corPrincipal: c.corPrincipal, corSegunda: c.corSegunda, padrao: c.padrao, faixas: c.faixas } : null;
}

/** Jogos da sua rede que envolvem o seu time: atalho para "selecionar uma partida existente". */
function jogosDaRede(dados: DadosDoTorcedor, minhaSigla: string) {
  const vistos = new Set<string>();
  return TORCEDORES_DEMONSTRACAO.filter((t) => dados.seguindo.includes(t.usuario))
    .flatMap((t) => t.presencas.map((p) => ({ p, quem: t.nome.split(" ")[0] })))
    .filter(({ p }) => p.time.sigla === minhaSigla || p.partida.adversario.sigla === minhaSigla)
    // Jogo que você já registrou não aparece de novo.
    .filter(({ p }) => !dados.presencas.some((m) => m.partida.data === p.partida.data && m.estadio.nome === p.estadio.nome))
    .filter(({ p }) => {
      const chave = `${p.partida.data}|${p.estadio.nome}`;
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    })
    .sort((a, b) => b.p.partida.data.localeCompare(a.p.partida.data));
}

type Concluido = { presenca: Presenca; novidades: Novidades; publicada: boolean };

export default function CheckIn({ dados }: { dados: DadosDoTorcedor }) {
  const meuTime = paraIdentidade(useTime());
  const [etapa, setEtapa] = useState(0);

  // Etapa 1: o jogo
  const [adversario, setAdversario] = useState<IdentidadeDoTime | null>(null);
  const [buscaTime, setBuscaTime] = useState("");
  const [outroTime, setOutroTime] = useState("");
  const [mando, setMando] = useState<Mando>("casa");
  const [data, setData] = useState(hojeIso());
  const [competicao, setCompeticao] = useState(COMPETICOES[0]);
  const [gols, setGols] = useState<[number, number]>([0, 0]);

  // Etapa 2: estádio e lugar
  const [estadio, setEstadio] = useState<EstadioDaPresenca | null>(null);
  const [buscaEstadio, setBuscaEstadio] = useState("");
  const [outroEstadio, setOutroEstadio] = useState({ aberto: false, nome: "", cidade: "", uf: "SP" });
  const [lugar, setLugar] = useState({ setor: "", fila: "", cadeira: "" });

  // Etapa 3: companhia e fotos
  const [companhia, setCompanhia] = useState<Companhia[]>([]);
  const [nomeCompanhia, setNomeCompanhia] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [lendoFotos, setLendoFotos] = useState(false);
  const [erroFoto, setErroFoto] = useState("");

  // Etapa 4: memória e resultado
  const [frase, setFrase] = useState("");
  const [resultadoManual, setResultadoManual] = useState<Resultado | null>(null);

  // Etapa 5
  const [publicar, setPublicar] = useState(dados.config.perfilPublico);
  const [erro, setErro] = useState("");
  const [concluido, setConcluido] = useState<Concluido | null>(null);

  // /presenca?estadio=maracana (vindo da página do estádio) já marca o estádio.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("estadio");
    const e = estadioPorId(id ?? undefined);
    if (e) setEstadio({ id: e.id, nome: e.nome, cidade: e.cidade, uf: e.uf });
  }, []);

  const resultadoDoJogo = resultadoDoPlacar(gols[0], gols[1]);
  const resultado = resultadoManual ?? resultadoDoJogo;
  const rede = useMemo(() => jogosDaRede(dados, meuTime.sigla), [dados, meuTime.sigla]);
  const amigos = TORCEDORES_DEMONSTRACAO.filter((t) => dados.seguindo.includes(t.usuario));

  const sugestaoEstadio = mando === "casa" ? estadioDeCasa(meuTime.sigla) : mando === "fora" ? estadioDeCasa(adversario?.sigla) : undefined;

  function usarJogoDaRede(p: Presenca) {
    const meuLadoEhOTime = p.time.sigla === meuTime.sigla;
    setAdversario(meuLadoEhOTime ? p.partida.adversario : p.time);
    const m = p.partida.mando;
    setMando(meuLadoEhOTime ? m : m === "casa" ? "fora" : m === "fora" ? "casa" : "neutro");
    setData(p.partida.data);
    setCompeticao(COMPETICOES.includes(p.partida.competicao) ? p.partida.competicao : "Outra");
    setGols(meuLadoEhOTime ? [p.partida.golsTime, p.partida.golsAdversario] : [p.partida.golsAdversario, p.partida.golsTime]);
    setEstadio(p.estadio);
    setResultadoManual(null);
    setEtapa(1);
  }

  async function adicionarFotos(arquivos: FileList | null) {
    if (!arquivos?.length) return;
    setErroFoto("");
    setLendoFotos(true);
    try {
      const livres = MAX_FOTOS - fotos.length;
      const novas = await Promise.all([...arquivos].slice(0, livres).map((a) => reduzirFoto(a)));
      setFotos((f) => [...f, ...novas].slice(0, MAX_FOTOS));
      if (arquivos.length > livres) setErroFoto(`Cabem ${MAX_FOTOS} fotos por jogo.`);
    } catch {
      setErroFoto("Não conseguimos abrir uma das fotos. Tente outra.");
    } finally {
      setLendoFotos(false);
    }
  }

  function adicionarCompanhia(c: Companhia) {
    if (!c.nome.trim() || companhia.some((x) => (c.usuario ? x.usuario === c.usuario : x.nome === c.nome))) return;
    setCompanhia((l) => [...l, { ...c, nome: c.nome.trim() }]);
  }

  const etapaValida = [
    !!adversario && !!data && data <= hojeIso(),
    !!estadio,
    !lendoFotos,
    true,
    true,
  ][etapa];

  function montar() {
    return {
      time: meuTime,
      partida: { data, competicao, mando, adversario: adversario!, golsTime: gols[0], golsAdversario: gols[1] },
      estadio: estadio!,
      lugar: lugar.setor || lugar.fila || lugar.cadeira ? lugar : undefined,
      companhia,
      fotos,
      frase: frase.trim(),
      resultado,
    };
  }

  function confirmar() {
    setErro("");
    try {
      const r = registrarPresenca(montar(), publicar);
      setConcluido({ ...r, publicada: publicar });
      window.scrollTo({ top: 0 });
    } catch (e) {
      setErro(e instanceof SemEspacoError ? "Não coube no aparelho. Tire uma ou duas fotos e tente de novo." : "Não conseguimos registrar agora. Tente de novo.");
    }
  }

  function recomecar() {
    setConcluido(null);
    setEtapa(0);
    setAdversario(null);
    setGols([0, 0]);
    setData(hojeIso());
    setEstadio(null);
    setLugar({ setor: "", fila: "", cadeira: "" });
    setCompanhia([]);
    setFotos([]);
    setFrase("");
    setResultadoManual(null);
    setPublicar(dados.config.perfilPublico);
  }

  if (concluido) return <Celebracao concluido={concluido} onOutro={recomecar} onPublicar={() => {
    publicarPresenca(concluido.presenca.id);
    setConcluido({ ...concluido, publicada: true });
  }} />;

  const clubes = buscarClubes(buscaTime).filter((c) => c.sigla !== meuTime.sigla);
  const estadios = buscarEstadios(buscaEstadio).slice(0, buscaEstadio ? 12 : 6);
  const rascunho: Presenca | null =
    adversario && estadio
      ? { ...montar(), id: "rascunho", numero: dados.presencas.length + 1, criadaEm: "" }
      : null;

  return (
    <div className={s.checkin}>
      <div className={s.checkinTopo}>
        <div className={s.passos} aria-label={`Etapa ${etapa + 1} de ${ETAPAS.length}: ${ETAPAS[etapa]}`}>
          {ETAPAS.map((e, i) => (
            <span key={e} className={i <= etapa ? s.passoFeito : undefined} />
          ))}
        </div>
        <p className={s.passoNome}>
          {etapa + 1}/{ETAPAS.length} · {ETAPAS[etapa]}
        </p>
      </div>

      {etapa === 0 && (
        <>
          <h2 className={s.checkinTitulo}>Qual foi o jogo?</h2>
          <p className={s.textoSuave}>Vale jogo de hoje e jogo de anos atrás.</p>

          {rede.length > 0 && (
            <section className={s.bloco}>
              <h3 className={s.rotulo}>Jogos da sua torcida</h3>
              <div className={s.lista}>
                {rede.slice(0, 3).map(({ p, quem }) => (
                  <button key={p.id} type="button" className={s.opcaoJogo} onClick={() => usarJogoDaRede(p)}>
                    <CartaoPartida presenca={p} />
                    <span>{quem} esteve lá · Usar este jogo</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className={s.bloco}>
            <h3 className={s.rotulo}>{rede.length > 0 ? "Ou cadastre o jogo" : "Contra quem?"}</h3>
            {adversario ? (
              <div className={s.escolhido}>
                <IdentidadeTime time={meuTime} tamanho={32} />
                <span>×</span>
                <IdentidadeTime time={adversario} tamanho={32} mostrarNome />
                <button type="button" className={s.botaoTexto} onClick={() => setAdversario(null)}>
                  Trocar
                </button>
              </div>
            ) : (
              <>
                <label className={s.campo}>
                  <span className={s.somenteLeitor}>Buscar adversário</span>
                  <input type="search" placeholder="Buscar adversário por nome ou sigla" value={buscaTime} onChange={(e) => setBuscaTime(e.target.value)} />
                </label>
                <div className={s.gradeTimes}>
                  {clubes.slice(0, buscaTime ? 16 : 8).map((c) => (
                    <button key={c.sigla} type="button" onClick={() => setAdversario(identidadeDeClube(c.sigla))}>
                      <IdentidadeTime time={identidadeDeClube(c.sigla)!} tamanho={44} />
                      <span>{c.nome}</span>
                    </button>
                  ))}
                </div>
                <form
                  className={s.linhaCampo}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const nome = outroTime.trim();
                    if (nome.length < 2) return;
                    setAdversario({ nome, sigla: sugerirIniciais(nome).slice(0, 3) || "?", corPrincipal: "#1E2A22", corSegunda: "#F4EBD9" });
                  }}
                >
                  <input placeholder="Outro time (digite o nome)" value={outroTime} onChange={(e) => setOutroTime(e.target.value)} aria-label="Nome de outro time" />
                  <button type="submit" className={s.botaoPequeno} disabled={outroTime.trim().length < 2}>
                    Usar
                  </button>
                </form>
              </>
            )}
          </section>

          <section className={s.bloco}>
            <h3 className={s.rotulo}>Onde o {meuTime.nome} jogou?</h3>
            <div className={s.segmentado}>
              {(["casa", "fora", "neutro"] as const).map((m) => (
                <button key={m} type="button" aria-pressed={mando === m} onClick={() => setMando(m)}>
                  {m === "casa" ? "Em casa" : m === "fora" ? "Fora" : "Campo neutro"}
                </button>
              ))}
            </div>
          </section>

          <div className={s.duasColunas}>
            <label className={s.campo}>
              <span>Data</span>
              <input type="date" value={data} max={hojeIso()} min="1900-01-01" onChange={(e) => setData(e.target.value)} />
            </label>
            <label className={s.campo}>
              <span>Competição</span>
              <select value={competicao} onChange={(e) => setCompeticao(e.target.value)}>
                {COMPETICOES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <section className={s.bloco}>
            <h3 className={s.rotulo}>Placar</h3>
            <div className={s.placarEntrada}>
              <Contador rotulo={meuTime.sigla} valor={gols[0]} onChange={(v) => setGols([v, gols[1]])} />
              <span>×</span>
              <Contador rotulo={adversario?.sigla ?? "ADV"} valor={gols[1]} onChange={(v) => setGols([gols[0], v])} />
            </div>
          </section>
        </>
      )}

      {etapa === 1 && (
        <>
          <h2 className={s.checkinTitulo}>Onde você estava?</h2>
          {estadio ? (
            <div className={s.escolhido}>
              <strong>{estadio.nome}</strong>
              <span>
                {estadio.cidade} · {estadio.uf}
              </span>
              <button type="button" className={s.botaoTexto} onClick={() => setEstadio(null)}>
                Trocar
              </button>
            </div>
          ) : (
            <section className={s.bloco}>
              {sugestaoEstadio && (
                <button
                  type="button"
                  className={s.sugestao}
                  onClick={() => setEstadio({ id: sugestaoEstadio.id, nome: sugestaoEstadio.nome, cidade: sugestaoEstadio.cidade, uf: sugestaoEstadio.uf })}
                >
                  Foi no <strong>{sugestaoEstadio.nome}</strong>?
                </button>
              )}
              <label className={s.campo}>
                <span className={s.somenteLeitor}>Buscar estádio</span>
                <input type="search" placeholder="Buscar estádio ou cidade" value={buscaEstadio} onChange={(e) => setBuscaEstadio(e.target.value)} />
              </label>
              <div className={s.listaSimples}>
                {estadios.map((e) => (
                  <button key={e.id} type="button" onClick={() => setEstadio({ id: e.id, nome: e.nome, cidade: e.cidade, uf: e.uf })}>
                    <strong>{e.nome}</strong>
                    <span>
                      {e.cidade} · {e.uf}
                    </span>
                  </button>
                ))}
              </div>
              {outroEstadio.aberto ? (
                <form
                  className={s.cartao}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!outroEstadio.nome.trim() || !outroEstadio.cidade.trim()) return;
                    setEstadio({ nome: outroEstadio.nome.trim(), cidade: outroEstadio.cidade.trim(), uf: outroEstadio.uf });
                  }}
                >
                  <label className={s.campo}>
                    <span>Nome do estádio</span>
                    <input required value={outroEstadio.nome} onChange={(e) => setOutroEstadio({ ...outroEstadio, nome: e.target.value })} />
                  </label>
                  <div className={s.duasColunas}>
                    <label className={s.campo}>
                      <span>Cidade</span>
                      <input required value={outroEstadio.cidade} onChange={(e) => setOutroEstadio({ ...outroEstadio, cidade: e.target.value })} />
                    </label>
                    <label className={s.campo}>
                      <span>Estado</span>
                      <select value={outroEstadio.uf} onChange={(e) => setOutroEstadio({ ...outroEstadio, uf: e.target.value })}>
                        {UFS.map((u) => (
                          <option key={u}>{u}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <button type="submit" className={s.botao}>
                    Usar este estádio
                  </button>
                </form>
              ) : (
                <button type="button" className={s.botaoTexto} onClick={() => setOutroEstadio({ ...outroEstadio, aberto: true })}>
                  O estádio não está na lista
                </button>
              )}
            </section>
          )}

          <section className={s.bloco}>
            <h3 className={s.rotulo}>Seu lugar (se lembrar)</h3>
            <div className={s.tresColunas}>
              {(["setor", "fila", "cadeira"] as const).map((k) => (
                <label key={k} className={s.campo}>
                  <span>{k[0].toUpperCase() + k.slice(1)}</span>
                  <input value={lugar[k]} maxLength={20} onChange={(e) => setLugar({ ...lugar, [k]: e.target.value })} placeholder={k === "setor" ? "Leste" : k === "fila" ? "F" : "12"} />
                </label>
              ))}
            </div>
          </section>
        </>
      )}

      {etapa === 2 && (
        <>
          <h2 className={s.checkinTitulo}>Quem estava com você?</h2>
          <section className={s.bloco}>
            {amigos.length > 0 && (
              <div className={s.chips}>
                {amigos.map((a) => {
                  const marcado = companhia.some((c) => c.usuario === a.usuario);
                  return (
                    <button
                      key={a.usuario}
                      type="button"
                      aria-pressed={marcado}
                      onClick={() =>
                        marcado ? setCompanhia((l) => l.filter((c) => c.usuario !== a.usuario)) : adicionarCompanhia({ nome: a.nome, usuario: a.usuario })
                      }
                    >
                      {a.nome.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            )}
            <form
              className={s.linhaCampo}
              onSubmit={(e) => {
                e.preventDefault();
                adicionarCompanhia({ nome: nomeCompanhia });
                setNomeCompanhia("");
              }}
            >
              <input placeholder="Nome de quem foi com você" value={nomeCompanhia} onChange={(e) => setNomeCompanhia(e.target.value)} aria-label="Nome de quem foi com você" maxLength={40} />
              <button type="submit" className={s.botaoPequeno} disabled={!nomeCompanhia.trim()}>
                Adicionar
              </button>
            </form>
            {companhia.filter((c) => !c.usuario).length > 0 && (
              <div className={s.chips}>
                {companhia
                  .filter((c) => !c.usuario)
                  .map((c) => (
                    <button key={c.nome} type="button" aria-pressed onClick={() => setCompanhia((l) => l.filter((x) => x !== c))} aria-label={`Remover ${c.nome}`}>
                      {c.nome} <IconeFechar tamanho={14} />
                    </button>
                  ))}
              </div>
            )}
            {companhia.length === 0 && <p className={s.textoSuave}>Foi sozinho? Também vale. Pode pular.</p>}
          </section>

          <section className={s.bloco}>
            <h3 className={s.rotulo}>
              Fotos ({fotos.length}/{MAX_FOTOS})
            </h3>
            <div className={s.fotos}>
              {fotos.map((f, i) => (
                <div key={i} className={s.foto}>
                  <img src={f} alt={`Foto ${i + 1}`} />
                  <button type="button" onClick={() => setFotos((l) => l.filter((_, j) => j !== i))} aria-label={`Remover foto ${i + 1}`}>
                    <IconeFechar tamanho={16} />
                  </button>
                </div>
              ))}
              {fotos.length < MAX_FOTOS && (
                <label className={s.adicionarFoto}>
                  <IconeCamera />
                  <span>{lendoFotos ? "Abrindo…" : "Adicionar"}</span>
                  <input type="file" accept="image/*" multiple onChange={(e) => adicionarFotos(e.target.files)} disabled={lendoFotos} />
                </label>
              )}
            </div>
            {erroFoto && <p className={s.erroTexto}>{erroFoto}</p>}
          </section>
        </>
      )}

      {etapa === 3 && (
        <>
          <h2 className={s.checkinTitulo}>Como foi?</h2>
          <label className={s.campo}>
            <span>A frase do jogo</span>
            <textarea
              rows={3}
              maxLength={140}
              value={frase}
              onChange={(e) => setFrase(e.target.value)}
              placeholder="Ex.: Empate fora de casa também é história."
            />
            <small className={s.contagem}>{frase.length}/140</small>
          </label>

          <section className={s.bloco}>
            <h3 className={s.rotulo}>Resultado para o {meuTime.nome}</h3>
            <div className={s.resultados}>
              {(["V", "E", "D"] as const).map((r) => (
                <button key={r} type="button" aria-pressed={resultado === r} onClick={() => setResultadoManual(r === resultadoDoJogo ? null : r)}>
                  <SeloPresenca resultado={r} tamanho={44} />
                  <span>{NOME_RESULTADO[r]}</span>
                </button>
              ))}
            </div>
            <p className={s.textoSuave}>
              Pelo placar ({gols[0]} × {gols[1]}), foi {NOME_RESULTADO[resultadoDoJogo].toLowerCase()}.
              {resultadoManual && " Você marcou diferente (pênaltis, W.O.…)."}
            </p>
          </section>
        </>
      )}

      {etapa === 4 && rascunho && (
        <>
          <h2 className={s.checkinTitulo}>Tudo certo?</h2>
          <Ingresso presenca={rascunho} />
          <CartaoPartida presenca={rascunho} />
          <dl className={s.resumoLista}>
            <div>
              <dt>Data</dt>
              <dd>{formatarData(data)}</dd>
            </div>
            <div>
              <dt>Companhia</dt>
              <dd>{companhia.length ? companhia.map((c) => c.nome).join(", ") : "—"}</dd>
            </div>
            <div>
              <dt>Fotos</dt>
              <dd>{fotos.length || "—"}</dd>
            </div>
            <div>
              <dt>Frase</dt>
              <dd>{frase.trim() ? `“${frase.trim()}”` : "—"}</dd>
            </div>
          </dl>
          <label className={s.alternar}>
            <span>
              <strong>Compartilhar na Torcida</strong>
              <small>
                {dados.config.perfilPublico
                  ? "Quem te acompanha vê esse jogo no Início."
                  : "Seu perfil está privado: o jogo fica só com você até você abrir o perfil em Configurações."}
              </small>
            </span>
            <input type="checkbox" role="switch" checked={publicar} onChange={(e) => setPublicar(e.target.checked)} />
          </label>
          {erro && <p className={s.erroTexto} role="alert">{erro}</p>}
        </>
      )}

      <div className={s.checkinAcoes}>
        {etapa > 0 && (
          <button type="button" className={s.botaoVoltar} onClick={() => setEtapa(etapa - 1)} aria-label="Etapa anterior">
            <IconeVoltar />
          </button>
        )}
        {etapa < ETAPAS.length - 1 ? (
          <button type="button" className={s.botao} disabled={!etapaValida} onClick={() => setEtapa(etapa + 1)}>
            {etapa === 2 && companhia.length === 0 && fotos.length === 0 ? "Pular" : "Continuar"}
          </button>
        ) : (
          <button type="button" className={`${s.botao} ${s.botaoOuro}`} onClick={confirmar}>
            Registrar presença
          </button>
        )}
      </div>
    </div>
  );
}

function Contador({ rotulo, valor, onChange }: { rotulo: string; valor: number; onChange: (v: number) => void }) {
  return (
    <div className={s.contador2}>
      <span>{rotulo}</span>
      <div>
        <button type="button" onClick={() => onChange(Math.max(0, valor - 1))} aria-label={`Menos um gol para ${rotulo}`}>
          −
        </button>
        <strong aria-live="polite">{valor}</strong>
        <button type="button" onClick={() => onChange(Math.min(30, valor + 1))} aria-label={`Mais um gol para ${rotulo}`}>
          +
        </button>
      </div>
    </div>
  );
}

function Celebracao({ concluido, onOutro, onPublicar }: { concluido: Concluido; onOutro: () => void; onPublicar: () => void }) {
  const { presenca, novidades, publicada } = concluido;
  return (
    <div className={s.celebracao}>
      <SeloPresenca resultado={presenca.resultado} tamanho={84} />
      <p className={s.celebracaoNumero}>{numeroPresenca(presenca.numero)}</p>
      <h2>Você estava lá.</h2>
      <p className={s.textoSuave}>
        {presenca.resultado === "E" && presenca.partida.mando === "fora"
          ? "Empate fora de casa também é história."
          : `Sua ${presenca.numero}ª presença está guardada.`}
      </p>

      <Ingresso presenca={presenca} />

      {(novidades.estadioNovo || novidades.nivel || novidades.conquistas.length > 0) && (
        <section className={s.novidades}>
          <h3 className={s.rotulo}>Destravado agora</h3>
          {novidades.nivel && (
            <p className={s.novoNivel}>
              Agora você é <strong>{novidades.nivel.nome}</strong>.
            </p>
          )}
          {novidades.estadioNovo && presenca.estadio.id && estadioPorId(presenca.estadio.id) && (
            <div className={s.novoAdesivo}>
              <AdesivoEstadio estadio={estadioPorId(presenca.estadio.id)!} desbloqueado indice={presenca.numero} />
              <span>Sticker novo no seu álbum.</span>
            </div>
          )}
          {novidades.estadioNovo && !presenca.estadio.id && <p className={s.novoNivel}>Estádio novo no seu histórico: {presenca.estadio.nome}.</p>}
          {novidades.conquistas.map((c) => (
            <SeloConquista key={c.id} status={{ conquista: c, valor: c.meta, desbloqueada: true, progresso: 1 }} />
          ))}
        </section>
      )}

      <div className={s.lista}>
        {publicada ? (
          <Link href="/inicio" className={s.botao}>
            Ver na Torcida
          </Link>
        ) : (
          <button type="button" className={s.botao} onClick={onPublicar}>
            Compartilhar na Torcida
          </button>
        )}
        <Link href={`/colecao/partida/${presenca.id}`} className={`${s.botao} ${s.botaoVazado}`}>
          Ver na coleção
        </Link>
        <button type="button" className={s.botaoTexto} onClick={onOutro}>
          Registrar outro jogo
        </button>
      </div>
    </div>
  );
}

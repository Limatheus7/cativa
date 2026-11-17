"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTime } from "@/components/app/TimeProvider";
import { buscarEstadios, estadioDeCasa, estadioPorId } from "@/lib/dados/estadios";
import { NOME_RESULTADO, resultadoDoPlacar } from "@/lib/dados/estatisticas";
import { formatarData, numeroPresenca } from "@/lib/dados/formato";
import { reduzirFoto } from "@/lib/dados/imagens";
import { publicarPresenca, registrarPresenca, registrarVisita, SemEspacoError, useLoja, type Novidades } from "@/lib/dados/loja";
import { TORCEDORES_DEMONSTRACAO } from "@/lib/dados/mock/torcedores";
import type { DadosDoTorcedor, EstadioDaPresenca, IdentidadeDoTime, Mando, MotivoDaVisita, Presenca, Resultado, Visita } from "@/lib/dados/tipos";
import { CLUBES, buscarClubes } from "@/lib/times";
import { sugerirIniciais } from "@/lib/time";
import { IdentidadeTime, paraIdentidade } from "./Basicos";
import Gaveta from "./Gaveta";
import { IconeCamera, IconeFechar } from "./Icones";
import { usePresenca } from "./PresencaProvider";
import { AdesivoEstadio, Ingresso, SeloConquista } from "./Registros";
import TicketVisita from "./TicketVisita";
import EscolhaModelo, { Miniatura } from "./compartilhar/EscolhaModelo";
import { modelosDisponiveis } from "./compartilhar/Modelos";
import type { DadosCompartilhar } from "./compartilhar/tipos";
import p from "./Presenca.module.css";
import { FASES, temMataMata } from "@/lib/dados/ingressos";

const COMPETICOES = ["Brasileirão", "Copa do Brasil", "Estadual", "Libertadores", "Sul-Americana", "Série B", "Série C", "Amistoso", "Outra"];
const UFS = "AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO".split(" ");
type TipoDeVisita = "jogo" | "visita";
const ETAPAS_JOGO = ["O jogo", "O lugar", "A memória"];
// Turismo no estádio: sem jogo, então sem placar, lugar nem resultado.
const ETAPAS_VISITA = ["O estádio", "A memória"];
const MOTIVOS: MotivoDaVisita[] = ["Tour", "Museu", "Show", "Evento", "Só passei lá"];
const MAX_FOTOS = 4;

const FRASES: Record<"V" | "E" | "D" | "visita", string[]> = {
  V: ["Clássico é nosso.", "Que noite no {estádio}!", "Vitória com a nação."],
  E: ["Empate com gosto de história.", "Ponto suado.", "Faltou pouco."],
  D: ["Fica pro próximo.", "Mesmo assim, eu estava lá.", "Torcida não perde."],
  visita: ["Primeira vez aqui.", "Que estádio!", "Um dia volto pra ver jogo."],
};

function paraIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const hojeIso = () => paraIso(new Date());
function ontemIso() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return paraIso(d);
}

function vibrar(ms = 8) {
  if (typeof navigator !== "undefined") navigator.vibrate?.(ms);
}

function identidadeDeClube(sigla: string): IdentidadeDoTime | null {
  const c = CLUBES.find((x) => x.sigla === sigla);
  return c ? { nome: c.nome, sigla: c.sigla, corPrincipal: c.corPrincipal, corSegunda: c.corSegunda, padrao: c.padrao, faixas: c.faixas } : null;
}

/** Jogos da sua rede que envolvem o seu time: atalho para "selecionar uma partida existente". */
function jogosDaRede(dados: DadosDoTorcedor, minhaSigla: string) {
  const vistos = new Set<string>();
  return TORCEDORES_DEMONSTRACAO.filter((t) => dados.seguindo.includes(t.usuario))
    .flatMap((t) => t.presencas.map((pr) => ({ p: pr, quem: t.nome.split(" ")[0] })))
    .filter(({ p: pr }) => pr.time.sigla === minhaSigla || pr.partida.adversario.sigla === minhaSigla)
    // Jogo que você já registrou não aparece de novo.
    .filter(({ p: pr }) => !dados.presencas.some((m) => m.partida.data === pr.partida.data && m.estadio.nome === pr.estadio.nome))
    .filter(({ p: pr }) => {
      const chave = `${pr.partida.data}|${pr.estadio.nome}`;
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    })
    .sort((a, b) => b.p.partida.data.localeCompare(a.p.partida.data));
}

type Concluido =
  | { tipo: "jogo"; presenca: Presenca; novidades: Novidades; publicada: boolean }
  | { tipo: "visita"; visita: Visita; estadioNovo: boolean; publicada: boolean };

// ---------------------------------------------------------------- Peças pequenas

function Segmentado<T extends string>({ opcoes, valor, onChange, rotulo }: { opcoes: { v: T; r: string }[]; valor: T; onChange: (v: T) => void; rotulo: string }) {
  const i = Math.max(0, opcoes.findIndex((o) => o.v === valor));
  return (
    <div className={p.segmentado} style={{ ["--n" as string]: opcoes.length, ["--i" as string]: i }} role="group" aria-label={rotulo}>
      <span className={p.pilula} aria-hidden="true" />
      {opcoes.map((o) => (
        <button key={o.v} type="button" aria-pressed={valor === o.v} onClick={() => onChange(o.v)}>
          {o.r}
        </button>
      ))}
    </div>
  );
}

/** Painel que abre e fecha com grid-template-rows (sem animar altura). */
function Recolhivel({ aberto, children }: { aberto: boolean; children: React.ReactNode }) {
  return (
    <div className={p.painel} data-aberto={aberto ? "" : undefined} aria-hidden={!aberto} inert={!aberto}>
      <div>
        <div className={p.painelMiolo}>{children}</div>
      </div>
    </div>
  );
}

/** Número que rola: sobe quando aumenta, desce quando diminui. */
function Rolo({ valor }: { valor: number }) {
  const antes = useRef(valor);
  const dir = valor >= antes.current ? p.sobe : p.desce;
  useEffect(() => {
    antes.current = valor;
  }, [valor]);
  return (
    <div className={p.rolo} aria-live="polite">
      <span key={valor} className={dir}>
        {valor}
      </span>
    </div>
  );
}

function Contador({ time, valor, onChange }: { time: IdentidadeDoTime | null; valor: number; onChange: (v: number) => void }) {
  const sigla = time?.sigla ?? "ADV";
  return (
    <div className={p.lado}>
      {time ? <IdentidadeTime time={time} tamanho={30} /> : <span className={p.avulso} style={{ width: 30, height: 30 }}>?</span>}
      <div className={p.contador}>
        <button type="button" onClick={() => onChange(Math.max(0, valor - 1))} aria-label={`Menos um gol para ${sigla}`}>
          −
        </button>
        <Rolo valor={valor} />
        <button type="button" onClick={() => onChange(Math.min(30, valor + 1))} aria-label={`Mais um gol para ${sigla}`}>
          +
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Montagem na camada do app

/** Montada uma vez no layout: o botão central abre a gaveta por cima da tela atual. */
export function PresencaGaveta() {
  const { status, dados } = useLoja();
  if (status === "carregando" || status === "erro") return null;
  return <CheckIn dados={dados} />;
}

// ---------------------------------------------------------------- Fluxo

export default function CheckIn({ dados }: { dados: DadosDoTorcedor }) {
  const { aberta, fechar, abrir, origem } = usePresenca();
  const meuTime = paraIdentidade(useTime());
  const [etapa, setEtapa] = useState(0);
  const [direcao, setDirecao] = useState<1 | -1>(1);
  const [tipo, setTipo] = useState<TipoDeVisita>("jogo");
  const [motivo, setMotivo] = useState<MotivoDaVisita | null>(null);
  const ETAPAS = tipo === "jogo" ? ETAPAS_JOGO : ETAPAS_VISITA;
  const nome = ETAPAS[etapa];
  const rolagem = useRef<HTMLDivElement>(null);

  // O jogo
  const [adversario, setAdversario] = useState<IdentidadeDoTime | null>(null);
  const [buscaTime, setBuscaTime] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [outraData, setOutraData] = useState(false);
  const [mando, setMando] = useState<Mando>("casa");
  const [data, setData] = useState(hojeIso());
  const [competicao, setCompeticao] = useState(COMPETICOES[0]);
  const [fase, setFase] = useState("");
  const [faseAberta, setFaseAberta] = useState(false);
  const [gols, setGols] = useState<[number, number]>([0, 0]);
  const [penaltis, setPenaltis] = useState<"G" | "P" | null>(null);

  // O lugar
  const [estadio, setEstadio] = useState<EstadioDaPresenca | null>(null);
  const [sugerido, setSugerido] = useState(false);
  const recusouSugestao = useRef(false);
  const [buscaEstadio, setBuscaEstadio] = useState("");
  const [outroEstadio, setOutroEstadio] = useState({ aberto: false, nome: "", cidade: "", uf: "SP" });
  const [lugar, setLugar] = useState({ setor: "", fila: "", cadeira: "" });
  const [filaAberta, setFilaAberta] = useState(false);

  // A memória
  const [fotos, setFotos] = useState<string[]>([]);
  const [lendoFotos, setLendoFotos] = useState(false);
  const [erroFoto, setErroFoto] = useState("");
  const [frase, setFrase] = useState("");
  const [publicar, setPublicar] = useState(dados.config.perfilPublico);
  const [erro, setErro] = useState("");
  const [concluido, setConcluido] = useState<Concluido | null>(null);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  // /presenca?estadio=maracana (vindo da página do estádio) já marca o estádio.
  useEffect(() => {
    if (!aberta) return;
    const id = new URLSearchParams(window.location.search).get("estadio");
    const e = estadioPorId(id ?? undefined);
    if (e && !estadio) {
      setEstadio({ id: e.id, nome: e.nome, cidade: e.cidade, uf: e.uf });
      setSugerido(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberta]);

  const empate = gols[0] === gols[1];
  const pen = empate ? penaltis : null;
  const resultadoDoJogo = resultadoDoPlacar(gols[0], gols[1]);
  const resultado: Resultado = pen ? (pen === "G" ? "V" : "D") : resultadoDoJogo;
  const rede = useMemo(() => jogosDaRede(dados, meuTime.sigla), [dados, meuTime.sigla]);
  const sugestaoEstadio = mando === "casa" ? estadioDeCasa(meuTime.sigla) : mando === "fora" ? estadioDeCasa(adversario?.sigla) : undefined;

  // O estádio já vem escolhido pelo mandante ao chegar em "O lugar".
  useEffect(() => {
    if (tipo !== "jogo" || nome !== "O lugar" || estadio || recusouSugestao.current || !sugestaoEstadio) return;
    setEstadio({ id: sugestaoEstadio.id, nome: sugestaoEstadio.nome, cidade: sugestaoEstadio.cidade, uf: sugestaoEstadio.uf });
    setSugerido(true);
  }, [tipo, nome, estadio, sugestaoEstadio]);

  const temDados = !!adversario || !!estadio;

  function irPara(n: number) {
    setDirecao(n >= etapa ? 1 : -1);
    setEtapa(n);
    rolagem.current?.scrollTo({ top: 0 });
  }

  function trocarTipo(t: TipoDeVisita) {
    if (t === tipo) return;
    setTipo(t);
    setDirecao(-1);
    setEtapa(0);
    setSugerido(false);
  }

  function mudarGols(novo: [number, number]) {
    if (novo[0] !== gols[0] || novo[1] !== gols[1]) vibrar();
    setGols(novo);
    if (novo[0] !== novo[1]) setPenaltis(null);
  }

  function escolherAdversario(a: IdentidadeDoTime | null) {
    setAdversario(a);
    setBuscando(false);
    setBuscaTime("");
  }

  function usarJogoDaRede(pr: Presenca) {
    vibrar();
    const meuLadoEhOTime = pr.time.sigla === meuTime.sigla;
    escolherAdversario(meuLadoEhOTime ? pr.partida.adversario : pr.time);
    const m = pr.partida.mando;
    setMando(meuLadoEhOTime ? m : m === "casa" ? "fora" : m === "fora" ? "casa" : "neutro");
    setData(pr.partida.data);
    setOutraData(pr.partida.data !== hojeIso() && pr.partida.data !== ontemIso());
    setCompeticao(COMPETICOES.includes(pr.partida.competicao) ? pr.partida.competicao : "Outra");
    setFase(pr.partida.fase ?? "");
    setGols(meuLadoEhOTime ? [pr.partida.golsTime, pr.partida.golsAdversario] : [pr.partida.golsAdversario, pr.partida.golsTime]);
    setPenaltis(null);
    setEstadio(pr.estadio);
    setSugerido(false);
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

  const dataOk = !!data && data <= hojeIso();
  const etapaValida =
    nome === "O jogo" ? !!adversario && dataOk
    : nome === "O lugar" ? !!estadio
    : nome === "O estádio" ? !!estadio && dataOk
    : !lendoFotos;

  function montar() {
    return {
      time: meuTime,
      partida: { data, competicao, fase: fase || undefined, mando, adversario: adversario!, golsTime: gols[0], golsAdversario: gols[1] },
      estadio: estadio!,
      lugar: lugar.setor || lugar.fila || lugar.cadeira ? lugar : undefined,
      companhia: [],
      fotos,
      frase: frase.trim(),
      resultado,
    };
  }

  function confirmar() {
    setErro("");
    try {
      if (tipo === "visita") {
        const r = registrarVisita({ data, estadio: estadio!, motivo: motivo ?? undefined, fotos, frase: frase.trim() }, publicar);
        setConcluido({ tipo: "visita", ...r, publicada: publicar });
      } else {
        const r = registrarPresenca(montar(), publicar);
        setConcluido({ tipo: "jogo", ...r, publicada: publicar });
      }
      vibrar(12);
    } catch (e) {
      setErro(e instanceof SemEspacoError ? "Não coube no aparelho. Tire uma ou duas fotos e tente de novo." : "Não conseguimos registrar agora. Tente de novo.");
    }
  }

  function zerar() {
    setConcluido(null);
    setConfirmandoSaida(false);
    setEtapa(0);
    setDirecao(1);
    setTipo("jogo");
    setMotivo(null);
    setOutraData(false);
    setAdversario(null);
    setBuscando(false);
    setBuscaTime("");
    setMando("casa");
    setCompeticao(COMPETICOES[0]);
    setFase("");
    setFaseAberta(false);
    setGols([0, 0]);
    setPenaltis(null);
    setData(hojeIso());
    setEstadio(null);
    setSugerido(false);
    recusouSugestao.current = false;
    setOutroEstadio({ aberto: false, nome: "", cidade: "", uf: "SP" });
    setLugar({ setor: "", fila: "", cadeira: "" });
    setFilaAberta(false);
    setFotos([]);
    setErroFoto("");
    setFrase("");
    setErro("");
    setPublicar(dados.config.perfilPublico);
  }

  /** Pedido de fechar (véu, Esc, arrastar, ×): com dados preenchidos, pergunta antes. */
  function pedirFechar() {
    if (confirmandoSaida) return;
    if (temDados) setConfirmandoSaida(true);
    else fechar();
  }

  function descartar() {
    fechar();
    // zera depois da saída, para o conteúdo não piscar vazio durante a animação
    setTimeout(zerar, 400);
  }

  // ------------------------------------------------------------ Derivados de tela

  const clubes = buscarClubes(buscaTime).filter((c) => c.sigla !== meuTime.sigla);
  const estadios = buscarEstadios(buscaEstadio).slice(0, buscaEstadio ? 12 : 6);
  const termoBusca = buscaTime.trim();
  const usarTermo = () => escolherAdversario({ nome: termoBusca, sigla: sugerirIniciais(termoBusca).slice(0, 3) || "?", corPrincipal: "#1E2A22", corSegunda: "#F4EBD9" });
  const topClubes = clubes.slice(0, 5).map((c) => identidadeDeClube(c.sigla)!);
  const escudos = adversario && !topClubes.some((c) => c.sigla === adversario.sigla) ? [adversario, ...topClubes.slice(0, 4)] : topClubes;
  const numero = dados.presencas.length + 1;
  const numeroVisita = dados.presencas.length + dados.visitas.length + 1;

  // Ingresso de sempre (com a arte da competição), montado junto: o que falta aparece em aberto.
  const vazio = { nome: "", cidade: "", uf: "" };
  const previaIngresso = {
    id: "previa",
    numero,
    criadaEm: "",
    time: meuTime,
    partida: {
      data,
      competicao,
      fase: fase || undefined,
      mando,
      adversario: adversario ?? { nome: "Adversário", sigla: "?", corPrincipal: "#1E2A22", corSegunda: "#F4EBD9" },
      golsTime: gols[0],
      golsAdversario: gols[1],
    },
    estadio: estadio ?? vazio,
    lugar: lugar.setor || lugar.fila || lugar.cadeira ? lugar : undefined,
    companhia: [],
    fotos: [],
    frase: "",
    resultado,
  } as Presenca;
  const previaVisita = { numero: numeroVisita, data, estadio: estadio ?? vazio, motivo: motivo ?? undefined };

  const quando = (rotulo: string) => (
    <section className={p.etapa} style={{ gap: 8 }}>
      <h3 className={p.rotulo}>Quando</h3>
      <div className={p.chips}>
        {([
          ["Hoje", !outraData && data === hojeIso(), () => (setOutraData(false), setData(hojeIso()))],
          ["Ontem", !outraData && data === ontemIso(), () => (setOutraData(false), setData(ontemIso()))],
          [outraData && data !== hojeIso() && data !== ontemIso() ? `📅 ${formatarData(data)}` : "📅 Outra data", outraData, () => setOutraData(true)],
        ] as const).map(([r, ativo, aoTocar]) => (
          <button key={r} type="button" aria-pressed={ativo} onClick={aoTocar}>
            {r}
          </button>
        ))}
      </div>
      {outraData && (
        <label>
          <span className="sr-only" style={{ position: "absolute", opacity: 0 }}>{tipo === "jogo" ? "Data do jogo" : "Data da visita"}</span>
          <input className={p.campoData} type="date" value={data} max={hojeIso()} min="1900-01-01" onChange={(e) => setData(e.target.value)} />
        </label>
      )}
    </section>
  );

  const seletorEstadio = estadio ? (
    <>
      <div className={p.estadioCartao}>
        {estadioPorId(estadio.id)?.arte && <img src={estadioPorId(estadio.id)!.arte} alt="" />}
        <div>
          <small>ESTÁDIO</small>
          <strong>{estadio.nome}</strong>
          <span>
            {estadio.cidade} · {estadio.uf}
          </span>
        </div>
        <button
          type="button"
          className={p.link}
          onClick={() => {
            recusouSugestao.current = true;
            setSugerido(false);
            setEstadio(null);
          }}
        >
          Trocar
        </button>
      </div>
      {sugerido && sugestaoEstadio && estadio.id === sugestaoEstadio.id && (
        <p className={p.suave}>Sugerido porque o {meuTime.nome} jogou em casa.</p>
      )}
    </>
  ) : (
    <section className={p.buscaTimes}>
      <label>
        <span style={{ position: "absolute", opacity: 0 }}>Buscar estádio</span>
        <input type="search" placeholder="Buscar estádio ou cidade" value={buscaEstadio} onChange={(e) => setBuscaEstadio(e.target.value)} />
      </label>
      <div className={p.listaEstadios}>
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
          className={p.etapa}
          onSubmit={(e) => {
            e.preventDefault();
            if (!outroEstadio.nome.trim() || !outroEstadio.cidade.trim()) return;
            setEstadio({ nome: outroEstadio.nome.trim(), cidade: outroEstadio.cidade.trim(), uf: outroEstadio.uf });
          }}
        >
          <label className={p.campoTexto}>
            Nome do estádio
            <input required value={outroEstadio.nome} onChange={(e) => setOutroEstadio({ ...outroEstadio, nome: e.target.value })} />
          </label>
          <div className={p.duas}>
            <label className={p.campoTexto}>
              Cidade
              <input required value={outroEstadio.cidade} onChange={(e) => setOutroEstadio({ ...outroEstadio, cidade: e.target.value })} />
            </label>
            <label className={p.campoTexto}>
              Estado
              <select className={p.campoData} value={outroEstadio.uf} onChange={(e) => setOutroEstadio({ ...outroEstadio, uf: e.target.value })}>
                {UFS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit" className={p.cta}>
            Usar este estádio
          </button>
        </form>
      ) : (
        <button type="button" className={p.link} style={{ alignSelf: "flex-start" }} onClick={() => setOutroEstadio({ ...outroEstadio, aberto: true })}>
          O estádio não está na lista
        </button>
      )}
    </section>
  );

  const frasesSugeridas = (tipo === "visita" ? FRASES.visita : FRASES[resultado]).map((f) => f.replace("{estádio}", estadio?.nome ?? "estádio"));

  // ------------------------------------------------------------ Etapas

  const conteudo = (
    <div key={`${tipo}-${etapa}`} className={`${p.etapa} ${direcao > 0 ? p.vaiDireita : p.vaiEsquerda}`}>
      {etapa === 0 && (
        <Segmentado
          rotulo="Tipo de presença"
          valor={tipo}
          onChange={trocarTipo}
          opcoes={[
            { v: "jogo", r: "Vi um jogo" },
            { v: "visita", r: "Turismo no estádio" },
          ]}
        />
      )}

      {nome === "O jogo" && (
        <>
          <div className={p.recolhe} data-fechado={adversario ? "" : undefined} aria-hidden={!!adversario}>
            <div>
              {rede.length > 0 && (
                <section className={p.etapa} style={{ gap: 8 }}>
                  <h3 className={p.rotulo}>Da sua torcida</h3>
                  {rede.slice(0, 2).map(({ p: pr, quem }) => {
                    const meuLado = pr.time.sigla === meuTime.sigla;
                    const adv = meuLado ? pr.partida.adversario : pr.time;
                    return (
                      <div key={pr.id} className={p.sugestaoCartao}>
                        <IdentidadeTime time={adv} tamanho={30} />
                        <div>
                          <strong>
                            {meuTime.sigla} × {adv.sigla}
                          </strong>
                          <small>
                            {quem} esteve lá · {formatarData(pr.partida.data)} · {pr.estadio.nome}
                          </small>
                        </div>
                        <button type="button" onClick={() => usarJogoDaRede(pr)} tabIndex={adversario ? -1 : 0}>
                          Usar
                        </button>
                      </div>
                    );
                  })}
                </section>
              )}
              <div className={p.divisoria}>{rede.length > 0 ? "OU MONTE O JOGO" : "MONTE O JOGO"}</div>
            </div>
          </div>

          <h3 className={p.titulo}>Contra quem?</h3>
          <div className={p.escudos}>
            {escudos.map((c) => (
              <button key={c.sigla} type="button" className={p.escudo} aria-pressed={adversario?.sigla === c.sigla} onClick={() => escolherAdversario(c)}>
                <IdentidadeTime time={c} tamanho={44} />
                <span>{c.nome}</span>
              </button>
            ))}
            <button type="button" className={p.escudo} aria-pressed={buscando} onClick={() => setBuscando((b) => !b)}>
              <span className={p.buscar} aria-hidden="true">⌕</span>
              <span>Buscar</span>
            </button>
          </div>
          {buscando && (
            <div className={p.buscaTimes}>
              <label>
                <span style={{ position: "absolute", opacity: 0 }}>Buscar adversário</span>
                <input autoFocus type="search" placeholder="Nome ou sigla do time" value={buscaTime} onChange={(e) => setBuscaTime(e.target.value)} />
              </label>
              <div className={p.escudos} style={{ flexWrap: "wrap", overflow: "visible" }}>
                {clubes.slice(0, buscaTime ? 16 : 10).map((c) => (
                  <button key={c.sigla} type="button" className={p.escudo} onClick={() => escolherAdversario(identidadeDeClube(c.sigla))}>
                    <IdentidadeTime time={identidadeDeClube(c.sigla)!} tamanho={44} />
                    <span>{c.nome}</span>
                  </button>
                ))}
                {termoBusca.length >= 2 && !clubes.some((c) => c.nome.toLowerCase() === termoBusca.toLowerCase()) && (
                  <button type="button" className={p.escudo} onClick={usarTermo}>
                    <span className={p.avulso}>{sugerirIniciais(termoBusca).slice(0, 3) || "?"}</span>
                    <span>Usar “{termoBusca}”</span>
                  </button>
                )}
              </div>
              <p className={p.suave}>Não achou? Digite o nome e use como está.</p>
            </div>
          )}

          {adversario && (
            <>
              <section className={p.etapa} style={{ gap: 8 }}>
                <h3 className={p.rotulo}>Placar</h3>
                <div className={p.placarCartao}>
                  <Contador time={meuTime} valor={gols[0]} onChange={(n) => mudarGols([n, gols[1]])} />
                  <span className={p.vezes} aria-hidden="true">×</span>
                  <Contador time={adversario} valor={gols[1]} onChange={(n) => mudarGols([gols[0], n])} />
                </div>
                <div className={`${p.faixa} ${resultado === "E" ? p.faixaE : resultado === "D" ? p.faixaD : ""}`} role="status">
                  <span className={p.faixaSelo} aria-hidden="true">
                    <span key={resultado}>{resultado}</span>
                  </span>
                  {resultado === "V" ? `Vitória do ${meuTime.nome}` : resultado === "D" ? `Derrota do ${meuTime.nome}` : "Empate"}
                  <em>{pen ? "nos pênaltis" : "pelo placar"}</em>
                </div>
                <div className={p.painel} data-aberto={empate ? "" : undefined} aria-hidden={!empate} inert={!empate}>
                  <div>
                    <div className={p.penaltis} style={{ marginTop: 2 }}>
                      <p className={p.suave} style={{ marginBottom: 8 }}>Teve pênaltis?</p>
                      <div className={p.chips}>
                        {([["G", "Ganhamos"], ["P", "Perdemos"], [null, "Não teve"]] as const).map(([k, r]) => (
                          <button key={r} type="button" aria-pressed={pen === k} onClick={() => setPenaltis(k)}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className={p.etapa} style={{ gap: 8 }}>
                <h3 className={p.rotulo}>Onde o {meuTime.nome} jogou</h3>
                <Segmentado
                  rotulo="Mando de campo"
                  valor={mando}
                  onChange={setMando}
                  opcoes={[{ v: "casa", r: "Em casa" }, { v: "fora", r: "Fora" }, { v: "neutro", r: "Neutro" }]}
                />
              </section>

              {quando("")}

              <section className={p.etapa} style={{ gap: 8 }}>
                <h3 className={p.rotulo}>Competição</h3>
                <div className={`${p.chips} ${p.rolagem}`}>
                  {COMPETICOES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={competicao === c}
                      onClick={() => {
                        setCompeticao(c);
                        if (!temMataMata(c)) {
                          setFase("");
                          setFaseAberta(false);
                        }
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </section>

              {temMataMata(competicao) && (
                <section>
                  <button type="button" className={p.gatilho} aria-expanded={faseAberta} onClick={() => setFaseAberta((a) => !a)}>
                    <span>
                      {/libertadores|sul-americana/i.test(competicao) ? "Qual foi a fase?" : "Foi final ou mata-mata?"} <small>{fase ? `· ${fase}` : "· Opcional"}</small>
                    </span>
                    <span className={p.mais} aria-hidden="true">+</span>
                  </button>
                  <Recolhivel aberto={faseAberta}>
                    <div className={`${p.chips} ${p.rolagem}`}>
                      {["", ...FASES].map((f) => (
                        <button key={f || "comum"} type="button" aria-pressed={fase === f} onClick={() => setFase(f)}>
                          {f || (/libertadores|sul-americana/i.test(competicao) ? "Fase de grupos" : "Jogo comum")}
                        </button>
                      ))}
                    </div>
                  </Recolhivel>
                </section>
              )}
            </>
          )}
        </>
      )}

      {nome === "O lugar" && (
        <>
          <h3 className={p.titulo}>Onde você ficou?</h3>
          {seletorEstadio}

          <section className={p.etapa} style={{ gap: 8 }}>
            <label className={p.campoTexto}>
              <span className={p.rotulo}>
                Setor <small>opcional</small>
              </span>
              <input
                value={lugar.setor}
                maxLength={30}
                placeholder="Ex.: Arquibancada, Cadeira Especial, Norte"
                onChange={(e) => setLugar({ ...lugar, setor: e.target.value })}
              />
            </label>
          </section>

          <section>
            <button type="button" className={p.gatilho} aria-expanded={filaAberta} onClick={() => setFilaAberta((a) => !a)}>
              <span>
                Fila e cadeira{" "}
                <small>
                  {!filaAberta && (lugar.fila || lugar.cadeira)
                    ? `· ${[lugar.fila && `Fila ${lugar.fila}`, lugar.cadeira && `Cadeira ${lugar.cadeira}`].filter(Boolean).join(" · ")}`
                    : "· Se você lembrar"}
                </small>
              </span>
              <span className={p.mais} aria-hidden="true">+</span>
            </button>
            <Recolhivel aberto={filaAberta}>
              <div className={p.duas}>
                {(["fila", "cadeira"] as const).map((k) => (
                  <label key={k} className={p.campoTexto}>
                    {k[0].toUpperCase() + k.slice(1)}
                    <input value={lugar[k]} maxLength={20} onChange={(e) => setLugar({ ...lugar, [k]: e.target.value })} placeholder={k === "fila" ? "F" : "12"} />
                  </label>
                ))}
              </div>
            </Recolhivel>
          </section>
        </>
      )}

      {nome === "O estádio" && (
        <>
          <h3 className={p.titulo}>Qual estádio você visitou?</h3>
          {seletorEstadio}
          {quando("")}
          <section className={p.etapa} style={{ gap: 8 }}>
            <h3 className={p.rotulo}>
              O que rolou <small>opcional</small>
            </h3>
            <div className={p.chips}>
              {MOTIVOS.map((m) => (
                <button key={m} type="button" aria-pressed={motivo === m} onClick={() => setMotivo(motivo === m ? null : m)}>
                  {m}
                </button>
              ))}
            </div>
            <p className={p.suave}>Visita conta como estádio conhecido. Não entra em jogos, vitórias nem derrotas.</p>
          </section>
        </>
      )}

      {nome === "A memória" && (
        <>
          <h3 className={p.titulo}>O que fica desse dia?</h3>
          <section className={p.etapa} style={{ gap: 8 }}>
            <h3 className={p.rotulo}>
              Fotos <small>até {MAX_FOTOS}</small>
            </h3>
            <div className={p.fotos}>
              {fotos.map((f, i) => (
                <div key={f.slice(-24) + i} className={p.foto}>
                  <img src={f} alt={`Foto ${i + 1}`} />
                  <button type="button" onClick={() => setFotos((l) => l.filter((_, j) => j !== i))} aria-label={`Remover foto ${i + 1}`}>
                    <IconeFechar tamanho={12} />
                  </button>
                </div>
              ))}
              {fotos.length < MAX_FOTOS && (
                <label className={p.adicionar}>
                  <IconeCamera />
                  <span>{lendoFotos ? "Abrindo…" : fotos.length ? "Mais" : "Adicionar"}</span>
                  <input type="file" accept="image/*" multiple onChange={(e) => adicionarFotos(e.target.files)} disabled={lendoFotos} />
                </label>
              )}
            </div>
            {erroFoto && <p className={p.erro}>{erroFoto}</p>}
          </section>

          <section className={p.etapa} style={{ gap: 8 }}>
            <label className={p.campoTexto}>
              <span className={p.rotulo}>
                {tipo === "jogo" ? "A frase do jogo" : "A frase da visita"} <small>opcional</small>
              </span>
              <textarea rows={3} maxLength={140} value={frase} onChange={(e) => setFrase(e.target.value)} />
              <small className={p.contagem}>{frase.length}/140</small>
            </label>
            <div className={p.sugestoes}>
              {frasesSugeridas.map((f) => (
                <button key={f} type="button" onClick={() => setFrase(f.slice(0, 140))}>
                  {f}
                </button>
              ))}
            </div>
          </section>

          <label className={p.alternar}>
            <span>
              <strong>Compartilhar na Torcida</strong>
              <small>
                {dados.config.perfilPublico
                  ? "Quem te acompanha vê no Início."
                  : "Seu perfil está privado: fica só com você até você abrir o perfil em Configurações."}
              </small>
            </span>
            <input type="checkbox" role="switch" checked={publicar} onChange={(e) => setPublicar(e.target.checked)} />
          </label>
          {erro && (
            <p className={p.erro} role="alert">
              {erro}
            </p>
          )}
        </>
      )}
    </div>
  );

  const ultima = etapa === ETAPAS.length - 1;
  const rodape = (
    <div className={p.acoes}>
      {nome === "O lugar" && !lugar.setor && (
        <button type="button" className={p.pular} disabled={!estadio} onClick={() => irPara(etapa + 1)}>
          Pular
        </button>
      )}
      {!ultima ? (
        <button type="button" className={p.cta} disabled={!etapaValida} onClick={() => irPara(etapa + 1)}>
          {nome === "O jogo" && !adversario ? "Escolha o adversário" : nome === "O lugar" && !estadio ? "Escolha o estádio" : nome === "O estádio" && !estadio ? "Escolha o estádio" : "Continuar"}
        </button>
      ) : (
        <button type="button" className={`${p.cta} ${p.ctaOuro}`} disabled={!etapaValida} onClick={confirmar}>
          {tipo === "jogo" ? "Registrar presença" : "Registrar visita"}
        </button>
      )}
    </div>
  );

  const fixo = (
    <>
      <div className={p.ingressoTopo}>
        {tipo === "jogo" ? (
          <Ingresso presenca={previaIngresso} previa={{ semAdversario: !adversario, semEstadio: !estadio }} />
        ) : (
          <TicketVisita visita={previaVisita} previa={{ semEstadio: !estadio }} />
        )}
      </div>
      <div className={p.regua} style={{ gridTemplateColumns: `repeat(${ETAPAS.length}, 1fr)` }} role="tablist" aria-label="Etapas">
        {ETAPAS.map((e, i) => (
          <button
            key={e}
            type="button"
            role="tab"
            aria-selected={i === etapa}
            aria-label={`${e}${i < etapa ? ", feita" : ""}`}
            className={`${p.aba} ${i === etapa ? p.abaAtual : ""} ${i < etapa ? p.abaFeita : ""}`}
            disabled={i > etapa}
            onClick={() => i < etapa && irPara(i)}
          >
            <span>
              {i < etapa ? "✓ " : ""}
              {e}
            </span>
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div className={p.raiz}>
      <Gaveta
        aberta={aberta && !concluido}
        onFechar={pedirFechar}
        origem={origem}
        sobretitulo="Presença"
        titulo="Cheguei no estádio"
        fixo={fixo}
        rodape={rodape}
        rolagemRef={rolagem}
      >
        {conteudo}
        {confirmandoSaida && (
          <div className={p.descartar} role="alertdialog" aria-labelledby="descartar-titulo">
            <div className={p.descartarCartao}>
              <h3 id="descartar-titulo">Descartar este registro?</h3>
              <p>O que você preencheu até aqui será perdido.</p>
              <div className={p.acoes}>
                <button type="button" autoFocus className={p.cta} onClick={() => setConfirmandoSaida(false)}>
                  Continuar registrando
                </button>
                <button type="button" className={`${p.cta} ${p.perigo}`} onClick={descartar}>
                  Descartar
                </button>
              </div>
            </div>
          </div>
        )}
      </Gaveta>

      {aberta && concluido && (
        <Celebracao
          concluido={concluido}
          dados={dados}
          onFechar={() => {
            fechar();
            zerar();
          }}
          onOutro={() => {
            zerar();
            abrir(origem.current);
          }}
          onPublicar={() => {
            publicarPresenca(concluido.tipo === "jogo" ? concluido.presenca.id : concluido.visita.id);
            setConcluido({ ...concluido, publicada: true });
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Celebração

function dataDoCarimbo(iso: string) {
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}·${m}·${a.slice(2)}`;
}

function Celebracao({ concluido, dados, onFechar, onOutro, onPublicar }: { concluido: Concluido; dados: DadosDoTorcedor; onFechar: () => void; onOutro: () => void; onPublicar: () => void }) {
  if (concluido.tipo === "visita") {
    const { visita: vis, estadioNovo, publicada } = concluido;
    const catalogo = estadioPorId(vis.estadio.id);
    return (
      <div className={p.celebracao} role="dialog" aria-modal="true" aria-label="Visita registrada">
        <div className={p.celebracaoMiolo}>
          <p className={p.cNumero}>{numeroPresenca(vis.numero)}</p>
          <h2>Você esteve lá.</h2>
          <p className={p.cFrase}>{vis.frase ? `“${vis.frase}”` : `${vis.estadio.nome} entrou no seu álbum.`}</p>
          <div className={p.ingressoGrande}>
            <TicketVisita visita={vis} />
          </div>
          {estadioNovo && (
            <section className={p.destravado}>
              <h3 className={p.rotulo}>Destravado agora</h3>
              {catalogo ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                  <AdesivoEstadio estadio={catalogo} desbloqueado indice={vis.numero} />
                  <span className={p.suave}>Sticker novo no seu álbum.</span>
                </div>
              ) : (
                <p className={p.suave}>Estádio novo no seu histórico: {vis.estadio.nome}.</p>
              )}
            </section>
          )}
          <BlocoPoste registro={{ tipo: "visita", visita: vis }} dados={dados} publicada={publicada} onFechar={onFechar} onOutro={onOutro} onPublicar={onPublicar} />
        </div>
      </div>
    );
  }

  const { presenca, novidades, publicada } = concluido;
  return (
    <div className={p.celebracao} role="dialog" aria-modal="true" aria-label="Presença registrada">
      <div className={p.celebracaoMiolo}>
        <p className={p.cNumero}>{numeroPresenca(presenca.numero)}</p>
        <h2>Você estava lá.</h2>
        <p className={p.cFrase}>{presenca.frase ? `“${presenca.frase}”` : `Sua ${presenca.numero}ª presença está guardada.`}</p>
        <div className={`${p.ingressoGrande} ${p.impacto}`}>
          <Ingresso presenca={presenca} />
          <div className={p.carimbo} aria-hidden="true">
            <small>EU ESTAVA</small>
            <strong>{NOME_RESULTADO[presenca.resultado]}</strong>
            <small>{dataDoCarimbo(presenca.partida.data)}</small>
          </div>
        </div>

        {(novidades.estadioNovo || novidades.nivel || novidades.conquistas.length > 0) && (
          <section className={p.destravado}>
            <h3 className={p.rotulo}>Destravado agora</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              {novidades.nivel && (
                <p className={p.suave}>
                  Agora você é <strong>{novidades.nivel.nome}</strong>.
                </p>
              )}
              {novidades.estadioNovo && presenca.estadio.id && estadioPorId(presenca.estadio.id) && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <AdesivoEstadio estadio={estadioPorId(presenca.estadio.id)!} desbloqueado indice={presenca.numero} />
                  <span className={p.suave}>Sticker novo no seu álbum.</span>
                </div>
              )}
              {novidades.estadioNovo && !presenca.estadio.id && <p className={p.suave}>Estádio novo no seu histórico: {presenca.estadio.nome}.</p>}
              {novidades.conquistas.map((c) => (
                <SeloConquista key={c.id} status={{ conquista: c, valor: c.meta, desbloqueada: true, progresso: 1 }} />
              ))}
            </div>
          </section>
        )}
        <BlocoPoste registro={{ tipo: "jogo", presenca }} dados={dados} publicada={publicada} onFechar={onFechar} onOutro={onOutro} onPublicar={onPublicar} />
      </div>
    </div>
  );
}

/** "Poste esse jogo": miniaturas dos modelos, Instagram como ação principal e as demais saídas. */
function BlocoPoste({ registro, dados, publicada, onFechar, onOutro, onPublicar }: { registro: { tipo: "jogo"; presenca: Presenca } | { tipo: "visita"; visita: Visita }; dados: DadosDoTorcedor; publicada: boolean; onFechar: () => void; onOutro: () => void; onPublicar: () => void }) {
  const [escolhendo, setEscolhendo] = useState<string | null | false>(false);
  const dadosImg: DadosCompartilhar = useMemo(() => {
    if (registro.tipo === "visita") {
      const v = registro.visita;
      const ids = new Set([...dados.presencas.map((x) => x.estadio.id ?? x.estadio.nome), ...dados.visitas.map((x) => x.estadio.id ?? x.estadio.nome)]);
      return { tipo: "visita", visita: v, nEstadios: Math.max(1, ids.size) };
    }
    const presenca = registro.presenca;
    const doEstadio = dados.presencas.filter((x) => x.estadio.nome === presenca.estadio.nome && x.numero <= presenca.numero);
    const setor = presenca.lugar?.setor?.trim();
    const nSetor = setor ? doEstadio.filter((x) => x.lugar?.setor?.trim() === setor).length : undefined;
    return { tipo: "jogo", presenca, nEstadio: Math.max(1, doEstadio.length), nSetor };
  }, [dados.presencas, dados.visitas, registro]);
  const href = registro.tipo === "jogo" ? `/colecao/partida/${registro.presenca.id}` : `/colecao/visita/${registro.visita.id}`;
  const modelos = modelosDisponiveis(dadosImg, "story");
  const total = modelosDisponiveis(dadosImg, "story").length + modelosDisponiveis(dadosImg, "feed").length;
  const poderPublicar = dados.config.perfilPublico || !publicada;

  return (
    <>
      <section className={p.poste} aria-labelledby="poste-titulo">
        <div className={p.posteTopo}>
          <h3 id="poste-titulo">Poste esse jogo</h3>
          <button type="button" className={p.link} onClick={() => setEscolhendo(null)}>
            ver todos ({total})
          </button>
        </div>
        <p className={p.suave}>Um modelo pronto para os Stories, com as suas fotos.</p>
        <div className={p.posteFaixa}>
          {modelos.map((m) => (
            <Miniatura key={m.id} d={dadosImg} id={m.id} formato="story" largura={100} rotulo={m.nome} etiqueta={m.etiqueta} onClick={() => setEscolhendo(m.id)} />
          ))}
        </div>
      </section>

      <div className={p.botoes}>
        <button type="button" className={`${p.cta} ${p.ctaInsta}`} onClick={() => setEscolhendo(modelos[0]?.id ?? null)}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4.2" />
            <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
          </svg>{" "}
          Compartilhar no Instagram
        </button>
        {poderPublicar &&
          (publicada ? (
            <Link href="/inicio" className={`${p.cta} ${p.vazado}`} onClick={onFechar}>
              Ver na Torcida
            </Link>
          ) : (
            <button type="button" className={`${p.cta} ${p.vazado}`} onClick={onPublicar}>
              Compartilhar na Torcida
            </button>
          ))}
        <div className={p.linksLado}>
          <Link href={href} className={p.textoBotao} onClick={onFechar}>
            Ver na coleção
          </Link>
          <button type="button" className={p.textoBotao} onClick={onOutro}>
            {registro.tipo === "jogo" ? "Registrar outro jogo" : "Registrar outro"}
          </button>
        </div>
      </div>

      {escolhendo !== false && <EscolhaModelo dados={dadosImg} modeloInicial={escolhendo ?? undefined} onFechar={() => setEscolhendo(false)} />}
    </>
  );
}

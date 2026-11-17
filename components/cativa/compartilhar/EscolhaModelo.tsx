"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { reduzirFoto } from "@/lib/dados/imagens";
import { IconeCamera, IconeFechar, IconeVoltar } from "../Icones";
import e1 from "./EscolhaModelo.module.css";
import e2 from "./EscolhaExtra.module.css";
import { compartilharImagem, salvarImagem } from "./compartilhar";
import { modelosDisponiveis } from "./Modelos";
import { FUNDOS, corDeFundo } from "./ModeloLivre";
import { ASSINATURA_PADRAO, ESTILO_PADRAO, OPCOES_PADRAO, type DadosCompartilhar, type Estilo, type Formato, type Opcoes } from "./tipos";
import { escalaMiniatura, useImagem } from "./useImagem";

const e = { ...e1, ...e2 };
const CHAVE_FORMATO = "cativa:formato-compartilhar";
const CHAVE_OPCOES = "cativa:opcoes-story";
const MAX_FOTOS = 4;

const CORES_PLACAR: { v: string; rot: string }[] = [
  { v: "", rot: "Padrão do modelo" },
  { v: "#E6C46B", rot: "Ouro" },
  { v: "#FBF5E8", rot: "Branco" },
  { v: "#1F4D3A", rot: "Verde" },
  { v: "#C8102E", rot: "Vermelho" },
  { v: "#0F3D91", rot: "Azul" },
  { v: "#12161B", rot: "Preto" },
];

function Miniatura({ d, id, formato, largura, rotulo, selecionada, etiqueta, onClick }: {
  d: DadosCompartilhar;
  id: string;
  formato: Formato;
  largura: number;
  rotulo: string;
  selecionada?: boolean;
  etiqueta?: string;
  onClick?: () => void;
}) {
  const { url } = useImagem(d, id, formato, escalaMiniatura(formato, largura * 2));
  const alt = formato === "story" ? 16 / 9 : 5 / 4;
  return (
    <button
      type="button"
      className={`${e.mini} ${selecionada ? e.miniAtiva : ""}`}
      style={{ width: largura }}
      onClick={onClick}
      aria-label={`Modelo ${rotulo}${selecionada ? ", selecionado" : ""}`}
      aria-pressed={selecionada}
    >
      <span className={e.miniImg} style={{ aspectRatio: `${1} / ${alt}` }}>
        {url ? <img src={url} alt="" /> : <i className={e.esqueleto} />}
        {etiqueta && <b className={e.etiqueta}>{etiqueta}</b>}
      </span>
      <small>{rotulo}</small>
    </button>
  );
}

function resumoDe(d: DadosCompartilhar) {
  if (d.tipo === "visita") return `Imagem da visita ao ${d.visita.estadio.nome}`;
  const p = d.presenca;
  return `Imagem do jogo ${p.time.nome} ${p.partida.golsTime} × ${p.partida.golsAdversario} ${p.partida.adversario.nome}`;
}

function Chave({ rotulo, detalhe, ligada, desabilitada, onChange }: { rotulo: string; detalhe?: string; ligada: boolean; desabilitada?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={e.chave}>
      <span>
        {rotulo}
        {detalhe && <small>{detalhe}</small>}
      </span>
      <input type="checkbox" role="switch" checked={ligada && !desabilitada} disabled={desabilitada} onChange={(ev) => onChange(ev.target.checked)} />
    </label>
  );
}

type Aba = "fotos" | "cores" | "mostrar";

/** Telas "Escolha seu modelo" e "Editar imagem": prévia, formato, ajustes e compartilhar. */
export default function EscolhaModelo({ dados: base, modeloInicial, passoInicial = "escolha", onFechar }: { dados: DadosCompartilhar; modeloInicial?: string; passoInicial?: "escolha" | "editar"; onFechar: () => void }) {
  const [formato, setFormato] = useState<Formato>("story");
  const [opcoes, setOpcoes] = useState<Opcoes>(OPCOES_PADRAO);
  const [passo, setPasso] = useState<"escolha" | "editar">(passoInicial);
  const [aba, setAba] = useState<Aba>("fotos");

  // Fotos desta imagem: começam as do registro; trocar aqui não muda o registro.
  const originais = base.tipo === "jogo" ? base.presenca.fotos : base.visita.fotos;
  const [fotos, setFotos] = useState<string[]>(originais);
  const [sel, setSel] = useState<number | "nova" | null>(null);
  const [lendo, setLendo] = useState(false);
  const [erroFoto, setErroFoto] = useState("");
  const galeria = useRef<HTMLInputElement>(null);

  const dados = useMemo<DadosCompartilhar>(() => {
    const comFotos: DadosCompartilhar =
      base.tipo === "jogo" ? { ...base, presenca: { ...base.presenca, fotos } } : { ...base, visita: { ...base.visita, fotos } };
    return { ...comFotos, opcoes };
  }, [base, fotos, opcoes]);

  const lista = modelosDisponiveis(dados, formato);
  const [id, setId] = useState(modeloInicial ?? lista[0]?.id);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const toque = useRef<number | null>(null);

  // Lembra o formato e os ajustes da última vez (as fotos não são guardadas).
  useEffect(() => {
    try {
      const f = localStorage.getItem(CHAVE_FORMATO);
      if (f === "feed" || f === "story") setFormato(f);
      const o = localStorage.getItem(CHAVE_OPCOES);
      if (o) {
        const salvo = JSON.parse(o);
        setOpcoes({ ...OPCOES_PADRAO, ...salvo, estilo: { ...ESTILO_PADRAO, ...salvo.estilo } });
      }
    } catch {}
  }, []);

  // Trocou o formato, as fotos ou os ajustes: garante um modelo válido.
  useEffect(() => {
    if (!lista.some((m) => m.id === id)) setId(lista[0]?.id);
  }, [lista, id]);

  const indice = Math.max(0, lista.findIndex((m) => m.id === id));
  const atual = lista[indice];
  const { url, erro } = useImagem(dados, atual?.id ?? null, formato, 0.4, tentativa);

  function trocarFormato(f: Formato) {
    setFormato(f);
    setAviso("");
    try {
      localStorage.setItem(CHAVE_FORMATO, f);
    } catch {}
  }
  function mudarOpcao<K extends keyof Opcoes>(k: K, v: Opcoes[K]) {
    const n = { ...opcoes, [k]: v };
    setOpcoes(n);
    setAviso("");
    try {
      localStorage.setItem(CHAVE_OPCOES, JSON.stringify(n));
    } catch {}
  }
  const mudarEstilo = (parcial: Partial<Estilo>) => mudarOpcao("estilo", { ...opcoes.estilo, ...parcial });
  function ir(passoDeModelo: number) {
    const n = lista[indice + passoDeModelo];
    if (n) setId(n.id);
  }

  // ---- Fotos
  function colocar(foto: string) {
    setFotos((l) => (sel === "nova" ? [...l, foto].slice(0, MAX_FOTOS) : l.map((f, i) => (i === sel ? foto : f))));
    setSel(null);
  }
  function remover(i: number) {
    setFotos((l) => l.filter((_, j) => j !== i));
    setSel(null);
  }
  function tornarPrincipal(i: number) {
    setFotos((l) => [l[i], ...l.filter((_, j) => j !== i)]);
    setSel(0);
  }
  async function daGaleria(arquivos: FileList | null) {
    const a = arquivos?.[0];
    if (!a) return;
    setErroFoto("");
    setLendo(true);
    try {
      colocar(await reduzirFoto(a, 1600, 0.85));
    } catch {
      setErroFoto("Não conseguimos abrir essa foto. Tente outra.");
    } finally {
      setLendo(false);
      if (galeria.current) galeria.current.value = "";
    }
  }
  const disponiveisDoJogo = originais.filter((f) => !fotos.includes(f));

  // ---- Compartilhar
  async function postar() {
    if (!atual || ocupado) return;
    setOcupado(true);
    setAviso("");
    try {
      const r = await compartilharImagem(dados, atual.id, formato);
      if (r === "baixado") setAviso("Imagem salva. Abra o Instagram e escolha da galeria.");
    } catch {
      setAviso("Não deu para gerar a imagem agora.");
    } finally {
      setOcupado(false);
    }
  }
  async function salvar() {
    if (!atual || ocupado) return;
    setOcupado(true);
    try {
      await salvarImagem(dados, atual.id, formato);
      setAviso("Imagem salva.");
    } catch {
      setAviso("Não deu para gerar a imagem agora.");
    } finally {
      setOcupado(false);
    }
  }

  // Esc volta um passo ou fecha.
  useEffect(() => {
    const fn = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape") return;
      if (passo === "editar") setPasso("escolha");
      else onFechar();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onFechar, passo]);

  const alt = formato === "story" ? 16 / 9 : 5 / 4;
  const previa = (
    <div className={e.previa} style={{ aspectRatio: `1 / ${alt}` }}>
      {url ? (
        <img src={url} alt={resumoDe(dados)} />
      ) : erro ? (
        <div className={e.erro}>
          <p>Não deu para gerar a imagem agora.</p>
          <button type="button" onClick={() => setTentativa((t) => t + 1)}>
            Tentar de novo
          </button>
        </div>
      ) : (
        <i className={e.esqueleto} />
      )}
    </div>
  );

  // ================================================================ Editar imagem
  if (passo === "editar") {
    const ehLivre = atual?.id === "livre" || atual?.id === "feed-livre";
    const time = dados.tipo === "jogo" ? dados.presenca.time : null;
    const idLivre = formato === "story" ? "livre" : "feed-livre";
    const FUNDOS_OPC: { v: Estilo["fundo"]; rot: string }[] = [
      { v: "time", rot: time ? `Cores do ${time.nome}` : "Time" },
      { v: "verde", rot: "Verde" },
      { v: "noite", rot: "Noite" },
      { v: "papel", rot: "Papel" },
      { v: "azul", rot: "Azul" },
    ];
    const LISTRAS_OPC: { v: Estilo["listras"]; rot: string }[] = [
      { v: "nenhuma", rot: "Sem listras" },
      { v: "verticais", rot: "Verticais" },
      { v: "horizontais", rot: "Horizontais" },
      { v: "diagonais", rot: "Diagonais" },
      { v: "faixas", rot: "Faixas do time" },
    ];
    const FORMAS_OPC: { v: Estilo["forma"]; rot: string }[] = [
      { v: "arredondada", rot: "Arredondada" },
      { v: "polaroide", rot: "Polaroide" },
      { v: "circulo", rot: "Círculo" },
      { v: "reta", rot: "Reta" },
    ];

    return (
      <div className={e.tela} role="dialog" aria-modal="true" aria-label="Editar imagem">
        <header className={e.topo}>
          <button type="button" className={e.fechar} onClick={() => setPasso("escolha")} aria-label="Voltar">
            <IconeVoltar />
          </button>
          <h2>Editar imagem</h2>
        </header>
        <div className={`${e.palco} ${e.palcoEditar}`}>{previa}</div>

        <div className={e.abas} role="tablist" aria-label="O que editar">
          {([["fotos", "Fotos"], ["cores", "Cores"], ["mostrar", "Mostrar"]] as const).map(([k, r]) => (
            <button key={k} type="button" role="tab" aria-selected={aba === k} onClick={() => setAba(k)}>
              {r}
            </button>
          ))}
        </div>

        <div className={e.painel}>
          {aba === "fotos" && (
            <>
              <p className={e.dica}>Toque numa foto para trocar, tornar principal ou remover.</p>
              <div className={e.fotosEdit}>
                {fotos.map((f, i) => (
                  <button key={f.slice(-20) + i} type="button" className={e.fotoEdit} aria-pressed={sel === i} aria-label={`Foto ${i + 1}${i === 0 ? ", principal" : ""}`} onClick={() => setSel(sel === i ? null : i)}>
                    <img src={f} alt="" />
                    <b>{i + 1}</b>
                  </button>
                ))}
                {fotos.length < MAX_FOTOS && (
                  <button type="button" className={`${e.fotoEdit} ${e.fotoNova}`} aria-pressed={sel === "nova"} onClick={() => setSel(sel === "nova" ? null : "nova")}>
                    <IconeCamera />
                    <span>Adicionar</span>
                  </button>
                )}
              </div>

              {sel !== null && (
                <div className={e.acoesFoto}>
                  {typeof sel === "number" && (
                    <div className={e.opcoesChips}>
                      {sel > 0 && (
                        <button type="button" onClick={() => tornarPrincipal(sel)}>
                          Tornar principal
                        </button>
                      )}
                      <button type="button" onClick={() => remover(sel)}>
                        Remover
                      </button>
                    </div>
                  )}
                  <h3 className={e.secao}>{sel === "nova" ? "Adicionar" : "Trocar por"}</h3>
                  <div className={e.trocas}>
                    <button type="button" className={e.galeria} onClick={() => galeria.current?.click()} disabled={lendo}>
                      <IconeCamera />
                      <span>{lendo ? "Abrindo…" : "Galeria"}</span>
                    </button>
                    {disponiveisDoJogo.map((f, i) => (
                      <button key={f.slice(-20) + i} type="button" className={e.troca} onClick={() => colocar(f)} aria-label={`Usar a foto ${i + 1} do jogo`}>
                        <img src={f} alt="" />
                      </button>
                    ))}
                  </div>
                  <input ref={galeria} type="file" accept="image/*" hidden onChange={(ev) => daGaleria(ev.target.files)} />
                </div>
              )}
              {erroFoto && <p className={e.avisoErro}>{erroFoto}</p>}
              <p className={e.dica}>A foto só fica no story. Não muda as fotos do seu registro.</p>
            </>
          )}

          {aba === "cores" && (
            <>
              <h3 className={e.secao}>Cor do placar</h3>
              <div className={e.cores} role="group" aria-label="Cor do placar">
                {CORES_PLACAR.map((c) => (
                  <button
                    key={c.v || "padrao"}
                    type="button"
                    className={`${e.cor} ${c.v ? "" : e.corPadrao}`}
                    aria-pressed={opcoes.corPlacar === c.v}
                    aria-label={c.rot}
                    title={c.rot}
                    style={c.v ? { background: c.v } : undefined}
                    onClick={() => mudarOpcao("corPlacar", c.v)}
                  />
                ))}
              </div>
              {ehLivre ? (
                <>
                  <h3 className={e.secao}>Fundo</h3>
                  <div className={e.cores} role="group" aria-label="Fundo">
                    {FUNDOS_OPC.map((f) => (
                      <button
                        key={f.v}
                        type="button"
                        className={e.cor}
                        aria-pressed={opcoes.estilo.fundo === f.v}
                        aria-label={f.rot}
                        title={f.rot}
                        style={{ background: f.v === "time" ? corDeFundo({ ...opcoes.estilo, fundo: "time" }, time?.corPrincipal ?? "#1F4D3A") : FUNDOS[f.v] }}
                        onClick={() => mudarEstilo({ fundo: f.v })}
                      >
                        {f.v === "time" && <span aria-hidden="true">★</span>}
                      </button>
                    ))}
                  </div>
                  <h3 className={e.secao}>Listras</h3>
                  <div className={e.opcoesChips} role="group" aria-label="Listras">
                    {LISTRAS_OPC.map((o) => (
                      <button key={o.v} type="button" aria-pressed={opcoes.estilo.listras === o.v} onClick={() => mudarEstilo({ listras: o.v })}>
                        {o.rot}
                      </button>
                    ))}
                  </div>
                  <h3 className={e.secao}>Formato das fotos</h3>
                  <div className={e.opcoesChips} role="group" aria-label="Formato das fotos">
                    {FORMAS_OPC.map((o) => (
                      <button key={o.v} type="button" aria-pressed={opcoes.estilo.forma === o.v} onClick={() => mudarEstilo({ forma: o.v })}>
                        {o.rot}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                lista.some((m) => m.id === idLivre) && (
                  <button type="button" className={e.irLivre} onClick={() => setId(idLivre)}>
                    Mudar fundo, listras e formato das fotos no modelo “Seu estilo”
                  </button>
                )
              )}
            </>
          )}

          {aba === "mostrar" && (
            <>
              <Chave rotulo="Mostrar o setor e a presença" ligada={opcoes.setor} onChange={(v) => mudarOpcao("setor", v)} />
              <Chave rotulo="Mostrar a assinatura" ligada={opcoes.marca} onChange={(v) => mudarOpcao("marca", v)} />
              <label className={e.campoAssinatura}>
                <span>Assinatura</span>
                <input
                  value={opcoes.assinatura}
                  maxLength={24}
                  disabled={!opcoes.marca}
                  placeholder={ASSINATURA_PADRAO}
                  onChange={(ev) => mudarOpcao("assinatura", ev.target.value)}
                />
              </label>
              <p className={e.dica}>Por enquanto a assinatura é o {ASSINATURA_PADRAO}. Quando o Cativa tiver Instagram, ela passa a ser o seu perfil.</p>
            </>
          )}
        </div>

        <footer className={e.rodape}>
          {aviso && (
            <p role="status" className={e.aviso}>
              {aviso}
            </p>
          )}
          <button type="button" className={`${e.principal} ${e.comIcone}`} onClick={postar} disabled={!atual || ocupado || !url}>
            <IconeCamera /> {ocupado ? "Gerando…" : formato === "story" ? "Compartilhar nos Stories" : "Compartilhar no Feed"}
          </button>
          <button type="button" className={e.link} onClick={salvar} disabled={!atual || ocupado}>
            Salvar imagem
          </button>
        </footer>
      </div>
    );
  }

  // ================================================================ Escolha seu modelo
  return (
    <div className={e.tela} role="dialog" aria-modal="true" aria-label="Escolha seu modelo">
      <header className={e.topo}>
        <button type="button" className={e.fechar} onClick={onFechar} aria-label="Fechar">
          <IconeFechar tamanho={16} />
        </button>
        <h2>Escolha seu modelo</h2>
        <div className={e.formato} role="group" aria-label="Formato">
          {(["story", "feed"] as const).map((f) => (
            <button key={f} type="button" aria-pressed={formato === f} onClick={() => trocarFormato(f)}>
              {f === "story" ? "Story 9:16" : "Feed 4:5"}
            </button>
          ))}
        </div>
      </header>

      <div
        className={e.palco}
        onTouchStart={(ev) => (toque.current = ev.touches[0].clientX)}
        onTouchEnd={(ev) => {
          if (toque.current == null) return;
          const dx = ev.changedTouches[0].clientX - toque.current;
          toque.current = null;
          if (Math.abs(dx) > 40) ir(dx < 0 ? 1 : -1);
        }}
      >
        {previa}
      </div>

      {atual && (
        <div className={e.nome}>
          <strong>{atual.nome}</strong>
          <span>{atual.descricao}</span>
        </div>
      )}

      <div className={e.tira}>
        {lista.map((m) => (
          <Miniatura key={m.id} d={dados} id={m.id} formato={formato} largura={62} rotulo={m.nome} selecionada={m.id === id} etiqueta={m.etiqueta} onClick={() => setId(m.id)} />
        ))}
      </div>

      <footer className={e.rodape}>
        {aviso && (
          <p role="status" className={e.aviso}>
            {aviso}
          </p>
        )}
        <button type="button" className={`${e.principal} ${e.comIcone}`} onClick={postar} disabled={!atual || ocupado || !url}>
          <IconeCamera /> {ocupado ? "Gerando…" : formato === "story" ? "Compartilhar nos Stories" : "Compartilhar no Feed"}
        </button>
        <div className={e.linhaLinks}>
          <button type="button" className={e.link} onClick={salvar} disabled={!atual || ocupado}>
            Salvar imagem
          </button>
          <span aria-hidden="true">·</span>
          <button type="button" className={e.link} onClick={() => setPasso("editar")}>
            Editar imagem
          </button>
        </div>
      </footer>
    </div>
  );
}

export { Miniatura };

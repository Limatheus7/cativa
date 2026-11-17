"use client";

import { useMemo } from "react";
import { estadioPorId } from "@/lib/dados/estadios";
import { formatarData, numeroPresenca } from "@/lib/dados/formato";
import { ehFinal } from "@/lib/dados/ingressos";
import type { Presenca } from "@/lib/dados/tipos";
import { caminhosRoseta } from "@/lib/compartilhar/roseta";
import { IdentidadeTime } from "../Basicos";
import { Ingresso } from "../Registros";
import TicketVisita from "../TicketVisita";
import ModeloCanhoto from "./ModeloCanhoto";
import ModeloLivre from "./ModeloLivre";
import m1 from "./Modelos.module.css";
import m2 from "./ModelosExtra.module.css";
import { OPCOES_PADRAO, TAMANHO, assinaturaDe, type DadosCompartilhar, type DadosJogo, type InfoModelo, type ModeloProps, type ModeloVisitaProps } from "./tipos";

const m = { ...m1, ...m2 };

// ---------------------------------------------------------------- Dados derivados

function ladoCasa(p: Presenca) {
  const emCasa = p.partida.mando !== "fora";
  return {
    casa: emCasa ? p.time : p.partida.adversario,
    fora: emCasa ? p.partida.adversario : p.time,
    golsCasa: emCasa ? p.partida.golsTime : p.partida.golsAdversario,
    golsFora: emCasa ? p.partida.golsAdversario : p.partida.golsTime,
  };
}

const NOME_RES = { V: "Vitória", E: "Empate", D: "Derrota" } as const;
const MANDO = { casa: "Em casa", fora: "Fora", neutro: "Campo neutro" } as const;

function dataCurta(iso: string) {
  const [a, mm, d] = iso.slice(0, 10).split("-");
  return `${d} · ${mm} · ${a}`;
}
function dataCarimbo(iso: string) {
  const [a, mm, d] = iso.slice(0, 10).split("-");
  return `${d}.${mm}.${a.slice(2)}`;
}

const ordinal = (n: number) => `${n}º`;

/** O setor só aparece quando a pessoa informou. */
const setorDe = (p: Presenca) => p.lugar?.setor?.trim() || "";

/** Reconhece Norte/Sul/Leste/Oeste mesmo escrito como "Setor Norte" ou "norte". */
export function pontoCardeal(setor: string): "norte" | "sul" | "leste" | "oeste" | null {
  const s = setor
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  const achados = (["norte", "sul", "leste", "oeste"] as const).filter((c) => new RegExp(`\\b${c}\\b`).test(s));
  return achados.length === 1 ? achados[0] : null;
}

/** Luminosidade aproximada de uma cor hex (0 a 1): escolhe texto claro ou escuro. */
function luz(hex: string) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Escurece uma cor misturando com preto. */
function escurecer(hex: string, f: number) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0");
  const c = [0, 2, 4].map((i) => Math.round(parseInt(n.slice(i, i + 2), 16) * (1 - f)));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function Logo({ cor = "papel" }: { cor?: "papel" | "verde" }) {
  return <img className={m.logo} src={`/marca/logotipo-cativa-${cor}.svg`} alt="Cativa" />;
}

/** Fotos da pessoa em grade que se ajusta à quantidade (1 grande, 2 lado a lado, 3, 4). */
function Fotos({ fotos, className }: { fotos: string[]; className?: string }) {
  const l = fotos.slice(0, 4);
  if (!l.length) return null;
  return (
    <div className={`${m.fotos} ${m[`fotos${l.length}`]} ${className ?? ""}`}>
      {l.map((f, i) => (
        <div key={i} className={m.celula} data-foto={i}>
          <img src={f} alt="" />
        </div>
      ))}
    </div>
  );
}

function Placar({ p, tamanho, escudo }: { p: Presenca; tamanho: number; escudo: number }) {
  const { casa, fora, golsCasa, golsFora } = ladoCasa(p);
  return (
    <div className={m.placar} style={{ fontSize: tamanho }} data-edit="placar">
      <IdentidadeTime time={casa} tamanho={escudo} />
      <span>{golsCasa}</span>
      <i>×</i>
      <span>{golsFora}</span>
      <IdentidadeTime time={fora} tamanho={escudo} />
    </div>
  );
}

/** "Setor Norte · Fila K · Cadeira 12": só o que existe. */
function lugarEmTexto(p: Presenca) {
  const l = p.lugar;
  return [l?.setor?.trim(), l?.fila?.trim() && `Fila ${l.fila.trim()}`, l?.cadeira?.trim() && `Cadeira ${l.cadeira.trim()}`].filter(Boolean).join(" · ");
}

// ---------------------------------------------------------------- Edição 1 de 1 (roseta)

function ModeloRoseta({ presenca: p, opcoes }: ModeloProps) {
  const { casa, fora, golsCasa, golsFora } = ladoCasa(p);
  const chave = `${casa.sigla}|${fora.sigla}|${golsCasa}|${golsFora}|${p.partida.data}|${p.estadio.id ?? p.estadio.nome}|${setorDe(p)}|${p.numero}`;
  const caminhos = useMemo(() => caminhosRoseta(chave), [chave]);
  const setor = setorDe(p);
  const mostrar = (opcoes ?? OPCOES_PADRAO).setor;
  return (
    <div className={`${m.tela} ${m.roseta}`} style={{ width: 1080, height: 1920 }}>
      <div className={m.topoCentro}>
        <Logo />
      </div>
      <div className={m.rosetaArea}>
        <svg viewBox="-450 -450 900 900" width="900" height="900" aria-hidden="true">
          {caminhos.map((c, i) => (
            <path key={i} d={c.d} fill="none" stroke="#E6C46B" strokeOpacity={c.opacidade} strokeWidth={c.largura} />
          ))}
        </svg>
        <div className={m.rosetaMiolo}>
          <small>
            {casa.sigla} × {fora.sigla}
          </small>
          <div className={m.rosetaPlacar} data-edit="placar">
            <span>{golsCasa}</span>
            <i>×</i>
            <span>{golsFora}</span>
          </div>
          <small>{dataCurta(p.partida.data)}</small>
        </div>
      </div>
      <div className={m.rosetaTexto}>
        <small>EDIÇÃO 1 DE 1</small>
        <h2>Esse jogo só aconteceu uma vez.</h2>
        <p>
          E você estava lá. {p.estadio.nome}
          {mostrar && setor ? ` · ${setor}` : ""}
          {mostrar ? ` · Presença ${numeroPresenca(p.numero)}` : ""}
        </p>
      </div>
      <Fotos fotos={p.fotos} className={m.rosetaFotos} />
      <div className={m.rodapeAssinatura} data-edit="assinatura">{assinaturaDe(opcoes)}</div>
    </div>
  );
}

// ---------------------------------------------------------------- Polaroides + ingresso

function ModeloPolaroides({ presenca: p, formato, opcoes }: ModeloProps) {
  const assinatura = assinaturaDe(opcoes);
  const feed = formato === "feed";
  const polaroides = p.fotos.slice(0, feed ? 2 : 3);
  const giros = polaroides.length === 1 ? [-3] : feed ? [-5, 4] : [-6, 5, -3];
  const { w, h } = TAMANHO[formato];
  return (
    <div className={`${m.tela} ${m.papel}`} style={{ width: w, height: h }}>
      <div className={m.topoLinha}>
        <Logo cor="verde" />
        <span className={m.dataOuro}>{dataCurta(p.partida.data)}</span>
      </div>
      <div className={`${m.polaroides} ${feed ? `${m.polaroidesFeed} ${m[`polFeed${polaroides.length}`] ?? ""}` : m[`pol${polaroides.length}`] ?? ""}`}>
        {polaroides.map((f, i) => (
          <figure key={i} data-foto={i} style={{ transform: `rotate(${giros[i]}deg)` }}>
            <i className={m.fita} aria-hidden="true" />
            <img src={f} alt="" />
          </figure>
        ))}
      </div>
      <div className={m.ingressoFaixa} style={{ ["--fundo" as string]: "#efe3cb" }}>
        <Ingresso presenca={p} />
      </div>
      {p.frase && <p className={m.fraseGrande}>“{p.frase}”</p>}
      <div className={m.rodapeVerde} data-edit="assinatura">ESSE JOGO SÓ ACONTECEU UMA VEZ{assinatura ? ` · ${assinatura.toUpperCase()}` : ""}</div>
    </div>
  );
}

// ---------------------------------------------------------------- Retrospectiva (verde e azul)

function ModeloRetro({ presenca: p, nEstadio, nSetor, formato, opcoes, azul }: ModeloProps & { azul?: boolean }) {
  const feed = formato === "feed";
  const { w, h } = TAMANHO[formato];
  const { casa, fora, golsCasa, golsFora } = ladoCasa(p);
  const setor = setorDe(p);
  const mostrar = (opcoes ?? OPCOES_PADRAO).setor;
  // Só o que dá para calcular com segurança: a posição no estádio e no setor.
  const linhas: string[] = [];
  if (nEstadio > 0) linhas.push(`${ordinal(nEstadio)} no ${p.estadio.nome}`);
  if (mostrar && setor && nSetor) linhas.push(`${ordinal(nSetor)} no ${setor}`);
  return (
    <div className={`${m.tela} ${azul ? m.retroAzul : m.retro}`} style={{ width: w, height: h }}>
      <div className={m.topoLinha}>
        <Logo />
      </div>
      <small className={m.rotuloOuro}>SEU JOGO DE NÚMERO</small>
      <div className={m.retroNumero} style={{ fontSize: feed ? 300 : 440 }}>
        {p.numero}
      </div>
      {linhas.length > 0 && <p className={m.retroLinhas}>{linhas.join(" · ")}</p>}
      <Fotos fotos={p.fotos} className={m.retroFotos} />
      <div className={m.retroRodape}>
        <IdentidadeTime time={p.time} tamanho={64} />
        <div>
          <strong>
            {casa.sigla} {golsCasa} × {golsFora} {fora.sigla}
          </strong>
          <span>
            {p.partida.competicao} · {formatarData(p.partida.data)} · {p.estadio.nome}
          </span>
        </div>
        <b>{NOME_RES[p.resultado].toUpperCase()}</b>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Página do álbum

function ModeloAlbum({ presenca: p, opcoes }: ModeloProps) {
  const arte = estadioPorId(p.estadio.id)?.arte;
  const mostrar = (opcoes ?? OPCOES_PADRAO).setor;
  const { casa, fora, golsCasa, golsFora } = ladoCasa(p);
  const setor = mostrar ? setorDe(p) : "";
  return (
    <div className={`${m.tela} ${m.album}`} style={{ width: 1080, height: 1920 }}>
      <div className={m.albumMoldura}>
        <div className={m.topoLinha}>
          <Logo cor="verde" />
        </div>
        <small className={m.rotuloOuroEscuro}>ÁLBUM DE ARQUIBANCADA{mostrar ? ` · PÁGINA ${p.numero}` : ""}</small>
        <h2 className={m.albumTitulo}>{p.estadio.nome}</h2>
        <p className={m.albumLinha}>
          {casa.sigla} {golsCasa} × {golsFora} {fora.sigla} · {p.partida.competicao}
          {setor ? ` · ${setor}` : ""}
        </p>
        <div className={`${m.albumGrade} ${m[`albumN${Math.min(4, (arte ? 1 : 0) + Math.min(p.fotos.length, arte ? 3 : 4))}`] ?? ""}`}>
          {arte && (
            <div className={m.albumCelula}>
              <img src={arte} alt="" />
            </div>
          )}
          {p.fotos.slice(0, arte ? 3 : 4).map((f, i) => (
            <div key={i} className={m.albumCelula} data-foto={i}>
              <img src={f} alt="" />
            </div>
          ))}
        </div>
        {p.frase && (
          <div className={m.albumFrase}>
            <small>A FRASE DO JOGO</small>
            <p>“{p.frase}”</p>
          </div>
        )}
        <div className={m.albumCarimbo}>
          <small>{p.estadio.cidade.toUpperCase()}</small>
          <strong>{mostrar ? `Nº ${p.numero}` : p.estadio.uf}</strong>
          <small>{dataCarimbo(p.partida.data)}</small>
        </div>
        <div className={m.rodapeVerde} data-edit="assinatura">CADA JOGO É ÚNICO{assinaturaDe(opcoes) ? ` · ${assinaturaDe(opcoes).toUpperCase()}` : ""}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Placar eletrônico

function ModeloPlacarLed({ presenca: p, opcoes }: ModeloProps) {
  const { casa, fora, golsCasa, golsFora } = ladoCasa(p);
  const mostrar = (opcoes ?? OPCOES_PADRAO).setor;
  const lugar = mostrar ? lugarEmTexto(p) : "";
  return (
    <div className={`${m.tela} ${m.led}`} style={{ width: 1080, height: 1920 }}>
      <div className={m.topoLinha}>
        <Logo />
        <span className={m.aoVivo}>● AO VIVO</span>
      </div>
      <div className={m.ledPainel} data-edit="placar">
        <small>
          {p.partida.competicao.toUpperCase()} · {p.estadio.nome.toUpperCase()}
        </small>
        <div className={m.ledLinha}>
          <span>{casa.sigla}</span>
          <span>{golsCasa}</span>
        </div>
        <div className={m.ledLinha}>
          <span>{fora.sigla}</span>
          <span>{golsFora}</span>
        </div>
        <div className={m.ledRodape}>
          <span>{dataCurta(p.partida.data)}</span>
          <span>{lugar ? `+1 VOCÊ · ${lugar.toUpperCase()}` : "+1 VOCÊ"}</span>
        </div>
      </div>
      <small className={m.rotuloOuro}>NO TELÃO</small>
      <Fotos fotos={p.fotos} className={m.ledFotos} />
      <div className={m.ledBase}>
        <div>
          <small>PRESENÇA</small>
          <strong>{mostrar ? numeroPresenca(p.numero) : NOME_RES[p.resultado]}</strong>
        </div>
        <IdentidadeTime time={p.time} tamanho={72} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Jornal do dia seguinte

function ModeloJornal({ presenca: p, opcoes, fotoCinza, filtrosCss }: ModeloProps) {
  const { casa, fora, golsCasa, golsFora } = ladoCasa(p);
  const mostrar = (opcoes ?? OPCOES_PADRAO).setor;
  const manchete = p.frase
    ? p.frase.toUpperCase()
    : p.resultado === "V"
      ? `VITÓRIA DO ${p.time.nome.toUpperCase()}`
      : p.resultado === "E"
        ? `EMPATE NO ${p.estadio.nome.toUpperCase()}`
        : `${p.time.nome.toUpperCase()} PERDE, MAS A TORCIDA ESTAVA LÁ`;
  const dia = new Date(`${p.partida.data}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
  const lugar = mostrar ? lugarEmTexto(p) : "";
  return (
    <div className={`${m.tela} ${m.jornal}`} style={{ width: 1080, height: 1920 }}>
      <div className={m.jornalTopo}>
        <span>{dia.toUpperCase()}</span>
        {mostrar && <span>EDIÇÃO Nº {String(p.numero).padStart(4, "0")}</span>}
        <span>{p.estadio.cidade.toUpperCase()}</span>
      </div>
      <h1 className={m.jornalNome}>Diário da Arquibancada</h1>
      <small className={m.jornalEdicao}>EDIÇÃO EXTRA · {p.partida.competicao.toUpperCase()}</small>
      <h2 className={m.jornalManchete}>{manchete}</h2>
      <p className={m.jornalDeck}>
        {casa.nome} {golsCasa} × {golsFora} {fora.nome}, pelo {p.partida.competicao}, no {p.estadio.nome}. E você estava lá{lugar ? `, em ${lugar}` : ""}.
      </p>
      {p.fotos[0] && <img className={m.jornalFoto} data-foto={0} src={fotoCinza ?? p.fotos[0]} alt="" style={filtrosCss ? { filter: "grayscale(1) contrast(1.15)" } : undefined} />}
      <p className={m.jornalCorpo}>
        Em {formatarData(p.partida.data)}, o {p.estadio.nome}, em {p.estadio.cidade}, recebeu {casa.nome} e {fora.nome} pelo {p.partida.competicao}. O placar final foi {golsCasa} a {golsFora}.
        {p.frase ? ` Entre as lembranças do dia, uma frase ficou: “${p.frase}”.` : ""}
      </p>
      <div className={m.jornalRodape}>
        <span>
          PLACAR FINAL: {casa.sigla} {golsCasa} × {golsFora} {fora.sigla}
        </span>
        <Logo cor="verde" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Cartão-postal

function ModeloPostal({ presenca: p, opcoes }: ModeloProps) {
  const arte = estadioPorId(p.estadio.id)?.arte;
  const foto = p.fotos[0] ?? arte;
  const fundo = escurecer(p.time.corPrincipal, luz(p.time.corPrincipal) > 0.5 ? 0.45 : 0.1);
  const claro = luz(fundo) > 0.55;
  const mostrar = (opcoes ?? OPCOES_PADRAO).setor;
  const { casa, fora, golsCasa, golsFora } = ladoCasa(p);
  return (
    <div className={`${m.tela} ${m.postal}`} style={{ width: 1080, height: 1920, background: fundo, color: claro ? "#12301f" : "#f4ebd9" }}>
      <div className={m.topoLinha}>
        <Logo cor={claro ? "verde" : "papel"} />
      </div>
      <div className={m.postalFoto}>
        {foto && <img src={foto} alt="" data-foto={p.fotos[0] ? 0 : undefined} />}
        <div className={m.postalLegenda}>
          <em>Lembranças do</em>
          <strong>{p.estadio.nome}</strong>
        </div>
        <div className={m.postalCarimbo}>
          <small>{p.estadio.cidade.toUpperCase()}</small>
          <b>
            {casa.sigla} {golsCasa}×{golsFora}
          </b>
          <small>{dataCarimbo(p.partida.data)}</small>
        </div>
      </div>
      {p.frase && <p className={m.postalFrase}>{p.frase}</p>}
      <small className={m.postalJogo}>
        {casa.nome.toUpperCase()} {golsCasa} × {golsFora} {fora.nome.toUpperCase()} · {p.partida.competicao.toUpperCase()}
      </small>
      <div className={m.postalBase}>
        <div>
          <small>PRESENÇA</small>
          <strong>{mostrar ? numeroPresenca(p.numero) : NOME_RES[p.resultado]}</strong>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Mapa do lugar

function ModeloMapa({ presenca: p, opcoes }: ModeloProps) {
  const ponto = pontoCardeal(setorDe(p));
  const { casa, fora, golsCasa, golsFora } = ladoCasa(p);
  const cor = (c: string) => (ponto === c ? "#E6C46B" : "rgba(244,235,217,0.14)");
  const detalhe = [p.lugar?.fila?.trim() && `Fila ${p.lugar.fila.trim()}`, p.lugar?.cadeira?.trim() && `Cadeira ${p.lugar.cadeira.trim()}`].filter(Boolean).join(" · ");
  return (
    <div className={`${m.tela} ${m.mapa}`} style={{ width: 1080, height: 1920 }}>
      <div className={m.topoLinha}>
        <Logo />
      </div>
      <small className={m.rotuloOuro} style={{ marginTop: 50 }}>VOCÊ ESTAVA AQUI</small>
      <h2 className={m.mapaTitulo}>Setor {ponto ? ponto[0].toUpperCase() + ponto.slice(1) : ""}</h2>
      {detalhe && <p className={m.mapaDetalhe}>{detalhe}</p>}
      <svg className={m.mapaSvg} viewBox="0 0 800 600" aria-hidden="true">
        <ellipse cx="400" cy="300" rx="380" ry="280" fill="rgba(244,235,217,0.06)" stroke="rgba(244,235,217,0.25)" strokeWidth="3" />
        <path d="M150 110 Q400 20 650 110 L600 160 Q400 100 200 160 Z" fill={cor("norte")} />
        <path d="M150 490 Q400 580 650 490 L600 440 Q400 500 200 440 Z" fill={cor("sul")} />
        <path d="M60 220 Q20 300 60 380 L130 340 Q105 300 130 260 Z" fill={cor("oeste")} />
        <path d="M740 220 Q780 300 740 380 L670 340 Q695 300 670 260 Z" fill={cor("leste")} />
        <rect x="190" y="170" width="420" height="260" rx="6" fill="#2f7a4c" stroke="rgba(255,255,255,0.7)" strokeWidth="3" />
        <line x1="400" y1="170" x2="400" y2="430" stroke="rgba(255,255,255,0.7)" strokeWidth="3" />
        <circle cx="400" cy="300" r="40" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="3" />
        <rect x="190" y="235" width="55" height="130" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="3" />
        <rect x="555" y="235" width="55" height="130" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="3" />
        <g fontFamily="var(--font-jost), sans-serif" fontSize="22" letterSpacing="4" fill="rgba(244,235,217,0.7)" textAnchor="middle">
          <text x="400" y="78">NORTE</text>
          <text x="400" y="545">SUL</text>
          <text x="92" y="305">OESTE</text>
          <text x="708" y="305">LESTE</text>
        </g>
      </svg>
      <div className={m.mapaPlacar}>
        <IdentidadeTime time={p.time} tamanho={72} />
        <strong>
          {casa.sigla} {golsCasa} × {golsFora} {fora.sigla}
        </strong>
        <span>
          {p.estadio.nome}
          <br />
          {formatarData(p.partida.data)}
        </span>
      </div>
      <Fotos fotos={p.fotos.slice(0, 3)} className={m.mapaFotos} />
      <div className={m.rodapeAssinatura} data-edit="assinatura">NENHUM OUTRO LUGAR VIU ESSE JOGO ASSIM{assinaturaDe(opcoes) ? ` · ${assinaturaDe(opcoes).toUpperCase()}` : ""}</div>
    </div>
  );
}

// ---------------------------------------------------------------- Final preto e ouro

function ModeloFinal({ presenca: p, opcoes }: ModeloProps) {
  const { casa, fora, golsCasa, golsFora } = ladoCasa(p);
  const mostrar = (opcoes ?? OPCOES_PADRAO).setor;
  const ano = p.partida.data.slice(0, 4);
  return (
    <div className={`${m.tela} ${m.final}`} style={{ width: 1080, height: 1920 }}>
      <div className={m.finalMoldura}>
        <svg className={m.finalLouros} viewBox="0 0 200 110" aria-hidden="true">
          <g fill="none" stroke="#E6C46B" strokeWidth="3" strokeLinecap="round">
            <circle cx="100" cy="46" r="26" />
            <path d="m100 30 5.4 11 12 1.7-8.7 8.5 2 12-10.7-5.7-10.7 5.7 2-12-8.7-8.5 12-1.7Z" fill="#E6C46B" stroke="none" />
            <path d="M52 78Q30 50 44 20M60 84Q36 62 38 36M148 78Q170 50 156 20M140 84Q164 62 162 36" />
          </g>
          <rect x="72" y="88" width="56" height="16" rx="3" fill="#E6C46B" />
          <text x="100" y="100" textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="2" fill="#12301f" fontFamily="var(--font-jost), sans-serif">FINAL</text>
        </svg>
        <small className={m.rotuloOuro}>
          {p.partida.competicao.toUpperCase()} {ano} · {MANDO[p.partida.mando].toUpperCase()}
        </small>
        <Placar p={p} tamanho={200} escudo={130} />
        <div className={m.finalNomes}>
          <span>{casa.nome}</span>
          <span>{fora.nome}</span>
        </div>
        <h2 className={m.finalTitulo}>{p.resultado === "V" ? "Eu vi o título." : "Eu estava na final."}</h2>
        <Fotos fotos={p.fotos} className={m.finalFotos} />
        <div className={m.finalBase}>
          <div>
            <small>DATA</small>
            <b>{formatarData(p.partida.data)}</b>
          </div>
          <div>
            <small>ESTÁDIO</small>
            <b>{p.estadio.nome}</b>
          </div>
          {mostrar && (
            <div>
              <small>PRESENÇA</small>
              <strong>{numeroPresenca(p.numero)}</strong>
            </div>
          )}
        </div>
        <Logo />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Fotocabine

function ModeloFotocabine({ presenca: p, opcoes }: ModeloProps) {
  const fundo = escurecer(p.time.corPrincipal, luz(p.time.corPrincipal) > 0.6 ? 0.5 : 0.18);
  const claro = luz(fundo) > 0.55;
  const { casa, fora, golsCasa, golsFora } = ladoCasa(p);
  const mostrar = (opcoes ?? OPCOES_PADRAO).setor;
  const lugar = mostrar ? setorDe(p) : "";
  return (
    <div className={`${m.tela} ${m.cabine}`} style={{ width: 1080, height: 1920, background: fundo, color: claro ? "#12301f" : "#f4ebd9" }}>
      <div className={m.topoLinha}>
        <Logo cor={claro ? "verde" : "papel"} />
      </div>
      <div className={m.cabineMiolo}>
        <div className={m.cabineTira}>
          {p.fotos.slice(0, 4).map((f, i) => (
            <img key={i} src={f} alt="" data-foto={i} />
          ))}
        </div>
        <div className={m.cabineTexto}>
          <small>{p.partida.competicao.toUpperCase()}</small>
          <b>{casa.sigla}</b>
          <strong>{golsCasa}</strong>
          <b>{fora.sigla}</b>
          <strong>{golsFora}</strong>
          {p.frase && <em>“{p.frase}”</em>}
        </div>
      </div>
      <div className={m.cabineBilhete}>
        <div>
          <small>PRESENÇA{lugar ? ` · SETOR ${lugar.toUpperCase()}` : ""}</small>
          <strong>{mostrar ? numeroPresenca(p.numero) : formatarData(p.partida.data)}</strong>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Visita ao estádio

function ModeloVisita({ visita: v, nEstadios, formato, opcoes }: ModeloVisitaProps) {
  const arte = estadioPorId(v.estadio.id)?.arte;
  const { w, h } = TAMANHO[formato];
  const fotos = (opcoes ?? OPCOES_PADRAO).fotos ? v.fotos : [];
  return (
    <div className={`${m.tela} ${m.visita}`} style={{ width: w, height: h }}>
      {arte && <img className={m.visitaArte} src={arte} alt="" />}
      <div className={m.visitaVeu} />
      <div className={m.topoLinha} style={{ position: "relative" }}>
        <Logo cor="verde" />
      </div>
      <div className={m.visitaIngresso} style={{ ["--fundo" as string]: "#e7e3d0" }}>
        <TicketVisita visita={v} />
      </div>
      <div className={m.visitaFotos}>
        <Fotos fotos={fotos.slice(0, 3)} />
        {nEstadios > 0 && (
          <div className={m.visitaSelo}>
            <strong>{ordinal(nEstadios)}</strong>
            <span>estádio da coleção</span>
          </div>
        )}
      </div>
      <p className={m.visitaFrase}>{v.frase ? `“${v.frase}”` : "Sem jogo, mas com história."}</p>
    </div>
  );
}

// ---------------------------------------------------------------- Catálogo

type Modelo = InfoModelo & { render: (d: DadosCompartilhar, formato: "story" | "feed") => React.ReactElement };

const doJogo = (d: DadosCompartilhar): d is DadosJogo => d.tipo === "jogo";
const comFotos = (d: DadosCompartilhar) => doJogo(d) && d.presenca.fotos.length > 0;

export const MODELOS: Modelo[] = [
  {
    id: "final",
    nome: "Final",
    descricao: "Preto e ouro para quem estava na final.",
    formato: "story",
    para: "jogo",
    etiqueta: "Final",
    disponivel: (d) => doJogo(d) && ehFinal(d.presenca.partida.fase),
    render: (d) => <ModeloFinal {...(d as DadosJogo)} formato="story" />,
  },
  {
    id: "roseta",
    nome: "1 de 1",
    descricao: "A roseta é gerada pelos dados desse jogo.",
    formato: "story",
    para: "jogo",
    etiqueta: "Único",
    disponivel: doJogo,
    render: (d) => <ModeloRoseta {...(d as DadosJogo)} formato="story" />,
  },
  {
    id: "livre",
    nome: "Seu estilo",
    descricao: "Monte do seu jeito: fundo, listras e formato das fotos.",
    formato: "story",
    para: "jogo",
    etiqueta: "Edite",
    disponivel: doJogo,
    render: (d) => <ModeloLivre {...(d as DadosJogo)} formato="story" />,
  },
  {
    id: "polaroides",
    nome: "Polaroides",
    descricao: "Suas fotos soltas sobre o ingresso.",
    formato: "story",
    para: "jogo",
    disponivel: comFotos,
    render: (d) => <ModeloPolaroides {...(d as DadosJogo)} formato="story" />,
  },
  {
    id: "canhoto",
    nome: "Canhoto",
    descricao: "Sua foto em tela cheia com o placar.",
    formato: "story",
    para: "jogo",
    disponivel: comFotos,
    render: (d) => <ModeloCanhoto {...(d as DadosJogo)} formato="story" />,
  },
  {
    id: "mapa",
    nome: "Mapa",
    descricao: "O setor onde você estava, no mapa do estádio.",
    formato: "story",
    para: "jogo",
    disponivel: (d) => doJogo(d) && pontoCardeal(setorDe(d.presenca)) !== null,
    render: (d) => <ModeloMapa {...(d as DadosJogo)} formato="story" />,
  },
  {
    id: "retro",
    nome: "Retrospectiva",
    descricao: "O número do seu jogo e suas fotos.",
    formato: "story",
    para: "jogo",
    disponivel: doJogo,
    render: (d) => <ModeloRetro {...(d as DadosJogo)} formato="story" />,
  },
  {
    id: "retro-azul",
    nome: "Retro azul",
    descricao: "A retrospectiva, em azul.",
    formato: "story",
    para: "jogo",
    disponivel: doJogo,
    render: (d) => <ModeloRetro {...(d as DadosJogo)} formato="story" azul />,
  },
  {
    id: "album",
    nome: "Álbum",
    descricao: "Uma página do seu álbum de arquibancada.",
    formato: "story",
    para: "jogo",
    disponivel: doJogo,
    render: (d) => <ModeloAlbum {...(d as DadosJogo)} formato="story" />,
  },
  {
    id: "placar",
    nome: "Placar",
    descricao: "O jogo no placar eletrônico, com as suas fotos no telão.",
    formato: "story",
    para: "jogo",
    disponivel: doJogo,
    render: (d) => <ModeloPlacarLed {...(d as DadosJogo)} formato="story" />,
  },
  {
    id: "jornal",
    nome: "Jornal",
    descricao: "A manchete do dia seguinte.",
    formato: "story",
    para: "jogo",
    disponivel: doJogo,
    render: (d) => <ModeloJornal {...(d as DadosJogo)} formato="story" />,
  },
  {
    id: "postal",
    nome: "Postal",
    descricao: "Lembranças do estádio, em cartão-postal.",
    formato: "story",
    para: "jogo",
    disponivel: (d) => doJogo(d) && (d.presenca.fotos.length > 0 || !!estadioPorId(d.presenca.estadio.id)?.arte),
    render: (d) => <ModeloPostal {...(d as DadosJogo)} formato="story" />,
  },
  {
    id: "fotocabine",
    nome: "Fotocabine",
    descricao: "Suas fotos em tira, com as cores do seu time.",
    formato: "story",
    para: "jogo",
    disponivel: comFotos,
    render: (d) => <ModeloFotocabine {...(d as DadosJogo)} formato="story" />,
  },
  {
    id: "feed-livre",
    nome: "Seu estilo",
    descricao: "Monte do seu jeito, em 4:5.",
    formato: "feed",
    para: "jogo",
    etiqueta: "Edite",
    disponivel: doJogo,
    render: (d) => <ModeloLivre {...(d as DadosJogo)} formato="feed" />,
  },
  {
    id: "feed-ingresso",
    nome: "Ingresso",
    descricao: "O ingresso e suas fotos, em 4:5.",
    formato: "feed",
    para: "jogo",
    disponivel: comFotos,
    render: (d) => <ModeloPolaroides {...(d as DadosJogo)} formato="feed" />,
  },
  {
    id: "feed-retro",
    nome: "Retrospectiva",
    descricao: "O número do seu jogo, em 4:5.",
    formato: "feed",
    para: "jogo",
    disponivel: doJogo,
    render: (d) => <ModeloRetro {...(d as DadosJogo)} formato="feed" />,
  },
  {
    id: "visita",
    nome: "Visita",
    descricao: "O estádio que você visitou, sem jogo mas com história.",
    formato: "story",
    para: "visita",
    etiqueta: "Visita",
    disponivel: (d) => d.tipo === "visita",
    render: (d) => <ModeloVisita {...(d as Extract<DadosCompartilhar, { tipo: "visita" }>)} formato="story" />,
  },
  {
    id: "feed-visita",
    nome: "Visita",
    descricao: "A visita, em 4:5.",
    formato: "feed",
    para: "visita",
    disponivel: (d) => d.tipo === "visita",
    render: (d) => <ModeloVisita {...(d as Extract<DadosCompartilhar, { tipo: "visita" }>)} formato="feed" />,
  },
];

/** Aplica as escolhas da tela "Seu story" aos dados (sem fotos, sem setor). */
export function aplicarOpcoes(d: DadosCompartilhar): DadosCompartilhar {
  const o = d.opcoes ?? OPCOES_PADRAO;
  if (d.tipo === "visita") return { ...d, visita: o.fotos ? d.visita : { ...d.visita, fotos: [] } };
  return {
    ...d,
    presenca: { ...d.presenca, fotos: o.fotos ? d.presenca.fotos : [], lugar: o.setor ? d.presenca.lugar : undefined },
    nSetor: o.setor ? d.nSetor : undefined,
  };
}

export function modelosDisponiveis(d: DadosCompartilhar, formato: "story" | "feed") {
  const a = aplicarOpcoes(d);
  return MODELOS.filter((x) => x.formato === formato && x.disponivel(a));
}

/** Modelos que já têm a assinatura no próprio rodapé; nos demais ela entra como uma etiqueta embaixo. */
const ASSINATURA_PROPRIA = new Set(["roseta", "polaroides", "album", "mapa", "feed-ingresso"]);

export function elementoDoModelo(id: string, d: DadosCompartilhar) {
  const info = MODELOS.find((x) => x.id === id)!;
  const a = aplicarOpcoes(d);
  const { w, h } = TAMANHO[info.formato];
  const o = d.opcoes ?? OPCOES_PADRAO;
  const assinatura = assinaturaDe(d.opcoes);
  const estilo = { position: "relative", width: w, height: h, ...(o.corPlacar ? { ["--cor-placar" as string]: o.corPlacar } : {}) } as React.CSSProperties;
  return (
    <div style={estilo}>
      {info.render(a, info.formato)}
      {assinatura && !ASSINATURA_PROPRIA.has(id) && <div className={m.marcaTag} data-edit="assinatura">{assinatura}</div>}
    </div>
  );
}

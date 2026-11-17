"use client";

import { formatarData, numeroPresenca } from "@/lib/dados/formato";
import { IdentidadeTime } from "../Basicos";
import l from "./ModeloLivre.module.css";
import { ESTILO_PADRAO, OPCOES_PADRAO, TAMANHO, type Estilo, type ModeloProps } from "./tipos";

/** Cores fixas dos fundos que não seguem o time. */
export const FUNDOS: Record<Exclude<Estilo["fundo"], "time">, string> = {
  verde: "#1F4D3A",
  noite: "#0C0F14",
  papel: "#F4EBD9",
  azul: "#0F3D91",
};

function luz(hex: string) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function escurecer(hex: string, f: number) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0");
  const c = [0, 2, 4].map((i) => Math.round(parseInt(n.slice(i, i + 2), 16) * (1 - f)));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Cor de fundo do estilo: a do time (levemente escurecida, para o texto ler bem) ou uma fixa. */
export function corDeFundo(estilo: Estilo, principal: string) {
  if (estilo.fundo !== "time") return FUNDOS[estilo.fundo];
  return escurecer(principal, luz(principal) > 0.55 ? 0.55 : 0.18);
}

/** Listras por cima do fundo. "faixas" usa as cores do time em bandas, com véu para manter a leitura. */
function listrasCss(estilo: Estilo, claro: boolean, faixas: string[]) {
  const traco = claro ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)";
  const risco = (ang: number) => `repeating-linear-gradient(${ang}deg, ${traco} 0 70px, transparent 70px 140px)`;
  switch (estilo.listras) {
    case "verticais":
      return risco(90);
    case "horizontais":
      return risco(180);
    case "diagonais":
      return risco(45);
    case "faixas": {
      const n = faixas.length || 1;
      const larg = 1080 / (n * 2);
      const paradas = faixas.map((c, i) => `${c} ${i * larg}px ${(i + 1) * larg}px`).join(", ");
      // As faixas do time se repetem em bandas verticais; o véu escuro mantém o texto legível.
      return `linear-gradient(rgba(0,0,0,0.42), rgba(0,0,0,0.42)), repeating-linear-gradient(90deg, ${paradas})`;
    }
    default:
      return "none";
  }
}

function Fotos({ fotos, forma }: { fotos: string[]; forma: Estilo["forma"] }) {
  const f = fotos.slice(0, 4);
  if (!f.length) return null;
  if (forma === "circulo") {
    const d = f.length === 1 ? 620 : f.length === 2 ? 440 : f.length === 3 ? 330 : 400;
    return (
      <div className={`${l.circulos} ${f.length === 4 ? l.circulos4 : ""}`}>
        {f.map((src, i) => (
          <span key={i} style={{ width: d, height: d }}>
            <img src={src} alt="" />
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className={`${l.fotos} ${l[`n${f.length}`]} ${l[forma]}`}>
      {f.map((src, i) => (
        <div key={i} className={l.celula} style={forma === "polaroide" ? { transform: `rotate(${[-2.5, 2, -1.5, 2.5][i]}deg)` } : undefined}>
          <img src={src} alt="" />
        </div>
      ))}
    </div>
  );
}

/**
 * "Seu estilo": o usuário escolhe fundo, listras e formato das fotos.
 * Por padrão segue as cores do time selecionado.
 */
export default function ModeloLivre({ presenca: p, formato, opcoes }: ModeloProps) {
  const o = opcoes ?? OPCOES_PADRAO;
  const estilo = { ...ESTILO_PADRAO, ...o.estilo };
  const { w, h } = TAMANHO[formato];
  const feed = formato === "feed";

  const fundo = corDeFundo(estilo, p.time.corPrincipal);
  const claro = luz(fundo) > 0.55 && estilo.listras !== "faixas";
  const texto = claro ? "#12301F" : "#FBF5E8";
  const destaque = claro ? "#A9791A" : "#E6C46B";
  const faixas = p.time.faixas?.length ? p.time.faixas : [p.time.corPrincipal, p.time.corSegunda];

  const emCasa = p.partida.mando !== "fora";
  const casa = emCasa ? p.time : p.partida.adversario;
  const fora = emCasa ? p.partida.adversario : p.time;
  const golsCasa = emCasa ? p.partida.golsTime : p.partida.golsAdversario;
  const golsFora = emCasa ? p.partida.golsAdversario : p.partida.golsTime;
  const setor = o.setor ? p.lugar?.setor?.trim() || "" : "";
  const linha = `${p.partida.competicao} · ${p.estadio.nome}`;
  const fonte = linha.length > 40 ? 20 : linha.length > 30 ? 24 : 28;

  return (
    <div
      className={l.raiz}
      style={{ width: w, height: h, background: fundo, color: texto, ["--destaque" as string]: destaque, ["--texto" as string]: texto }}
    >
      <div className={l.listras} style={{ backgroundImage: listrasCss(estilo, claro, faixas) }} />

      <div className={l.conteudo} style={{ padding: feed ? "64px 72px 56px" : "96px 80px 72px" }}>
        <img className={l.logo} src={`/marca/logotipo-cativa-${claro ? "verde" : "papel"}.svg`} alt="Cativa" />

        <div className={l.placar} style={{ marginTop: feed ? 36 : 70 }}>
          <div className={l.competicao} style={{ fontSize: fonte }}>
            {linha}
          </div>
          <div className={l.linhaPlacar} style={{ gap: feed ? 24 : 36 }}>
            <IdentidadeTime time={casa} tamanho={feed ? 96 : 120} />
            <span className={l.gols} style={{ fontSize: feed ? 170 : 230 }}>
              {golsCasa}
            </span>
            <span className={l.vezes}>×</span>
            <span className={l.gols} style={{ fontSize: feed ? 170 : 230 }}>
              {golsFora}
            </span>
            <IdentidadeTime time={fora} tamanho={feed ? 96 : 120} />
          </div>
        </div>

        <div className={l.area}>
          {p.fotos.length > 0 ? (
            <Fotos fotos={p.fotos} forma={estilo.forma} />
          ) : (
            <div className={l.semFoto}>{numeroPresenca(p.numero)}</div>
          )}
        </div>

        {p.frase && <p className={l.frase}>“{p.frase}”</p>}

        <div className={l.dados}>
          <div>
            <small>PRESENÇA</small>
            <strong>{numeroPresenca(p.numero)}</strong>
          </div>
          <div>
            <small>DATA</small>
            <b>{formatarData(p.partida.data)}</b>
          </div>
          {setor && (
            <div>
              <small>SETOR</small>
              <b>{setor}</b>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

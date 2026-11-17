"use client";

import { formatarData, numeroPresenca } from "@/lib/dados/formato";
import { IdentidadeTime } from "../Basicos";
import c from "./ModeloCanhoto.module.css";
import { OPCOES_PADRAO, type ModeloProps } from "./tipos";

// Serrilha: onda de 90px de período entre a foto e o papel (SVG 1080 × 40).
const ONDA = (() => {
  let d = "M0 40 V22 Q22.5 2 45 22";
  for (let x = 90; x <= 1080; x += 45) d += ` T${x} 22`;
  return `${d} V40 Z`;
})();

/**
 * "Canhoto sobre a foto" (story 1080 × 1920). Medidas da prancha, sem reinterpretar:
 * foto sangrada com blur, placar em 760, serrilha em 1340 e papel de 1378 até o rodapé.
 */
export default function ModeloCanhoto({ presenca: p, opcoes, fundoSuave, filtrosCss }: ModeloProps) {
  const mostrar = (opcoes ?? OPCOES_PADRAO).setor;
  const setor = p.lugar?.setor?.trim() || "";
  const emCasa = p.partida.mando !== "fora";
  const casa = emCasa ? p.time : p.partida.adversario;
  const fora = emCasa ? p.partida.adversario : p.time;
  const golsCasa = emCasa ? p.partida.golsTime : p.partida.golsAdversario;
  const golsFora = emCasa ? p.partida.golsAdversario : p.partida.golsTime;

  // Primeira foto é a principal; as demais (até 3) viram miniaturas.
  const [principal, ...resto] = p.fotos;
  const miniaturas = resto.slice(0, 3);

  // Competição e estádio longos: reduz a fonte antes de passar das margens.
  const linha = `${p.partida.competicao} · ${p.estadio.nome}`;
  const fonte = linha.length > 40 ? 20 : linha.length > 30 ? 24 : 28;

  const temSetor = mostrar && !!setor;

  return (
    <div className={c.raiz} style={{ width: 1080, height: 1920 }}>
      {principal && <img className={c.foto} data-foto={0} src={fundoSuave ?? principal} alt="" style={filtrosCss ? { filter: "blur(3px) saturate(1.1)" } : undefined} />}
      <div className={c.veu} />
      <img className={c.logo} src="/marca/logotipo-cativa-papel.svg" alt="Cativa" />

      <div className={c.placar}>
        <div className={c.competicao} style={{ fontSize: fonte }}>
          {linha}
        </div>
        <div className={c.linhaPlacar} data-edit="placar">
          <span className={c.escudo}>
            <IdentidadeTime time={casa} tamanho={120} />
          </span>
          <span className={c.gols}>{golsCasa}</span>
          <span className={c.vezes}>×</span>
          <span className={c.gols}>{golsFora}</span>
          <span className={c.escudo}>
            <IdentidadeTime time={fora} tamanho={120} />
          </span>
        </div>
      </div>

      <svg className={c.serrilha} viewBox="0 0 1080 40" width="1080" height="40" aria-hidden="true">
        <path d={ONDA} fill="#F4EBD9" />
      </svg>

      <div className={c.papel}>
        <div className={c.linhaNumero}>
          <div>
            {mostrar ? (
              <>
                <small className={c.rotulo}>PRESENÇA</small>
                <div className={c.numero}>{numeroPresenca(p.numero)}</div>
              </>
            ) : null}
          </div>
          {miniaturas.length > 0 && (
            <div className={c.miniaturas}>
              {miniaturas.map((f, i) => (
                <img key={i} src={f} alt="" data-foto={i + 1} />
              ))}
            </div>
          )}
        </div>
        <div className={`${c.dados} ${temSetor ? "" : c.dadosDois}`}>
          <div>
            <small className={c.rotulo}>DATA</small>
            <div className={c.valor}>{formatarData(p.partida.data)}</div>
          </div>
          {temSetor && (
            <div>
              <small className={c.rotulo}>SETOR</small>
              <div className={c.valor}>{setor}</div>
            </div>
          )}
          <img className={c.logoVerde} src="/marca/logotipo-cativa-verde.svg" alt="Cativa" />
        </div>
      </div>
    </div>
  );
}

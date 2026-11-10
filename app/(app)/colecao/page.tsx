"use client";

import { useState } from "react";
import { EstadoVazio, Progresso, TituloSecao } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { AdesivoEstadio, CartaoPartida, SeloConquista } from "@/components/cativa/Registros";
import { useAbaDaUrl } from "@/components/cativa/useAbaDaUrl";
import { ESTADIOS, chaveDoEstadio } from "@/lib/dados/estadios";
import { NIVEIS, NOME_RESULTADO } from "@/lib/dados/estatisticas";
import { alternarFavorita, resumoDoTorcedor } from "@/lib/dados/loja";
import type { Resultado } from "@/lib/dados/tipos";
import s from "@/components/cativa/ui.module.css";
import c from "./colecao.module.css";

const ABAS = ["partidas", "estadios", "conquistas"] as const;
type Aba = (typeof ABAS)[number];
const SEM_FILTRO = { ano: "", competicao: "", estadio: "", resultado: "" };

function jogos(n: number) {
  return `${n} ${n === 1 ? "jogo" : "jogos"}`;
}

export default function Colecao() {
  const [aba, setAba] = useAbaDaUrl<Aba>("partidas", ABAS);
  const [filtro, setFiltro] = useState(SEM_FILTRO);

  return (
    <ComDados>
      {(dados) => {
        const { est, conquistas, recentes } = resumoDoTorcedor(dados);
        const visitas = new Map<string, number>();
        dados.presencas.forEach((p) => visitas.set(chaveDoEstadio(p.estadio), (visitas.get(chaveDoEstadio(p.estadio)) ?? 0) + 1));
        const doCatalogo = new Set(ESTADIOS.map((e) => e.id));
        const foraDoCatalogo = [...new Map(dados.presencas.filter((p) => !p.estadio.id || !doCatalogo.has(p.estadio.id)).map((p) => [chaveDoEstadio(p.estadio), p.estadio])).values()];
        const colados = ESTADIOS.filter((e) => visitas.has(e.id)).length;
        const estadiosOrdenados = [...ESTADIOS].sort((a, b) => Number(visitas.has(b.id)) - Number(visitas.has(a.id)));

        const anos = [...new Set(dados.presencas.map((p) => p.partida.data.slice(0, 4)))].sort().reverse();
        const competicoes = [...new Set(dados.presencas.map((p) => p.partida.competicao))].sort();
        const estadiosUsados = [...new Map(dados.presencas.map((p) => [chaveDoEstadio(p.estadio), p.estadio.nome])).entries()];
        const filtradas = recentes.filter(
          (p) =>
            (!filtro.ano || p.partida.data.startsWith(filtro.ano)) &&
            (!filtro.competicao || p.partida.competicao === filtro.competicao) &&
            (!filtro.estadio || chaveDoEstadio(p.estadio) === filtro.estadio) &&
            (!filtro.resultado || p.resultado === filtro.resultado),
        );
        const temFiltro = Object.values(filtro).some(Boolean);
        const porTemporada = [...new Set(filtradas.map((p) => p.partida.data.slice(0, 4)))]
          .sort()
          .reverse()
          .map((ano) => [ano, filtradas.filter((p) => p.partida.data.startsWith(ano))] as const);

        return (
          <>
            {/* Cabeçalho na cor do time, como no Início e na Torcida */}
            <header className={c.topo}>
              <div className={c.topoLinha}>
                <span role="img" aria-label="Cativa" className={c.logo} />
              </div>
              <p className={c.sobretitulo}>Seu álbum de arquibancada</p>
              <h1 className={c.titulo}>Coleção</h1>
              <p className={c.descricao}>
                {est.total === 0
                  ? "Cada jogo que você vir no estádio vira um ingresso guardado aqui."
                  : `Desde ${anos[anos.length - 1]}: ${jogos(est.total)} em ${est.estadios} ${est.estadios === 1 ? "estádio" : "estádios"}.`}
              </p>
            </header>
            <main className={c.pagina}>
              <div className={c.abas} role="tablist">
                {(
                  [
                    { valor: "partidas", rotulo: est.total === 1 ? "Ingresso" : "Ingressos", contagem: est.total },
                    { valor: "estadios", rotulo: est.estadios === 1 ? "Estádio" : "Estádios", contagem: est.estadios },
                    { valor: "conquistas", rotulo: "Conquistas", contagem: conquistas.filter((q) => q.desbloqueada).length },
                  ] as { valor: Aba; rotulo: string; contagem: number }[]
                ).map((a) => (
                  <button key={a.valor} type="button" role="tab" aria-selected={aba === a.valor} onClick={() => setAba(a.valor)}>
                    <strong>{a.contagem}</strong>
                    <span>{a.rotulo}</span>
                  </button>
                ))}
              </div>

              {aba === "partidas" &&
                (est.total === 0 ? (
                  <EstadoVazio
                    titulo="Sua história começa com uma presença."
                    texto="Cada jogo que você vir no estádio vira um selo aqui, com fotos, setor e a frase do jogo."
                    acao={{ rotulo: "Cheguei no estádio", href: "/presenca" }}
                  />
                ) : (
                  <>
                    <div className={c.filtros} role="group" aria-label="Filtrar jogos">
                      <Filtro rotulo="Ano" todos="Todos os anos" valor={filtro.ano} onChange={(v) => setFiltro({ ...filtro, ano: v })} opcoes={anos.map((a) => [a, a])} />
                      <Filtro
                        rotulo="Resultado"
                        todos="Todos os resultados"
                        valor={filtro.resultado}
                        onChange={(v) => setFiltro({ ...filtro, resultado: v })}
                        opcoes={(["V", "E", "D"] as Resultado[]).map((r) => [r, NOME_RESULTADO[r]])}
                      />
                      <Filtro rotulo="Competição" todos="Todas as competições" valor={filtro.competicao} onChange={(v) => setFiltro({ ...filtro, competicao: v })} opcoes={competicoes.map((q) => [q, q])} />
                      <Filtro rotulo="Estádio" todos="Todos os estádios" valor={filtro.estadio} onChange={(v) => setFiltro({ ...filtro, estadio: v })} opcoes={estadiosUsados} />
                      {temFiltro && (
                        <button type="button" className={c.limpar} onClick={() => setFiltro(SEM_FILTRO)}>
                          Limpar
                        </button>
                      )}
                    </div>
                    {filtradas.length > 0 ? (
                      porTemporada.map(([ano, lista]) => (
                        <section key={ano} className={c.temporada} aria-label={`Temporada ${ano}`}>
                          <div className={c.temporadaTopo}>
                            <h2>{ano}</h2>
                            <span>{jogos(lista.length)}</span>
                          </div>
                          <div className={c.lista}>
                            {lista.map((p) => (
                              <CartaoPartida key={p.id} presenca={p} href={`/colecao/partida/${p.id}`} />
                            ))}
                          </div>
                        </section>
                      ))
                    ) : (
                      <EstadoVazio titulo="Nenhum jogo com esses filtros." acao={{ rotulo: "Limpar filtros", onClick: () => setFiltro(SEM_FILTRO) }} />
                    )}
                  </>
                ))}

              {aba === "estadios" && (
                <>
                  <div className={c.albumTopo}>
                    <p>
                      <strong>
                        {colados} de {ESTADIOS.length}
                      </strong>
                      estádios colados no álbum
                    </p>
                    <Progresso valor={colados / ESTADIOS.length} rotulo="Álbum de estádios" />
                  </div>
                  {est.estadios === 0 && <p className={s.textoSuave}>Sua primeira presença cola o primeiro sticker.</p>}
                  <div className={s.album}>
                    {estadiosOrdenados.map((e, i) => (
                      <AdesivoEstadio key={e.id} estadio={e} desbloqueado={visitas.has(e.id)} visitas={visitas.get(e.id)} indice={i} href={`/colecao/estadio/${e.id}`} />
                    ))}
                  </div>
                  {foraDoCatalogo.length > 0 && (
                    <section>
                      <TituloSecao titulo="Outros estádios" />
                      <div className={s.album}>
                        {foraDoCatalogo.map((e, i) => (
                          <AdesivoEstadio
                            key={chaveDoEstadio(e)}
                            estadio={{ id: chaveDoEstadio(e), nome: e.nome, cidade: e.cidade, uf: e.uf }}
                            desbloqueado
                            visitas={visitas.get(chaveDoEstadio(e))}
                            indice={i + 2}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}

              {aba === "conquistas" && (
                <>
                  <section className={s.cartao}>
                    <TituloSecao titulo="Níveis do torcedor" />
                    <ol className={s.niveis}>
                      {NIVEIS.map((n) => {
                        const alcancado = est.total >= n.jogos;
                        return (
                          <li key={n.nome} className={alcancado ? s.nivelAlcancado : undefined}>
                            <strong>{n.nome}</strong>
                            <span>
                              {n.jogos} {n.jogos === 1 ? "jogo" : "jogos"}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                    {est.proximo && (
                      <div className={s.proximoNivel}>
                        <Progresso valor={est.progresso} rotulo={`Progresso até ${est.proximo.nome}`} />
                        <span>
                          {est.total}/{est.proximo.jogos} para <strong>{est.proximo.nome}</strong>
                        </span>
                      </div>
                    )}
                  </section>
                  <TituloSecao titulo="Selos" />
                  <p className={s.textoSuave}>Toque na estrela para levar até 3 selos para o seu perfil.</p>
                  <div className={s.lista}>
                    {[...conquistas]
                      .sort((a, b) => Number(b.desbloqueada) - Number(a.desbloqueada) || b.progresso - a.progresso)
                      .map((c) => (
                        <SeloConquista
                          key={c.conquista.id}
                          status={c}
                          favorita={dados.favoritas.includes(c.conquista.id)}
                          onFavoritar={() => alternarFavorita(c.conquista.id)}
                        />
                      ))}
                  </div>
                </>
              )}
            </main>
          </>
        );
      }}
    </ComDados>
  );
}

/** Chip de filtro: mostra o nome do filtro ou o valor escolhido; o select nativo fica por cima. */
function Filtro({
  rotulo,
  todos,
  valor,
  opcoes,
  onChange,
}: {
  rotulo: string;
  todos: string;
  valor: string; opcoes: [string, string][]; onChange: (v: string) => void }) {
  const escolhido = opcoes.find(([v]) => v === valor)?.[1];
  return (
    <label className={`${c.chip} ${valor ? c.chipAtivo : ""}`}>
      {escolhido ?? rotulo}
      <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <select value={valor} onChange={(e) => onChange(e.target.value)} aria-label={rotulo}>
        <option value="">{todos}</option>
        {opcoes.map(([v, r]) => (
          <option key={v} value={v}>
            {r}
          </option>
        ))}
      </select>
    </label>
  );
}

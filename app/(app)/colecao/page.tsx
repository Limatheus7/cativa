"use client";

import { useState } from "react";
import { Abas, EstadoVazio, Progresso, TituloSecao } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { CabecalhoApp } from "@/components/cativa/Navegacao";
import { AdesivoEstadio, CartaoPartida, SeloConquista } from "@/components/cativa/Registros";
import { useAbaDaUrl } from "@/components/cativa/useAbaDaUrl";
import { ESTADIOS, chaveDoEstadio } from "@/lib/dados/estadios";
import { NIVEIS, NOME_RESULTADO } from "@/lib/dados/estatisticas";
import { alternarFavorita, resumoDoTorcedor } from "@/lib/dados/loja";
import type { Resultado } from "@/lib/dados/tipos";
import s from "@/components/cativa/ui.module.css";

const ABAS = ["partidas", "estadios", "conquistas"] as const;
type Aba = (typeof ABAS)[number];
const SEM_FILTRO = { ano: "", competicao: "", estadio: "", resultado: "" };

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

        return (
          <>
            <CabecalhoApp titulo="Coleção" sobretitulo="Seu álbum de arquibancada" />
            <main className={s.pagina}>
              <Abas<Aba>
                ativa={aba}
                onChange={setAba}
                abas={[
                  { valor: "partidas", rotulo: "Partidas", contagem: est.total },
                  { valor: "estadios", rotulo: "Estádios", contagem: est.estadios },
                  { valor: "conquistas", rotulo: "Conquistas", contagem: conquistas.filter((c) => c.desbloqueada).length },
                ]}
              />

              {aba === "partidas" &&
                (est.total === 0 ? (
                  <EstadoVazio
                    titulo="Sua história começa com uma presença."
                    texto="Cada jogo que você vir no estádio vira um selo aqui, com fotos, setor e a frase do jogo."
                    acao={{ rotulo: "Cheguei no estádio", href: "/presenca" }}
                  />
                ) : (
                  <>
                    <div className={s.filtros}>
                      <Filtro rotulo="Ano" valor={filtro.ano} onChange={(v) => setFiltro({ ...filtro, ano: v })} opcoes={anos.map((a) => [a, a])} />
                      <Filtro rotulo="Competição" valor={filtro.competicao} onChange={(v) => setFiltro({ ...filtro, competicao: v })} opcoes={competicoes.map((c) => [c, c])} />
                      <Filtro rotulo="Estádio" valor={filtro.estadio} onChange={(v) => setFiltro({ ...filtro, estadio: v })} opcoes={estadiosUsados} />
                      <Filtro
                        rotulo="Resultado"
                        valor={filtro.resultado}
                        onChange={(v) => setFiltro({ ...filtro, resultado: v })}
                        opcoes={(["V", "E", "D"] as Resultado[]).map((r) => [r, NOME_RESULTADO[r]])}
                      />
                    </div>
                    {filtradas.length > 0 ? (
                      <div className={s.lista}>
                        {filtradas.map((p) => (
                          <CartaoPartida key={p.id} presenca={p} href={`/colecao/partida/${p.id}`} />
                        ))}
                      </div>
                    ) : (
                      <EstadoVazio titulo="Nenhum jogo com esses filtros." acao={{ rotulo: "Limpar filtros", onClick: () => setFiltro(SEM_FILTRO) }} />
                    )}
                    {temFiltro && filtradas.length > 0 && (
                      <button type="button" className={s.botaoTexto} onClick={() => setFiltro(SEM_FILTRO)}>
                        Limpar filtros
                      </button>
                    )}
                  </>
                ))}

              {aba === "estadios" && (
                <>
                  <div className={s.albumTopo}>
                    <strong>
                      {ESTADIOS.filter((e) => visitas.has(e.id)).length} de {ESTADIOS.length}
                    </strong>
                    <span>estádios do álbum</span>
                    <Progresso valor={ESTADIOS.filter((e) => visitas.has(e.id)).length / ESTADIOS.length} rotulo="Álbum de estádios" />
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

function Filtro({ rotulo, valor, opcoes, onChange }: { rotulo: string; valor: string; opcoes: [string, string][]; onChange: (v: string) => void }) {
  return (
    <label className={s.filtro}>
      <span className={s.somenteLeitor}>{rotulo}</span>
      <select value={valor} onChange={(e) => onChange(e.target.value)} data-ativo={valor ? "" : undefined}>
        <option value="">{rotulo}</option>
        {opcoes.map(([v, r]) => (
          <option key={v} value={v}>
            {r}
          </option>
        ))}
      </select>
    </label>
  );
}

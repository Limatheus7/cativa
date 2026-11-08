"use client";

import Link from "next/link";
import { useTime } from "@/components/app/TimeProvider";
import Monograma from "@/components/Monograma";
import { EstadoVazio, IdentidadeTime, TituloSecao, paraIdentidade } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { IconeCadeira, IconeSino } from "@/components/cativa/Icones";
import { ItemFeed } from "@/components/cativa/Social";
import { autorDoItem } from "@/components/cativa/autores";
import { estadioDeCasa } from "@/lib/dados/estadios";
import { NIVEIS, NOME_RESULTADO, estatisticas } from "@/lib/dados/estatisticas";
import { estiloDoIngresso, formatarData, noEstadio, numeroPresenca, placar } from "@/lib/dados/formato";
import TacaMarcaDagua from "@/components/cativa/TacaMarcaDagua";
import TacaTraco from "@/components/cativa/TacaTraco";
import { alternarCurtida, comentar, montarFeed, resumoDoTorcedor } from "@/lib/dados/loja";
import type { Presenca } from "@/lib/dados/tipos";
import s from "@/components/cativa/ui.module.css";
import FotoDoCabecalho from "./FotoDoCabecalho";
import v from "./inicio.module.css";

function saudacao() {
  const h = new Date().getHours();
  return h < 5 ? "Boa noite" : h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export default function Inicio() {
  const time = useTime();
  const meuTime = paraIdentidade(time);
  const casa = estadioDeCasa(time.clube ?? time.iniciais);
  const ano = new Date().getFullYear();

  return (
    <ComDados>
      {(dados) => {
        const { est, recentes, naoLidas } = resumoDoTorcedor(dados);
        // Temporada: só os jogos do ano corrente. Estádios e nível contam a história toda.
        const temporada = estatisticas(dados.presencas.filter((p) => p.partida.data.startsWith(String(ano))));
        const feed = montarFeed(dados);
        const ultimo = recentes[0];

        return (
          <>
            {/* Cabeçalho na cor do time; textos, logotipo e detalhes se ajustam para ler bem. */}
            <header className={v.topo}>
              <div className={v.topoLinha}>
                <span role="img" aria-label="Cativa" className={v.logo} />
                <Link href="/notificacoes" className={v.sino} aria-label={`Notificações${naoLidas ? `, ${naoLidas} novas` : ""}`}>
                  <IconeSino tamanho={20} />
                  {naoLidas > 0 && <span className={v.ponto} />}
                </Link>
              </div>
              <div className={v.identidade}>
                <FotoDoCabecalho nome={dados.perfil.nome} foto={dados.perfil.foto} />
                <div className={v.identidadeTexto}>
                  <p className={v.saudacao}>{saudacao()}</p>
                  <h1 className={v.nome}>{dados.perfil.nome || "Torcedor"}</h1>
                  <div className={v.timeLinha}>
                    <Monograma time={time} tamanho={22} contorno="color-mix(in srgb, var(--time-sobre-principal) 55%, transparent)" />
                    <span>{time.nome}</span>
                    <span className={v.nivel}>{est.nivel?.nome ?? "Estreante"}</span>
                  </div>
                </div>
              </div>
            </header>

            <main className={`${s.pagina} ${v.pagina}`}>
              {/* Sua temporada */}
              <section className={v.temporada} aria-label={`Sua temporada ${ano}`}>
                <div className={v.temporadaTopo}>
                  <span className={v.rotulo}>Sua temporada {ano}</span>
                  <Link href="/colecao">Ver histórico</Link>
                </div>

                <div className={v.destaque}>
                  <strong>{temporada.total}</strong>
                  <div>
                    <span>{temporada.total === 1 ? "jogo no estádio" : "jogos no estádio"}</span>
                    <small>{casa ? `${noEstadio(casa.nome)} e fora` : "em casa e fora"}</small>
                  </div>
                </div>

                <div className={v.ved}>
                  {(["V", "E", "D"] as const).map((r) => (
                    <div key={r} className={v[`ved${r}`]}>
                      <strong>{temporada[r]}</strong>
                      <span>{r === "V" ? "Vitórias" : r === "E" ? "Empates" : "Derrotas"}</span>
                    </div>
                  ))}
                </div>

                <div className={v.regua}>
                  <div className={v.reguaTexto}>
                    <span>
                      <strong>{est.estadios}</strong> {est.estadios === 1 ? "estádio visitado" : "estádios visitados"}
                    </span>
                    <span>
                      {est.proximo ? (
                        <>
                          {est.total === 0 ? "1º jogo te faz " : `faltam ${est.proximo.jogos - est.total} para `}
                          <strong>{est.proximo.nome}</strong>
                        </>
                      ) : (
                        <strong>Cadeira Cativa</strong>
                      )}
                    </span>
                  </div>
                  <div className={v.reguaBarra} aria-hidden="true">
                    <span style={{ width: `${Math.max(est.progresso, est.total ? 0.04 : 0) * 100}%` }} />
                  </div>
                  <div className={v.reguaNiveis}>
                    {NIVEIS.map((n) => (
                      <span key={n.nome} className={est.nivel?.nome === n.nome ? v.nivelAtual : est.total >= n.jogos ? v.nivelPassado : undefined}>
                        {n.nome.replace("Cadeira ", "")}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* Seu último jogo */}
              {ultimo ? (
                <section>
                  <TituloSecao titulo="Seu último jogo" acao={{ rotulo: "Ver coleção", href: "/colecao" }} />
                  <UltimoJogo presenca={ultimo} />
                </section>
              ) : (
                <Link href="/presenca" className={s.chamadaPresenca}>
                  <span className={s.chamadaIcone}>
                    <IconeCadeira tamanho={28} />
                  </span>
                  <span>
                    <strong>Sua história começa com uma presença.</strong>
                    <span>Foi ao estádio? Registre o jogo, mesmo que tenha sido há anos.</span>
                  </span>
                </Link>
              )}

              {/* Sua torcida */}
              <section>
                <TituloSecao titulo="Sua torcida" acao={{ rotulo: "Encontrar torcedores", href: "/torcida?aba=descobrir" }} />
                {feed.length === 0 ? (
                  <EstadoVazio
                    titulo="Sua torcida ainda está começando."
                    texto="Encontre amigos e acompanhe suas histórias."
                    acao={{ rotulo: "Encontrar torcedores", href: "/torcida?aba=descobrir" }}
                  />
                ) : (
                  <div className={s.lista}>
                    {feed.map((item) => (
                      <ItemFeed
                        key={item.id}
                        item={item}
                        autor={autorDoItem(item, dados, meuTime)}
                        curtido={dados.curtidas.includes(item.id)}
                        curtidas={item.curtidasBase + (dados.curtidas.includes(item.id) ? 1 : 0)}
                        comentarios={dados.comentarios[item.id] ?? []}
                        onCurtir={() => alternarCurtida(item.id)}
                        onComentar={(t) => comentar(item.id, t)}
                      />
                    ))}
                  </div>
                )}
                {dados.seguindo.length > 0 && (
                  <p className={s.notaDemo}>Os torcedores da rede são perfis de demonstração enquanto a Cativa não está no ar.</p>
                )}
              </section>
            </main>
          </>
        );
      }}
    </ComDados>
  );
}

/** Último jogo como ingresso: placar grande, data, estádio e setor; canhoto com o Nº da presença. */
function UltimoJogo({ presenca: p }: { presenca: Presenca }) {
  const pl = placar(p);
  const timeCasa = p.partida.mando !== "fora" ? p.time : p.partida.adversario;
  const timeFora = p.partida.mando !== "fora" ? p.partida.adversario : p.time;
  const mando = p.partida.mando === "casa" ? "Em casa" : p.partida.mando === "fora" ? "Fora" : "Campo neutro";

  const estilo = estiloDoIngresso(p.partida.competicao);

  return (
    <Link href={`/colecao/partida/${p.id}`} className={v.ingresso} data-estilo={estilo}>
      <div className={v.ingressoCorpo}>
        {estilo === "libertadores" && <TacaMarcaDagua className={v.marcaDagua} />}
        {estilo === "brasileirao" && <TacaTraco className={v.marcaTraco} />}
        <span className={v.rotuloOuro}>
          {p.partida.competicao} · {mando}
        </span>
        <div className={v.confronto}>
          <div className={v.lado}>
            <IdentidadeTime time={timeCasa} tamanho={34} />
            <span>{timeCasa.nome}</span>
          </div>
          <div className={v.placarGrande}>
            <strong>
              {pl.casa.gols} <span>×</span> {pl.fora.gols}
            </strong>
            <span>{NOME_RESULTADO[p.resultado]}</span>
          </div>
          <div className={v.lado}>
            <IdentidadeTime time={timeFora} tamanho={34} />
            <span>{timeFora.nome}</span>
          </div>
        </div>
        <dl className={v.dados}>
          <div>
            <dt>Data</dt>
            <dd>{formatarData(p.partida.data)}</dd>
          </div>
          <div>
            <dt>Estádio</dt>
            <dd>{p.estadio.nome}</dd>
          </div>
          <div>
            <dt>Setor</dt>
            <dd>{p.lugar?.setor || "—"}</dd>
          </div>
        </dl>
      </div>
      <div className={v.canhoto}>
        <IconeCadeira tamanho={28} />
        <span>Presença</span>
        <strong>{numeroPresenca(p.numero)}</strong>
      </div>
    </Link>
  );
}

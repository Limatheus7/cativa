"use client";

import Link from "next/link";
import { useTime } from "@/components/app/TimeProvider";
import { Avatar, EstadoVazio, TituloSecao, paraIdentidade } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { IconeCadeira, IconeCamera, IconeSino } from "@/components/cativa/Icones";
import { CartaoPartida } from "@/components/cativa/Registros";
import { ItemFeed } from "@/components/cativa/Social";
import { autorDoItem } from "@/components/cativa/autores";
import { estadioDeCasa } from "@/lib/dados/estadios";
import { alternarCurtida, comentar, montarFeed, resumoDoTorcedor } from "@/lib/dados/loja";
import { noEstadio } from "@/lib/dados/formato";
import s from "@/components/cativa/ui.module.css";
import v from "./inicio.module.css";

export default function Inicio() {
  const time = useTime();
  const meuTime = paraIdentidade(time);
  const casa = estadioDeCasa(time.clube ?? time.iniciais);

  return (
    <ComDados>
      {(dados) => {
        const { est, recentes, naoLidas } = resumoDoTorcedor(dados);
        const feed = montarFeed(dados);

        return (
          <>
            {/* Cabeçalho na cor do time: muda sozinho quando o torcedor troca de time. */}
            <header className={v.topo}>
              <div className={v.topoLinha}>
                {/* Foto de perfil; sem foto, as iniciais levam para adicionar uma. */}
                <Link
                  href={dados.perfil.foto ? "/perfil" : "/perfil/editar"}
                  className={v.escudo}
                  aria-label={dados.perfil.foto ? "Seu perfil" : "Adicionar foto de perfil"}
                >
                  <Avatar nome={dados.perfil.nome || "Torcedor"} foto={dados.perfil.foto} tamanho={52} />
                  {!dados.perfil.foto && (
                    <span className={v.semFoto} aria-hidden="true">
                      <IconeCamera tamanho={12} />
                    </span>
                  )}
                </Link>
                <div className={v.quem}>
                  <div className={v.nomeLinha}>
                    <span className={v.nome}>{dados.perfil.nome || "Torcedor"}</span>
                    <span className={v.etiqueta}>{est.nivel?.nome ?? "Estreante"}</span>
                  </div>
                  <span className={v.time}>{time.nome}</span>
                </div>
                <div className={v.acoes}>
                  <Link href="/notificacoes" className={v.acao} aria-label={`Notificações${naoLidas ? `, ${naoLidas} novas` : ""}`}>
                    <IconeSino />
                    {naoLidas > 0 && <span className={v.ponto} />}
                  </Link>
                </div>
              </div>
            </header>

            <main className={s.pagina}>
              <section>
                <div className={v.secaoTopo}>
                  <div>
                    <h2>Meus jogos</h2>
                    <p>{casa ? `Histórico ${noEstadio(casa.nome)} e fora` : "Seu histórico em casa e fora"}</p>
                  </div>
                  <span className={v.salvos}>
                    {est.total} {est.total === 1 ? "jogo salvo" : "jogos salvos"}
                  </span>
                </div>

                <div className={v.placar}>
                  <Link href="/colecao" className={v.coluna}>
                    <strong>{est.total}</strong>
                    <span>Ao vivo</span>
                  </Link>
                  {(["V", "E", "D"] as const).map((r) => (
                    <Link
                      key={r}
                      href={`/colecao`}
                      className={`${v.coluna} ${v[r.toLowerCase()]}`}
                      aria-label={`${est[r]} ${r === "V" ? "vitórias" : r === "E" ? "empates" : "derrotas"}`}
                    >
                      <strong>{est[r]}</strong>
                      <span className={v.pilula}>{r}</span>
                    </Link>
                  ))}
                </div>

                <div className={v.rodapePlacar}>
                  {est.proximo ? (
                    <>
                      <div className={v.barra} aria-hidden="true">
                        <span style={{ width: `${Math.max(est.progresso, 0.03) * 100}%` }} />
                      </div>
                      <span>
                        {est.estadios} {est.estadios === 1 ? "estádio" : "estádios"} ·{" "}
                        {est.total === 0 ? "seu primeiro jogo te faz " : `faltam ${est.proximo.jogos - est.total} para `}
                        <strong>{est.proximo.nome}</strong>
                      </span>
                    </>
                  ) : (
                    <span>
                      {est.estadios} estádios · você é <strong>Cadeira Cativa</strong>
                    </span>
                  )}
                </div>
              </section>

              {est.total === 0 ? (
                <Link href="/presenca" className={s.chamadaPresenca}>
                  <span className={s.chamadaIcone}>
                    <IconeCadeira tamanho={28} />
                  </span>
                  <span>
                    <strong>Sua história começa com uma presença.</strong>
                    <span>Foi ao estádio? Registre o jogo, mesmo que tenha sido há anos.</span>
                  </span>
                </Link>
              ) : (
                <section>
                  <TituloSecao titulo="Seu último jogo" acao={{ rotulo: "Ver coleção", href: "/colecao" }} />
                  <div className={s.lista}>
                    {recentes.slice(0, 1).map((p) => (
                      <CartaoPartida key={p.id} presenca={p} href={`/colecao/partida/${p.id}`} />
                    ))}
                  </div>
                </section>
              )}

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

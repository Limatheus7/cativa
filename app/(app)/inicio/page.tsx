"use client";

import Link from "next/link";
import { useTime } from "@/components/app/TimeProvider";
import { Avatar, EstadoVazio, Progresso, TituloSecao, paraIdentidade } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { IconeCadeira, IconeSino } from "@/components/cativa/Icones";
import { CabecalhoApp } from "@/components/cativa/Navegacao";
import { CartaoPartida } from "@/components/cativa/Registros";
import { ItemFeed } from "@/components/cativa/Social";
import { autorDoItem } from "@/components/cativa/autores";
import { alternarCurtida, comentar, montarFeed, resumoDoTorcedor } from "@/lib/dados/loja";
import s from "@/components/cativa/ui.module.css";

function saudacao() {
  const h = new Date().getHours();
  return h < 5 ? "Boa noite" : h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export default function Inicio() {
  const time = useTime();
  const meuTime = paraIdentidade(time);

  return (
    <ComDados>
      {(dados) => {
        const { est, recentes, naoLidas } = resumoDoTorcedor(dados);
        const feed = montarFeed(dados);
        const primeiroNome = dados.perfil.nome.split(" ")[0];

        return (
          <>
            <CabecalhoApp
              assinatura
              direita={
                <>
                  <Link href="/notificacoes" className={s.botaoIcone} aria-label={`Notificações${naoLidas ? `, ${naoLidas} novas` : ""}`}>
                    <IconeSino />
                    {naoLidas > 0 && <span className={s.contador}>{naoLidas}</span>}
                  </Link>
                  <Link href="/perfil" aria-label="Seu perfil">
                    <Avatar nome={dados.perfil.nome || "Você"} foto={dados.perfil.foto} tamanho={36} />
                  </Link>
                </>
              }
            />

            <main className={s.pagina}>
              <section className={s.saudacao}>
                <p>
                  {saudacao()}
                  {primeiroNome ? `, ${primeiroNome}` : ""}.
                </p>
                <h2>{est.total > 0 ? "Você estava lá." : "Sua cadeira está guardada."}</h2>
              </section>

              <section className={s.trajetoria} aria-label="Sua trajetória">
                <div className={s.numeros}>
                  <Link href="/colecao" className={s.numero}>
                    <strong>{est.total}</strong>
                    <span>{est.total === 1 ? "partida" : "partidas"}</span>
                  </Link>
                  <Link href="/colecao?aba=estadios" className={s.numero}>
                    <strong>{est.estadios}</strong>
                    <span>{est.estadios === 1 ? "estádio" : "estádios"}</span>
                  </Link>
                  <Link href="/colecao?aba=conquistas" className={s.numero}>
                    <strong className={s.numeroNivel}>{est.nivel?.nome ?? "—"}</strong>
                    <span>nível</span>
                  </Link>
                </div>
                {est.proximo && (
                  <div className={s.proximoNivel}>
                    <Progresso valor={est.progresso} rotulo={`Progresso até ${est.proximo.nome}`} />
                    <span>
                      Faltam {est.proximo.jogos - est.total} para <strong>{est.proximo.nome}</strong>
                    </span>
                  </div>
                )}
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
                  <TituloSecao titulo="Seus jogos recentes" acao={{ rotulo: "Ver coleção", href: "/colecao" }} />
                  <div className={s.lista}>
                    {recentes.slice(0, 2).map((p) => (
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

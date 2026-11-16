"use client";

import { useParams } from "next/navigation";
import { EstadoVazio, TituloSecao } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { CabecalhoApp } from "@/components/cativa/Navegacao";
import { AdesivoEstadio, CartaoPartida } from "@/components/cativa/Registros";
import TicketVisita from "@/components/cativa/TicketVisita";
import { ESTADIOS, estadioPorId } from "@/lib/dados/estadios";
import { ordenarPorData } from "@/lib/dados/estatisticas";
import { formatarData } from "@/lib/dados/formato";
import s from "@/components/cativa/ui.module.css";

export default function DetalheEstadio() {
  const { id } = useParams<{ id: string }>();
  const estadio = estadioPorId(id);

  if (!estadio) {
    return (
      <>
        <CabecalhoApp titulo="Estádio" voltar="/colecao?aba=estadios" />
        <main className={s.pagina}>
          <EstadoVazio tom="indisponivel" titulo="Esse estádio não está no álbum." acao={{ rotulo: "Ver estádios", href: "/colecao?aba=estadios" }} />
        </main>
      </>
    );
  }

  return (
    <ComDados>
      {(dados) => {
        const jogos = ordenarPorData(dados.presencas.filter((p) => p.estadio.id === estadio.id));
        const visitasAqui = dados.visitas.filter((v) => v.estadio.id === estadio.id).sort((a, b) => b.data.localeCompare(a.data));
        const total = jogos.length + visitasAqui.length;
        const datas = [...jogos.map((p) => p.partida.data), ...visitasAqui.map((v) => v.data)].sort();
        return (
          <>
            <CabecalhoApp titulo={estadio.nome} sobretitulo="Estádio" voltar="/colecao?aba=estadios" />
            <main className={s.pagina}>
              {estadio.arte && (
                <figure className={`${s.poster} ${total > 0 ? "" : s.posterTrancado}`} style={{ margin: 0 }}>
                  <img src={estadio.arte} alt={`Pôster ilustrado do ${estadio.nome}`} />
                </figure>
              )}
              <section className={s.estadioTopo}>
                {!estadio.arte && (
                  <AdesivoEstadio estadio={estadio} desbloqueado={total > 0} visitas={total} indice={ESTADIOS.indexOf(estadio)} />
                )}
                <div>
                  <p>
                    {estadio.apelido ? `${estadio.apelido} · ` : ""}
                    {estadio.cidade}, {estadio.uf}
                  </p>
                  <dl className={s.resumoLista}>
                    <div>
                      <dt>Suas visitas</dt>
                      <dd>{total}</dd>
                    </div>
                    <div>
                      <dt>Primeira presença</dt>
                      <dd>{datas[0] ? formatarData(datas[0]) : "—"}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              {visitasAqui.length > 0 && (
                <section>
                  <TituloSecao titulo="Suas visitas aqui" />
                  <div className={s.lista}>
                    {visitasAqui.map((v) => (
                      <TicketVisita key={v.id} visita={v} href={`/colecao/visita/${v.id}`} />
                    ))}
                  </div>
                </section>
              )}

              {jogos.length > 0 ? (
                <section>
                  <TituloSecao titulo="Seus jogos aqui" />
                  <div className={s.lista}>
                    {jogos.map((p) => (
                      <CartaoPartida key={p.id} presenca={p} href={`/colecao/partida/${p.id}`} />
                    ))}
                  </div>
                </section>
              ) : total === 0 ? (
                <EstadoVazio
                  titulo="Você ainda não esteve aqui."
                  texto="Já foi a um jogo neste estádio? Registre e cole o sticker no seu álbum."
                  acao={{ rotulo: "Registrar presença aqui", href: `/presenca?estadio=${estadio.id}` }}
                />
              ) : null}
            </main>
          </>
        );
      }}
    </ComDados>
  );
}

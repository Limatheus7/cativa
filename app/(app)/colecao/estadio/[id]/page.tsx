"use client";

import { useParams } from "next/navigation";
import { EstadoVazio, TituloSecao } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { CabecalhoApp } from "@/components/cativa/Navegacao";
import { AdesivoEstadio, CartaoPartida } from "@/components/cativa/Registros";
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
        const primeira = jogos[jogos.length - 1];
        return (
          <>
            <CabecalhoApp titulo={estadio.nome} sobretitulo="Estádio" voltar="/colecao?aba=estadios" />
            <main className={s.pagina}>
              <section className={s.estadioTopo}>
                <AdesivoEstadio estadio={estadio} desbloqueado={jogos.length > 0} visitas={jogos.length} indice={ESTADIOS.indexOf(estadio)} />
                <div>
                  <p>
                    {estadio.apelido ? `${estadio.apelido} · ` : ""}
                    {estadio.cidade}, {estadio.uf}
                  </p>
                  <dl className={s.resumoLista}>
                    <div>
                      <dt>Suas visitas</dt>
                      <dd>{jogos.length}</dd>
                    </div>
                    <div>
                      <dt>Primeira presença</dt>
                      <dd>{primeira ? formatarData(primeira.partida.data) : "—"}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              {jogos.length > 0 ? (
                <section>
                  <TituloSecao titulo="Seus jogos aqui" />
                  <div className={s.lista}>
                    {jogos.map((p) => (
                      <CartaoPartida key={p.id} presenca={p} href={`/colecao/partida/${p.id}`} />
                    ))}
                  </div>
                </section>
              ) : (
                <EstadoVazio
                  titulo="Você ainda não esteve aqui."
                  texto="Já foi a um jogo neste estádio? Registre e cole o sticker no seu álbum."
                  acao={{ rotulo: "Registrar presença aqui", href: `/presenca?estadio=${estadio.id}` }}
                />
              )}
            </main>
          </>
        );
      }}
    </ComDados>
  );
}

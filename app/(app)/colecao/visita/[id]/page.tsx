"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { EstadoVazio } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { IconeCadeira } from "@/components/cativa/Icones";
import { CabecalhoApp } from "@/components/cativa/Navegacao";
import TicketVisita from "@/components/cativa/TicketVisita";
import { FotosExpansiveis } from "@/components/cativa/VisualizadorFotos";
import { formatarData, numeroPresenca } from "@/lib/dados/formato";
import { despublicarPresenca, publicarPresenca, removerVisita } from "@/lib/dados/loja";
import s from "@/components/cativa/ui.module.css";

export default function DetalheVisita() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);

  return (
    <ComDados>
      {(dados) => {
        const v = dados.visitas.find((x) => x.id === id);
        if (!v) {
          return (
            <>
              <CabecalhoApp titulo="Visita" voltar="/colecao" />
              <main className={s.pagina}>
                <EstadoVazio
                  tom="indisponivel"
                  titulo="Esse registro não está mais aqui."
                  texto="Ele pode ter sido apagado neste aparelho."
                  acao={{ rotulo: "Voltar para a coleção", href: "/colecao" }}
                />
              </main>
            </>
          );
        }
        const publicada = dados.publicadas.includes(v.id);
        return (
          <>
            <CabecalhoApp titulo={numeroPresenca(v.numero)} sobretitulo="Visita" voltar="/colecao" />
            <main className={s.pagina}>
              <section className={s.placarGrande}>
                <IconeCadeira tamanho={44} />
                <strong>Visita</strong>
                <h2>Visitou o {v.estadio.nome}</h2>
                <p>
                  {v.motivo ? `${v.motivo === "Tour" ? "Tour guiado" : v.motivo} · ` : ""}
                  {formatarData(v.data)}
                </p>
              </section>

              {v.frase && <blockquote className={s.fraseGrande}>“{v.frase}”</blockquote>}

              <TicketVisita visita={v} />

              {v.fotos.length > 0 && <FotosExpansiveis fotos={v.fotos} className={s.galeria} />}

              <dl className={s.resumoLista}>
                <div>
                  <dt>Estádio</dt>
                  <dd>
                    {v.estadio.id ? <Link href={`/colecao/estadio/${v.estadio.id}`}>{v.estadio.nome}</Link> : v.estadio.nome} · {v.estadio.cidade}, {v.estadio.uf}
                  </dd>
                </div>
                <div>
                  <dt>Tipo</dt>
                  <dd>Turismo{v.motivo ? ` · ${v.motivo}` : ""}</dd>
                </div>
                <div>
                  <dt>Resultado</dt>
                  <dd>Não se aplica</dd>
                </div>
              </dl>

              <div className={s.lista}>
                {publicada ? (
                  <button type="button" className={`${s.botao} ${s.botaoVazado}`} onClick={() => despublicarPresenca(v.id)}>
                    Tirar da Torcida
                  </button>
                ) : (
                  <button type="button" className={s.botao} onClick={() => publicarPresenca(v.id)}>
                    Compartilhar na Torcida
                  </button>
                )}
                {confirmando ? (
                  <div className={s.confirmar} role="alert">
                    <p>Apagar essa visita? O estádio sai do álbum se não houver outro registro nele.</p>
                    <div>
                      <button type="button" className={s.botaoTexto} onClick={() => setConfirmando(false)}>
                        Manter
                      </button>
                      <button
                        type="button"
                        className={s.botaoPerigo}
                        onClick={() => {
                          removerVisita(v.id);
                          router.replace("/colecao");
                        }}
                      >
                        Apagar registro
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className={s.botaoTexto} onClick={() => setConfirmando(true)}>
                    Apagar registro
                  </button>
                )}
              </div>
            </main>
          </>
        );
      }}
    </ComDados>
  );
}

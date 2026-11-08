"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { EstadoVazio, IdentidadeTime, SeloPresenca } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { CabecalhoApp } from "@/components/cativa/Navegacao";
import { Ingresso } from "@/components/cativa/Registros";
import { formatarData, numeroPresenca, placar } from "@/lib/dados/formato";
import { despublicarPresenca, publicarPresenca, removerPresenca } from "@/lib/dados/loja";
import s from "@/components/cativa/ui.module.css";

export default function DetalhePartida() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);

  return (
    <ComDados>
      {(dados) => {
        const p = dados.presencas.find((x) => x.id === id);
        if (!p) {
          return (
            <>
              <CabecalhoApp titulo="Partida" voltar="/colecao" />
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
        const pl = placar(p);
        const publicada = dados.publicadas.includes(p.id);
        return (
          <>
            <CabecalhoApp titulo={numeroPresenca(p.numero)} sobretitulo="Presença" voltar="/colecao" />
            <main className={s.pagina}>
              <section className={s.placarGrande}>
                <SeloPresenca resultado={p.resultado} tamanho={56} comNome />
                <div>
                  <IdentidadeTime time={p.partida.mando !== "fora" ? p.time : p.partida.adversario} tamanho={40} />
                  <strong>
                    {pl.casa.gols} × {pl.fora.gols}
                  </strong>
                  <IdentidadeTime time={p.partida.mando !== "fora" ? p.partida.adversario : p.time} tamanho={40} />
                </div>
                <p>
                  {p.partida.competicao} · {formatarData(p.partida.data)}
                </p>
              </section>

              {p.frase && <blockquote className={s.fraseGrande}>“{p.frase}”</blockquote>}

              <Ingresso presenca={p} />

              {p.fotos.length > 0 && (
                <div className={s.galeria}>
                  {p.fotos.map((f, i) => (
                    <img key={i} src={f} alt={`Foto ${i + 1} do jogo`} />
                  ))}
                </div>
              )}

              <dl className={s.resumoLista}>
                <div>
                  <dt>Estádio</dt>
                  <dd>
                    {p.estadio.id ? <Link href={`/colecao/estadio/${p.estadio.id}`}>{p.estadio.nome}</Link> : p.estadio.nome} · {p.estadio.cidade}, {p.estadio.uf}
                  </dd>
                </div>
                <div>
                  <dt>Companhia</dt>
                  <dd>{p.companhia.length ? p.companhia.map((c) => c.nome).join(", ") : "—"}</dd>
                </div>
              </dl>

              <div className={s.lista}>
                {publicada ? (
                  <button type="button" className={`${s.botao} ${s.botaoVazado}`} onClick={() => despublicarPresenca(p.id)}>
                    Tirar da Torcida
                  </button>
                ) : (
                  <button type="button" className={s.botao} onClick={() => publicarPresenca(p.id)}>
                    Compartilhar na Torcida
                  </button>
                )}
                {confirmando ? (
                  <div className={s.confirmar} role="alert">
                    <p>Apagar esse registro? Os selos e números que dependem dele também mudam.</p>
                    <div>
                      <button type="button" className={s.botaoTexto} onClick={() => setConfirmando(false)}>
                        Manter
                      </button>
                      <button
                        type="button"
                        className={s.botaoPerigo}
                        onClick={() => {
                          removerPresenca(p.id);
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

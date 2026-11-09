"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Abas, Avatar, EstadoVazio, IdentidadeTime, Progresso, SeloPresenca, TituloSecao } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { CabecalhoApp } from "@/components/cativa/Navegacao";
import { AdesivoEstadio, CartaoPartida } from "@/components/cativa/Registros";
import { useAbaDaUrl } from "@/components/cativa/useAbaDaUrl";
import { ESTADIOS, chaveDoEstadio } from "@/lib/dados/estadios";
import { estatisticas, ordenarPorData } from "@/lib/dados/estatisticas";
import { alternarSeguir } from "@/lib/dados/loja";
import { torcedorPorUsuario } from "@/lib/dados/mock/torcedores";
import { noEstadio } from "@/lib/dados/formato";
import s from "@/components/cativa/ui.module.css";

const ABAS = ["jogos", "estadios"] as const;
type Aba = (typeof ABAS)[number];

export default function PerfilPublico() {
  const { usuario } = useParams<{ usuario: string }>();
  const [aba, setAba] = useAbaDaUrl<Aba>("jogos", ABAS);

  // Chegou pelo toque em "Jogos" ou "Estádios" na Torcida (?aba=...): rola até a coleção.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).get("aba")) return;
    const id = window.setTimeout(() => {
      document.getElementById("colecao-do-torcedor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
    return () => window.clearTimeout(id);
  }, []);
  const torcedor = torcedorPorUsuario(decodeURIComponent(usuario));

  if (!torcedor) {
    return (
      <>
        <CabecalhoApp titulo="Torcedor" voltar="/torcida" />
        <main className={s.pagina}>
          <EstadoVazio
            tom="indisponivel"
            titulo="Esse perfil não está disponível."
            texto="Pode ter mudado de nome ou ficado privado."
            acao={{ rotulo: "Voltar para a Torcida", href: "/torcida" }}
          />
        </main>
      </>
    );
  }

  const est = estatisticas(torcedor.presencas);
  const primeiro = torcedor.nome.split(" ")[0];

  // Álbum de estádios da pessoa: os do catálogo (desbloqueados primeiro) e os de fora dele.
  const visitas = new Map<string, number>();
  torcedor.presencas.forEach((p) => visitas.set(chaveDoEstadio(p.estadio), (visitas.get(chaveDoEstadio(p.estadio)) ?? 0) + 1));
  const doCatalogo = new Set(ESTADIOS.map((e) => e.id));
  const estadiosOrdenados = [...ESTADIOS].sort((a, b) => Number(visitas.has(b.id)) - Number(visitas.has(a.id)));
  const desbloqueados = ESTADIOS.filter((e) => visitas.has(e.id)).length;
  const foraDoCatalogo = [
    ...new Map(
      torcedor.presencas.filter((p) => !p.estadio.id || !doCatalogo.has(p.estadio.id)).map((p) => [chaveDoEstadio(p.estadio), p.estadio]),
    ).values(),
  ];

  return (
    <ComDados>
      {(dados) => {
        const seguindo = dados.seguindo.includes(torcedor.usuario);
        // A coleção (jogos e estádios) fica aberta em perfil público ou para quem já acompanha.
        const podeVerColecao = torcedor.perfilPublico || seguindo;
        const abrirColecao = (destino: Aba) => {
          setAba(destino);
          document.getElementById("colecao-do-torcedor")?.scrollIntoView({ behavior: "smooth", block: "start" });
        };
        const meu = estatisticas(dados.presencas);
        const meusEstadios = new Map(dados.presencas.map((p) => [chaveDoEstadio(p.estadio), p.estadio.nome]));
        const emComum = [...new Set(torcedor.presencas.map((p) => chaveDoEstadio(p.estadio)))]
          .filter((k) => meusEstadios.has(k))
          .map((k) => meusEstadios.get(k)!);
        const mesmoJogo = torcedor.presencas.filter((p) =>
          dados.presencas.some((m) => m.partida.data === p.partida.data && chaveDoEstadio(m.estadio) === chaveDoEstadio(p.estadio)),
        );

        return (
          <>
            <CabecalhoApp titulo={torcedor.nome} voltar="/torcida" />
            <main className={s.pagina}>
              <section className={s.identidadePerfil}>
                <Avatar nome={torcedor.nome} time={torcedor.time} tamanho={88} />
                <h2>{torcedor.nome}</h2>
                <p>
                  @{torcedor.usuario} · {torcedor.cidade}, {torcedor.uf}
                </p>
                <IdentidadeTime time={torcedor.time} mostrarNome tamanho={26} />
                <span className={s.etiqueta}>{torcedor.perfilPublico ? "Perfil de demonstração" : "Perfil privado · demonstração"}</span>
                <button
                  type="button"
                  className={`${s.seguir} ${seguindo ? s.seguindo : ""}`}
                  onClick={() => alternarSeguir(torcedor.usuario)}
                  aria-pressed={seguindo}
                >
                  {seguindo ? "Acompanhando" : "Acompanhar"}
                </button>
              </section>

              <section className={s.placarGeral} aria-label="Números">
                {podeVerColecao ? (
                  <button type="button" className={s.placarBotao} onClick={() => abrirColecao("jogos")} aria-label={`Ver as ${est.total} partidas de ${primeiro}`}>
                    <strong>{est.total}</strong>
                    <span>partidas</span>
                  </button>
                ) : (
                  <div>
                    <strong>{est.total}</strong>
                    <span>partidas</span>
                  </div>
                )}
                {(["V", "E", "D"] as const).map((r) => (
                  <div key={r}>
                    <SeloPresenca resultado={r} tamanho={28} />
                    <strong>{est[r]}</strong>
                  </div>
                ))}
                {podeVerColecao ? (
                  <button type="button" className={s.placarBotao} onClick={() => abrirColecao("estadios")} aria-label={`Ver os ${est.estadios} estádios de ${primeiro}`}>
                    <strong>{est.estadios}</strong>
                    <span>estádios</span>
                  </button>
                ) : (
                  <div>
                    <strong>{est.estadios}</strong>
                    <span>estádios</span>
                  </div>
                )}
              </section>
              <p className={s.nivelLinha}>
                Nível <strong>{est.nivel?.nome ?? "—"}</strong>
              </p>

              <section className={s.cartao}>
                <TituloSecao titulo={`Você e @${torcedor.usuario}`} />
                <div className={s.comparacao}>
                  <div>
                    <strong>{meu.total}</strong>
                    <span>seus jogos</span>
                  </div>
                  <div>
                    <strong>{est.total}</strong>
                    <span>jogos de {primeiro}</span>
                  </div>
                  <div>
                    <strong>{emComum.length}</strong>
                    <span>estádios em comum</span>
                  </div>
                </div>
                <p className={s.textoSuave}>
                  {mesmoJogo.length > 0
                    ? `Vocês estiveram no mesmo jogo ${mesmoJogo.length === 1 ? "uma vez" : `${mesmoJogo.length} vezes`}.`
                    : emComum.length > 0
                      ? `Vocês dois já estiveram ${emComum.map(noEstadio).join(", ")}.`
                      : "Ainda não há estádio em comum. Quem sabe no próximo jogo."}
                </p>
              </section>

              {podeVerColecao && (
                <div id="colecao-do-torcedor" className={s.ancoraColecao}>
                  <Abas<Aba>
                    ativa={aba}
                    onChange={setAba}
                    abas={[
                      { valor: "jogos", rotulo: "Jogos", contagem: est.total },
                      { valor: "estadios", rotulo: "Estádios", contagem: est.estadios },
                    ]}
                  />
                </div>
              )}

              {!podeVerColecao && (
                <EstadoVazio
                  titulo={`A coleção de ${primeiro} é privada.`}
                  texto={`Acompanhe ${primeiro} para ver os jogos e o álbum de estádios.`}
                  acao={{ rotulo: "Acompanhar", onClick: () => alternarSeguir(torcedor.usuario) }}
                />
              )}

              {podeVerColecao && aba === "jogos" &&
                (torcedor.presencas.length > 0 ? (
                  <div className={s.lista}>
                    {ordenarPorData(torcedor.presencas).map((p) => (
                      <CartaoPartida key={p.id} presenca={p} />
                    ))}
                  </div>
                ) : (
                  <EstadoVazio titulo={`${primeiro} ainda não registrou jogos.`} />
                ))}

              {podeVerColecao && aba === "estadios" && (
                <>
                  <div className={s.albumTopo}>
                    <strong>
                      {desbloqueados} de {ESTADIOS.length}
                    </strong>
                    <span>estádios do álbum</span>
                    <Progresso valor={desbloqueados / ESTADIOS.length} rotulo={`Álbum de estádios de ${primeiro}`} />
                  </div>
                  <div className={s.album}>
                    {estadiosOrdenados.map((e, i) => (
                      <AdesivoEstadio key={e.id} estadio={e} desbloqueado={visitas.has(e.id)} visitas={visitas.get(e.id)} indice={i} />
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
            </main>
          </>
        );
      }}
    </ComDados>
  );
}

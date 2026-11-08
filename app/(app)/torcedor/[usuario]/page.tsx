"use client";

import { useParams } from "next/navigation";
import { Avatar, EstadoVazio, IdentidadeTime, SeloPresenca, TituloSecao } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { CabecalhoApp } from "@/components/cativa/Navegacao";
import { CartaoPartida } from "@/components/cativa/Registros";
import { chaveDoEstadio } from "@/lib/dados/estadios";
import { estatisticas, ordenarPorData } from "@/lib/dados/estatisticas";
import { alternarSeguir } from "@/lib/dados/loja";
import { torcedorPorUsuario } from "@/lib/dados/mock/torcedores";
import { noEstadio } from "@/lib/dados/formato";
import s from "@/components/cativa/ui.module.css";

export default function PerfilPublico() {
  const { usuario } = useParams<{ usuario: string }>();
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

  return (
    <ComDados>
      {(dados) => {
        const seguindo = dados.seguindo.includes(torcedor.usuario);
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
                <span className={s.etiqueta}>Perfil de demonstração</span>
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
                <div>
                  <strong>{est.total}</strong>
                  <span>partidas</span>
                </div>
                {(["V", "E", "D"] as const).map((r) => (
                  <div key={r}>
                    <SeloPresenca resultado={r} tamanho={28} />
                    <strong>{est[r]}</strong>
                  </div>
                ))}
                <div>
                  <strong>{est.estadios}</strong>
                  <span>estádios</span>
                </div>
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
                    <span>jogos de {torcedor.nome.split(" ")[0]}</span>
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

              <section>
                <TituloSecao titulo="Últimas presenças" />
                <div className={s.lista}>
                  {ordenarPorData(torcedor.presencas).map((p) => (
                    <CartaoPartida key={p.id} presenca={p} />
                  ))}
                </div>
              </section>
            </main>
          </>
        );
      }}
    </ComDados>
  );
}

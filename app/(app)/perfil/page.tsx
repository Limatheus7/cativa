"use client";

import Link from "next/link";
import { useTime } from "@/components/app/TimeProvider";
import { Avatar, IdentidadeTime, Progresso, SeloPresenca, TituloSecao, paraIdentidade } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { IconeEngrenagem, IconeLapis } from "@/components/cativa/Icones";
import { CabecalhoApp } from "@/components/cativa/Navegacao";
import { CartaoPartida, SeloConquista } from "@/components/cativa/Registros";
import { resumoDoTorcedor } from "@/lib/dados/loja";
import s from "@/components/cativa/ui.module.css";

export default function Perfil() {
  const meuTime = paraIdentidade(useTime());

  return (
    <ComDados>
      {(dados) => {
        const { est, conquistas, recentes } = resumoDoTorcedor(dados);
        const { perfil } = dados;
        const incompleto = !perfil.nome || !perfil.usuario || !perfil.cidade;
        const favoritas = conquistas.filter((c) => c.desbloqueada && dados.favoritas.includes(c.conquista.id));
        const destaque = favoritas.length > 0 ? favoritas : conquistas.filter((c) => c.desbloqueada).slice(0, 3);

        return (
          <>
            <CabecalhoApp
              titulo="Perfil"
              direita={
                <Link href="/perfil/configuracoes" className={s.botaoIcone} aria-label="Configurações">
                  <IconeEngrenagem />
                </Link>
              }
            />
            <main className={s.pagina}>
              <section className={s.identidadePerfil}>
                <Avatar nome={perfil.nome || "Você"} foto={perfil.foto} time={meuTime} tamanho={96} />
                <h2>{perfil.nome || "Seu nome aqui"}</h2>
                <p>
                  {perfil.usuario ? `@${perfil.usuario}` : "@sem.usuario"}
                  {perfil.cidade ? ` · ${perfil.cidade}${perfil.uf ? `, ${perfil.uf}` : ""}` : ""}
                </p>
                <IdentidadeTime time={meuTime} mostrarNome tamanho={26} />
                {perfil.bio && <p className={s.bio}>{perfil.bio}</p>}
                <span className={s.etiquetaNivel}>{est.nivel ? est.nivel.nome : "Sem nível ainda"}</span>
              </section>

              {incompleto && (
                <Link href="/perfil/editar" className={s.avisoPerfil}>
                  <strong>Complete sua identidade de torcedor.</strong>
                  <span>Nome, @usuário e cidade ajudam a sua torcida a te encontrar.</span>
                </Link>
              )}

              <section className={s.placarGeral} aria-label="Seus números">
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
              {est.proximo && (
                <div className={s.proximoNivel}>
                  <Progresso valor={est.progresso} rotulo={`Progresso até ${est.proximo.nome}`} />
                  <span>
                    {est.total === 0 ? "Seu primeiro jogo no estádio te faz " : `Faltam ${est.proximo.jogos - est.total} para `}
                    <strong>{est.proximo.nome}</strong>
                  </span>
                </div>
              )}

              <section>
                <TituloSecao titulo="Conquistas favoritas" acao={{ rotulo: "Todas", href: "/colecao?aba=conquistas" }} />
                {destaque.length > 0 ? (
                  <div className={s.lista}>
                    {destaque.map((c) => (
                      <SeloConquista key={c.conquista.id} status={c} compacto />
                    ))}
                  </div>
                ) : (
                  <p className={s.textoSuave}>Seus selos aparecem aqui conforme você vai ao estádio.</p>
                )}
              </section>

              <section>
                <TituloSecao titulo="Últimas partidas" acao={est.total > 0 ? { rotulo: "Coleção", href: "/colecao" } : undefined} />
                {recentes.length > 0 ? (
                  <div className={s.lista}>
                    {recentes.slice(0, 3).map((p) => (
                      <CartaoPartida key={p.id} presenca={p} href={`/colecao/partida/${p.id}`} />
                    ))}
                  </div>
                ) : (
                  <p className={s.textoSuave}>
                    Nenhum jogo ainda. <Link href="/presenca">Registre o primeiro</Link>.
                  </p>
                )}
              </section>

              <div className={s.lista}>
                <Link href="/colecao" className={s.botao}>
                  Ver minha coleção
                </Link>
                <Link href="/perfil/editar" className={`${s.botao} ${s.botaoVazado}`}>
                  <IconeLapis tamanho={18} /> Editar perfil
                </Link>
              </div>
            </main>
          </>
        );
      }}
    </ComDados>
  );
}

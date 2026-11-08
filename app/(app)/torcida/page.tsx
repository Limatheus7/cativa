"use client";

import Link from "next/link";
import { useState } from "react";
import { useTime } from "@/components/app/TimeProvider";
import { EstadoVazio } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { IconeCadeira, IconeSino } from "@/components/cativa/Icones";
import { useAbaDaUrl } from "@/components/cativa/useAbaDaUrl";
import { estadioDeCasa } from "@/lib/dados/estadios";
import { alternarSeguir, resumoDoTorcedor } from "@/lib/dados/loja";
import { TORCEDORES_DEMONSTRACAO } from "@/lib/dados/mock/torcedores";
import CartaoTorcedor from "./CartaoTorcedor";
import v from "./torcida.module.css";

const ABAS = ["amigos", "rivais", "descobrir"] as const;
type Aba = (typeof ABAS)[number];

function semAcento(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Compartilha pelo celular (WhatsApp etc.); no computador, copia o texto. */
async function compartilhar(texto: string, avisar: (m: string) => void) {
  const url = window.location.origin;
  try {
    if (navigator.share) {
      await navigator.share({ title: "Cativa", text: texto, url });
      return;
    }
    await navigator.clipboard.writeText(`${texto} ${url}`);
    avisar("Mensagem copiada. É só colar na conversa.");
  } catch (e) {
    if ((e as Error)?.name !== "AbortError") avisar("Não deu para compartilhar agora.");
  }
}

export default function Torcida() {
  const time = useTime();
  const [aba, setAba] = useAbaDaUrl<Aba>("amigos", ABAS);
  const [busca, setBusca] = useState("");
  const [gerenciando, setGerenciando] = useState(false);
  const [aviso, setAviso] = useState("");
  const casa = estadioDeCasa(time.clube ?? time.iniciais);

  function avisar(m: string) {
    setAviso(m);
    window.setTimeout(() => setAviso(""), 2600);
  }

  return (
    <ComDados>
      {(dados) => {
        const { naoLidas } = resumoDoTorcedor(dados);
        const termo = semAcento(busca.replace(/^@/, "").trim());
        const combina = (t: (typeof TORCEDORES_DEMONSTRACAO)[number]) =>
          !termo || [t.nome, t.usuario, t.time.nome, t.time.sigla, t.cidade].some((c) => semAcento(c).includes(termo));
        const seguidos = TORCEDORES_DEMONSTRACAO.filter((t) => dados.seguindo.includes(t.usuario));
        // Amigos: quem você acompanha e torce pro mesmo time. Rivais: quem você acompanha e torce pra outro.
        const amigos = seguidos.filter((t) => t.time.sigla === time.iniciais);
        const rivais = seguidos.filter((t) => t.time.sigla !== time.iniciais);
        const descobrir = TORCEDORES_DEMONSTRACAO.filter((t) => !dados.seguindo.includes(t.usuario));
        const lista = (aba === "amigos" ? amigos : aba === "rivais" ? rivais : descobrir).filter(combina);
        const titulo = aba === "amigos" ? "Quem você acompanha" : aba === "rivais" ? "Do outro lado" : "Torcedores para conhecer";
        const podeGerenciar = aba !== "descobrir" && (aba === "amigos" ? amigos : rivais).length > 0;

        return (
          <>
            {/* Cabeçalho no verde da Cativa; o time aparece só na fita ao lado do sobretítulo. */}
            <header className={v.topo}>
              <div className={v.topoLinha}>
                <span role="img" aria-label="Cativa" className={v.logo} />
                <Link href="/notificacoes" className={v.sino} aria-label={`Notificações${naoLidas ? `, ${naoLidas} novas` : ""}`}>
                  <IconeSino tamanho={20} />
                  {naoLidas > 0 && <span className={v.ponto} />}
                </Link>
              </div>
              <p className={v.sobretitulo}>
                <span className={v.fita} aria-hidden="true">
                  {(time.faixas?.length ? time.faixas : [time.corPrincipal, time.corSegunda]).map((c, i) => (
                    <span key={i} style={{ background: c }} />
                  ))}
                </span>
                Quem vai ao estádio com você
              </p>
              <h1 className={v.titulo}>Torcida</h1>
              <p className={v.descricao}>Acompanhe quem divide a arquibancada com você e quem torce do outro lado.</p>
              <label className={v.busca}>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className={v.somenteLeitor}>Buscar torcedores</span>
                <input type="search" placeholder="Buscar por nome ou @usuário" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </label>
            </header>

            <main className={v.pagina}>
              <div className={v.abas} role="tablist">
                {(
                  [
                    { valor: "amigos", rotulo: "Amigos", contagem: amigos.length },
                    { valor: "rivais", rotulo: "Rivais", contagem: rivais.length },
                    { valor: "descobrir", rotulo: "Descobrir" },
                  ] as { valor: Aba; rotulo: string; contagem?: number }[]
                ).map((a) => (
                  <button
                    key={a.valor}
                    type="button"
                    role="tab"
                    aria-selected={aba === a.valor}
                    onClick={() => {
                      setAba(a.valor);
                      setGerenciando(false);
                    }}
                  >
                    {a.contagem !== undefined ? <strong>{a.contagem}</strong> : <span className={v.pontoAba} aria-hidden="true" />}
                    <span>{a.rotulo}</span>
                  </button>
                ))}
              </div>

              <div className={v.secaoTopo}>
                <h2>{titulo}</h2>
                {podeGerenciar && (
                  <button type="button" onClick={() => setGerenciando((g) => !g)} aria-pressed={gerenciando}>
                    {gerenciando ? "Concluir" : "Gerenciar"}
                  </button>
                )}
              </div>

              {lista.length > 0 ? (
                <div className={v.lista}>
                  {lista.map((t) => (
                    <CartaoTorcedor
                      key={t.usuario}
                      torcedor={t}
                      seguindo={dados.seguindo.includes(t.usuario)}
                      onSeguir={() => alternarSeguir(t.usuario)}
                      minhasPresencas={dados.presencas}
                      meuEstadio={casa?.nome}
                      gerenciando={gerenciando}
                      onCombinar={(texto) => compartilhar(texto, avisar)}
                    />
                  ))}
                </div>
              ) : termo ? (
                <EstadoVazio titulo="Ninguém com esse nome por aqui." texto="Tente outro nome, @usuário ou time." acao={{ rotulo: "Limpar busca", onClick: () => setBusca("") }} />
              ) : aba === "amigos" ? (
                <EstadoVazio
                  titulo="Toda arquibancada fica melhor com companhia."
                  texto={`Acompanhe torcedores do ${time.nome} e veja os jogos que eles viveram.`}
                  acao={{ rotulo: "Descobrir torcedores", onClick: () => setAba("descobrir") }}
                />
              ) : aba === "rivais" ? (
                <EstadoVazio
                  titulo="Rival bom também vai ao estádio."
                  texto="Acompanhe torcedores de outros times. Aqui é respeito: cada um com a sua história."
                  acao={{ rotulo: "Descobrir torcedores", onClick: () => setAba("descobrir") }}
                />
              ) : (
                <EstadoVazio titulo="Você já acompanha todo mundo." texto="Quando mais torcedores chegarem, eles aparecem aqui." />
              )}

              <section className={v.convite}>
                <span className={v.conviteIcone} aria-hidden="true">
                  <IconeCadeira tamanho={26} />
                </span>
                <div>
                  <h2>Estádio é melhor junto</h2>
                  <p>Convide quem vai com você e comparem as presenças.</p>
                  <button
                    type="button"
                    onClick={() => compartilhar("Tô registrando os jogos que vejo no estádio na Cativa. Vem pra minha torcida!", avisar)}
                  >
                    <span aria-hidden="true">+</span> Convidar amigos
                  </button>
                </div>
              </section>

              <p className={v.notaDemo}>Perfis de demonstração enquanto a rede da Cativa não está no ar.</p>
            </main>

            {aviso && (
              <p className={v.aviso} role="status">
                {aviso}
              </p>
            )}
          </>
        );
      }}
    </ComDados>
  );
}

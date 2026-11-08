"use client";

import { useState } from "react";
import { useTime } from "@/components/app/TimeProvider";
import { Abas, EstadoVazio } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { CabecalhoApp } from "@/components/cativa/Navegacao";
import { ResumoTorcedor } from "@/components/cativa/Social";
import { useAbaDaUrl } from "@/components/cativa/useAbaDaUrl";
import { alternarSeguir } from "@/lib/dados/loja";
import { TORCEDORES_DEMONSTRACAO } from "@/lib/dados/mock/torcedores";
import s from "@/components/cativa/ui.module.css";

const ABAS = ["amigos", "rivais", "descobrir"] as const;
type Aba = (typeof ABAS)[number];

function semAcento(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default function Torcida() {
  const time = useTime();
  const [aba, setAba] = useAbaDaUrl<Aba>("amigos", ABAS);
  const [busca, setBusca] = useState("");

  return (
    <ComDados>
      {(dados) => {
        const seguidos = TORCEDORES_DEMONSTRACAO.filter((t) => dados.seguindo.includes(t.usuario));
        // Amigos: quem você acompanha e torce pro mesmo time. Rivais: quem você acompanha e torce pra outro.
        const amigos = seguidos.filter((t) => t.time.sigla === time.iniciais);
        const rivais = seguidos.filter((t) => t.time.sigla !== time.iniciais);
        const termo = semAcento(busca.trim());
        const descobrir = TORCEDORES_DEMONSTRACAO.filter((t) => !dados.seguindo.includes(t.usuario)).filter(
          (t) => !termo || [t.nome, t.usuario, t.time.nome, t.time.sigla, t.cidade].some((c) => semAcento(c).includes(termo)),
        );
        const lista = aba === "amigos" ? amigos : aba === "rivais" ? rivais : descobrir;

        return (
          <>
            <CabecalhoApp titulo="Torcida" sobretitulo="Quem vai ao estádio com você" />
            <main className={s.pagina}>
              <Abas<Aba>
                ativa={aba}
                onChange={setAba}
                abas={[
                  { valor: "amigos", rotulo: "Amigos", contagem: amigos.length },
                  { valor: "rivais", rotulo: "Rivais", contagem: rivais.length },
                  { valor: "descobrir", rotulo: "Descobrir" },
                ]}
              />

              {aba === "descobrir" && (
                <label className={s.campo}>
                  <span className={s.somenteLeitor}>Buscar torcedores</span>
                  <input type="search" placeholder="Buscar por nome, @usuário, time ou cidade" value={busca} onChange={(e) => setBusca(e.target.value)} />
                </label>
              )}

              {lista.length > 0 ? (
                <div className={s.lista}>
                  {lista.map((t) => (
                    <ResumoTorcedor key={t.usuario} torcedor={t} seguindo={dados.seguindo.includes(t.usuario)} onSeguir={() => alternarSeguir(t.usuario)} />
                  ))}
                </div>
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
                <EstadoVazio
                  titulo={termo ? "Ninguém com esse nome por aqui." : "Você já acompanha todo mundo."}
                  texto={termo ? "Tente outro nome, time ou cidade." : "Quando mais torcedores chegarem, eles aparecem aqui."}
                  acao={termo ? { rotulo: "Limpar busca", onClick: () => setBusca("") } : undefined}
                />
              )}

              <p className={s.notaDemo}>Perfis de demonstração enquanto a rede da Cativa não está no ar.</p>
            </main>
          </>
        );
      }}
    </ComDados>
  );
}

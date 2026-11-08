"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import Ticket from "@/components/cativa/Ticket";
import type { Presenca } from "@/lib/dados/tipos";
import v from "./inicio.module.css";

const CHAVE = "cativa:ultimo-jogo-aberto";

/** "Seu último jogo" com botão para mostrar ou esconder o ingresso. A escolha fica no aparelho. */
export default function UltimoJogoRecolhivel({ presenca }: { presenca: Presenca }) {
  const [aberto, setAberto] = useState(true);
  const id = useId();

  useEffect(() => {
    try {
      if (localStorage.getItem(CHAVE) === "nao") setAberto(false);
    } catch {}
  }, []);

  function alternar() {
    const novo = !aberto;
    setAberto(novo);
    try {
      localStorage.setItem(CHAVE, novo ? "sim" : "nao");
    } catch {}
  }

  return (
    <section>
      <div className={v.recolhivelTopo}>
        <button type="button" className={v.recolhivelBotao} onClick={alternar} aria-expanded={aberto} aria-controls={id}>
          <h2>Seu último jogo</h2>
          <svg className={v.seta} data-aberto={aberto} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={v.somenteLeitor}>{aberto ? "Esconder" : "Mostrar"}</span>
        </button>
        <Link href="/colecao">Ver coleção</Link>
      </div>
      <div id={id} className={v.recolhivelCorpo} data-aberto={aberto}>
        <div>
          <Ticket presenca={presenca} href={`/colecao/partida/${presenca.id}`} />
        </div>
      </div>
    </section>
  );
}

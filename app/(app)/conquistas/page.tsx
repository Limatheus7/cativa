"use client";

import Cabecalho from "@/components/app/Cabecalho";
import { NIVEIS } from "@/components/CartaoMeusJogos";
import styles from "@/components/app/app.module.css";

export default function Conquistas() {
  return (
    <>
      <Cabecalho titulo="Conquistas" subtitulo="Níveis, estádios e selos" />
      <main className={styles.conteudo}>
        <section className={styles.secao}>
          <h2>Níveis do torcedor</h2>
          <ul className={styles.niveis}>
            {NIVEIS.map((n, i) => (
              <li key={n.nome} className={i === NIVEIS.length - 1 ? styles.nivelTopo : undefined}>
                <img src="/marca/cadeira-verde.svg" alt="" width={824} height={896} />
                <strong>{n.nome}</strong>
                <span>
                  {n.jogos} {n.jogos === 1 ? "jogo" : "jogos"}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <p className={styles.aviso}>Seu primeiro jogo no estádio libera o nível Geral.</p>
      </main>
    </>
  );
}

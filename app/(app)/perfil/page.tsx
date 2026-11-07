"use client";

import Link from "next/link";
import Cabecalho from "@/components/app/Cabecalho";
import { useTime } from "@/components/app/TimeProvider";
import Monograma from "@/components/Monograma";
import styles from "@/components/app/app.module.css";

export default function Perfil() {
  const time = useTime();
  return (
    <>
      <Cabecalho titulo="Perfil" />
      <main className={styles.conteudo}>
        <section className={styles.perfil}>
          <Monograma time={time} tamanho={96} />
          <h2>{time.nome}</h2>
          <p>Torcedor desde o primeiro jogo que você registrar.</p>
        </section>
        <Link href="/meu-time" className={`${styles.botao} ${styles.botaoVazado}`}>
          Trocar time
        </Link>
        <Link href="/" className={`${styles.botao} ${styles.botaoVazado}`}>
          Sair
        </Link>
      </main>
    </>
  );
}

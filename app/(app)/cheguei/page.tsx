"use client";

import Link from "next/link";
import Cabecalho from "@/components/app/Cabecalho";
import styles from "@/components/app/app.module.css";

export default function Cheguei() {
  return (
    <>
      <Cabecalho titulo="Cheguei no estádio" subtitulo="Você estava lá." />
      <main className={styles.conteudo}>
        <section className={styles.vazio}>
          <img src="/marca/cadeira-verde.svg" alt="" width={824} height={896} />
          <h2>O check-in vem aí.</h2>
          <p>Aqui você vai registrar o jogo com fotos, setor e a frase do jogo. É o próximo passo do protótipo.</p>
          <Link href="/meus-jogos" className={`${styles.botao} ${styles.botaoVazado}`}>
            Voltar para Meus jogos
          </Link>
        </section>
      </main>
    </>
  );
}

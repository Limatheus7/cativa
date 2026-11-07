"use client";

import Link from "next/link";
import Cabecalho from "@/components/app/Cabecalho";
import { useTime } from "@/components/app/TimeProvider";
import styles from "@/components/app/app.module.css";

export default function MeusJogos() {
  const time = useTime();
  // Protótipo: ainda sem jogos registrados.
  const placar = { total: 0, V: 0, E: 0, D: 0 };

  return (
    <>
      <Cabecalho titulo="Meus jogos" subtitulo={time.nome} />
      <main className={styles.conteudo}>
        <div className={styles.placar}>
          <div className={styles.placarTotal}>
            <strong>{placar.total}</strong>
            <span>jogos vistos ao vivo</span>
          </div>
          {(["V", "E", "D"] as const).map((r) => (
            <div key={r} className={styles.placarSelo}>
              <span className={`${styles.selo} ${styles[`selo${r}`]}`}>{r}</span>
              <strong>{placar[r]}</strong>
              <span>{r === "V" ? "Vitórias" : r === "E" ? "Empates" : "Derrotas"}</span>
            </div>
          ))}
        </div>

        <section className={styles.vazio}>
          <img src="/marca/cadeira-verde.svg" alt="" width={824} height={896} />
          <h2>Sua cadeira está esperando.</h2>
          <p>Cada jogo que você vir no estádio vira um selo aqui, com fotos, setor e a frase do jogo.</p>
          <Link href="/cheguei" className={styles.botao}>
            Cheguei no estádio
          </Link>
        </section>
      </main>
    </>
  );
}

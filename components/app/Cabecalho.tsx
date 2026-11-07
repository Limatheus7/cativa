"use client";

import Monograma from "@/components/Monograma";
import { useTime } from "./TimeProvider";
import styles from "./app.module.css";

export default function Cabecalho({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  const time = useTime();
  return (
    <header className={styles.cabecalho}>
      <Monograma
        time={time}
        tamanho={44}
        contorno="color-mix(in srgb, var(--time-sobre-principal) 60%, transparent)"
      />
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>
    </header>
  );
}

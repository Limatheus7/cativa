"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useTema } from "@/lib/tema";
import { carregarTime, temaDoTime, type Time } from "@/lib/time";
import styles from "./app.module.css";

const TimeContexto = createContext<Time | null>(null);

/** Time do torcedor dentro do app. Só é usado abaixo do TimeProvider. */
export function useTime(): Time {
  const time = useContext(TimeContexto);
  if (!time) throw new Error("useTime fora do TimeProvider");
  return time;
}

/**
 * Ponto único do tema: todas as telas do app (depois de escolher o time)
 * herdam as cores do time daqui. Sem time salvo, volta para a escolha.
 */
export default function TimeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [time, setTime] = useState<Time | null>(null);

  useEffect(() => {
    const salvo = carregarTime();
    if (salvo) setTime(salvo);
    else router.replace("/meu-time");
  }, [router]);

  // Barra do navegador/celular combinando com o cabeçalho da tela:
  // no Início o cabeçalho é verde Cativa; nas outras telas, o fundo da tela.
  const caminho = usePathname();
  const tema = useTema();
  useEffect(() => {
    if (!time) return;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const antes = meta?.content;
    const fundo = tema === "escuro" ? "#0F2219" : "#F4EBD9";
    if (meta) meta.content = caminho === "/inicio" ? "#1F4D3A" : fundo;
    return () => {
      if (meta && antes) meta.content = antes;
    };
  }, [time, caminho, tema]);

  if (!time) return <div className={styles.app} />;

  return (
    <TimeContexto.Provider value={time}>
      <div className={styles.app} style={temaDoTime(time) as React.CSSProperties}>
        {children}
      </div>
    </TimeContexto.Provider>
  );
}

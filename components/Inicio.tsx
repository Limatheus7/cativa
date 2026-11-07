"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { carregarTime, telaDoTime, temaDoTime, type Time } from "@/lib/time";
import CartaoMeusJogos, { proximoNivel } from "./CartaoMeusJogos";
import styles from "./Inicio.module.css";

/** Pinta o fundo da página e a barra do navegador/celular com a cor do time. */
function useCorDaTela(cor: string | null) {
  useEffect(() => {
    if (!cor) return;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const metaAntes = meta?.content;
    const fundoAntes = document.body.style.background;
    document.body.style.background = cor;
    if (meta) meta.content = cor;
    return () => {
      document.body.style.background = fundoAntes;
      if (meta && metaAntes) meta.content = metaAntes;
    };
  }, [cor]);
}

export default function Inicio() {
  const router = useRouter();
  const [time, setTime] = useState<Time | null>(null);
  const [aviso, setAviso] = useState(false);

  useEffect(() => {
    const salvo = carregarTime();
    if (salvo) setTime(salvo);
    else router.replace("/meu-time");
  }, [router]);

  useCorDaTela(time?.corPrincipal ?? null);

  if (!time) return <main className={styles.tela} />;

  const jogos = 0;
  const proximo = proximoNivel(jogos);
  const tela = telaDoTime(time);

  return (
    <main
      className={styles.tela}
      style={
        {
          ...temaDoTime(time),
          "--inicio-fundo": tela.fundo,
          "--inicio-texto": tela.texto,
        } as React.CSSProperties
      }
    >
      <header className={styles.topo}>
        <span role="img" aria-label="Cativa" className={styles.logotipo} />
        <Link href="/meu-time" className={styles.trocar}>
          Trocar time
        </Link>
      </header>

      <p className={styles.sobretitulo}>{time.nome}</p>
      <h1 className={styles.titulo}>Seu time está com você.</h1>

      <CartaoMeusJogos time={time} jogos={jogos} onCheguei={() => setAviso(true)} />

      {aviso && (
        <p className={styles.aviso} role="status">
          Protótipo: o check-in com fotos, setor e a frase do jogo é o próximo passo.
        </p>
      )}

      {proximo && (
        <p className={styles.nivel}>
          Escreva essa história a partir de agora.
          <br />
          Seu primeiro jogo no estádio te faz <strong>{proximo.nome}</strong>.
        </p>
      )}
    </main>
  );
}

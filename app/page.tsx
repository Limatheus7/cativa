import Link from "next/link";
import styles from "./boas-vindas.module.css";

export default function BoasVindas() {
  return (
    <main className={styles.tela}>
      <div className={styles.fundo} aria-hidden="true" />

      <section className={styles.marca}>
        {/* Símbolo e logotipo oficiais, recoloridos em papel só para contraste com o fundo verde */}
        <img className={styles.cadeira} src="/marca/cadeira-papel.svg" alt="" width={824} height={896} />
        <h1 className={styles.titulo}>
          <img className={styles.logotipo} src="/marca/logotipo-cativa-papel.svg" alt="Cativa" width={762} height={185} />
        </h1>
        <p className={styles.slogan}>
          Sua cadeira cativa
          <br />
          na história do seu time.
        </p>
      </section>

      <nav className={styles.acoes}>
        <Link href="/entrar" className={styles.botao}>
          Entrar
        </Link>
        <Link href="/criar-conta" className={styles.link}>
          Criar conta
        </Link>
      </nav>
    </main>
  );
}

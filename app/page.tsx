import Link from "next/link";
import BotaoGoogle from "@/components/BotaoGoogle";
import styles from "./boas-vindas.module.css";

export default function BoasVindas() {
  return (
    <main className={styles.tela}>
      <div className={styles.formas} aria-hidden="true">
        <span className={styles.forma1} />
        <span className={styles.forma2} />
        <span className={styles.forma3} />
      </div>

      <header className={styles.topo}>
        {/* Logotipo oficial, recolorido em papel só para contraste com o fundo verde */}
        <img className={styles.logotipo} src="/marca/logotipo-cativa-papel.svg" alt="Cativa" width={762} height={185} />
      </header>

      <section className={styles.conteudo}>
        <h1 className={styles.titulo}>
          Sua cadeira cativa
          <br />
          na história do seu time.
        </h1>

        <div className={styles.acoes}>
          <BotaoGoogle className={`${styles.botao} ${styles.botaoClaro}`} />
          <Link href="/telefone" className={`${styles.botao} ${styles.botaoClaro}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6" y="2.5" width="12" height="19" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M10.5 18h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Continuar com telefone
          </Link>
          <Link href="/entrar" className={`${styles.botao} ${styles.botaoVazado}`}>
            Continuar com e-mail
          </Link>
        </div>

        <p className={styles.termos}>
          Ao continuar, você concorda com os <a href="#">Termos de uso</a> e a <a href="#">Política de privacidade</a> da Cativa.
        </p>
      </section>
    </main>
  );
}

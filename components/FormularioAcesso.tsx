"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { carregarTime } from "@/lib/time";
import styles from "./FormularioAcesso.module.css";

export default function FormularioAcesso() {
  const router = useRouter();

  return (
    <main className={styles.tela}>
      <header className={styles.topo}>
        <Link href="/" className={styles.voltar} aria-label="Voltar">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <img className={styles.cadeira} src="/marca/cadeira-verde.svg" alt="" width={824} height={896} />
        <span className={styles.espaco} />
      </header>

      <h1 className={styles.titulo}>Bem-vindo de volta.</h1>
      <p className={styles.subtitulo}>Sua cadeira está guardada.</p>

      <form
        className={styles.formulario}
        onSubmit={(e) => {
          e.preventDefault();
          // Protótipo: sem autenticação real ainda (Supabase). Quem já
          // escolheu o time neste aparelho entra direto no app.
          router.push(carregarTime() ? "/meus-jogos" : "/meu-time");
        }}
      >
        <label className={styles.campo}>
          <span>E-mail</span>
          <input name="email" type="email" inputMode="email" autoComplete="email" required placeholder="voce@email.com" />
        </label>
        <label className={styles.campo}>
          <span>Senha</span>
          <input name="senha" type="password" autoComplete="current-password" required placeholder="Sua senha" />
        </label>

        <button type="button" className={styles.esqueci}>
          Esqueci minha senha
        </button>

        <button type="submit" className={styles.botao}>
          Entrar
        </button>
      </form>

      <p className={styles.rodape}>
        Ainda não tem conta? <Link href="/criar-conta">Criar conta</Link>
      </p>
    </main>
  );
}

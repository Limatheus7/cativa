"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./FormularioAcesso.module.css";

type Modo = "entrar" | "criar";

const textos = {
  entrar: {
    titulo: "Bem-vindo de volta.",
    subtitulo: "Sua cadeira está guardada.",
    botao: "Entrar",
    rodape: "Ainda não tem conta?",
    rodapeLink: "Criar conta",
    rodapeHref: "/criar-conta",
  },
  criar: {
    titulo: "Cadastro Cativa",
    subtitulo: "Pegue sua cadeira. Cada jogo que você vê no estádio fica guardado aqui.",
    botao: "Criar conta",
    rodape: "Já tem conta?",
    rodapeLink: "Entrar",
    rodapeHref: "/entrar",
  },
} as const;

export default function FormularioAcesso({ modo }: { modo: Modo }) {
  const t = textos[modo];
  const [enviado, setEnviado] = useState(false);

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

      <h1 className={styles.titulo}>{t.titulo}</h1>
      <p className={styles.subtitulo}>{t.subtitulo}</p>

      <form
        className={styles.formulario}
        onSubmit={(e) => {
          e.preventDefault();
          setEnviado(true);
        }}
      >
        {modo === "criar" && (
          <label className={styles.campo}>
            <span>Nome</span>
            <input name="nome" autoComplete="name" required placeholder="Como te chamam na arquibancada" />
          </label>
        )}
        <label className={styles.campo}>
          <span>E-mail</span>
          <input name="email" type="email" inputMode="email" autoComplete="email" required placeholder="voce@email.com" />
        </label>
        <label className={styles.campo}>
          <span>Senha</span>
          <input
            name="senha"
            type="password"
            autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            minLength={modo === "criar" ? 8 : undefined}
            required
            placeholder={modo === "criar" ? "Pelo menos 8 caracteres" : "Sua senha"}
          />
        </label>

        {modo === "entrar" && (
          <button type="button" className={styles.esqueci}>
            Esqueci minha senha
          </button>
        )}

        <button type="submit" className={styles.botao}>
          {t.botao}
        </button>

        {enviado && (
          <p className={styles.aviso} role="status">
            Protótipo: o login de verdade chega quando ligarmos o Supabase.
          </p>
        )}
      </form>

      <p className={styles.rodape}>
        {t.rodape} <Link href={t.rodapeHref}>{t.rodapeLink}</Link>
      </p>
    </main>
  );
}

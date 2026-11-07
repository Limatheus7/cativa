"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./FormularioAcesso.module.css";

function mascara(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function FormularioTelefone() {
  const [numero, setNumero] = useState("");
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

      <h1 className={styles.titulo}>Qual é o seu celular?</h1>
      <p className={styles.subtitulo}>A gente manda um código por SMS para você entrar.</p>

      <form
        className={styles.formulario}
        onSubmit={(e) => {
          e.preventDefault();
          setEnviado(true);
        }}
      >
        <label className={styles.campo}>
          <span>Celular</span>
          <div className={styles.telefone}>
            <span className={styles.ddi}>+55</span>
            <input
              name="telefone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              required
              pattern="\(\d{2}\) \d{5}-\d{4}"
              placeholder="(11) 91234-5678"
              value={numero}
              onChange={(e) => setNumero(mascara(e.target.value))}
            />
          </div>
        </label>

        <button type="submit" className={styles.botao}>
          Enviar código
        </button>

        {enviado && (
          <p className={styles.aviso} role="status">
            Protótipo: o código por SMS chega quando ligarmos o Supabase.
          </p>
        )}
      </form>

      <p className={styles.rodape}>
        Prefere e-mail? <Link href="/entrar">Entrar com e-mail</Link>
      </p>
    </main>
  );
}

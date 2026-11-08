"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { iniciarPerfil } from "@/lib/dados/loja";
import base from "./FormularioAcesso.module.css";
import styles from "./FormularioCadastro.module.css";

const regras = [
  { id: "tamanho", texto: "Pelo menos 8 caracteres", ok: (s: string) => s.length >= 8 },
  { id: "maiuscula", texto: "Uma letra maiúscula", ok: (s: string) => /[A-ZÀ-Ý]/.test(s) },
  { id: "especial", texto: "Um caractere especial (!@#$…)", ok: (s: string) => /[^A-Za-zÀ-ÿ0-9\s]/.test(s) },
];

function Check({ ok }: { ok: boolean }) {
  return (
    <span className={`${styles.marca} ${ok ? styles.marcaOk : ""}`} aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12">
        <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function CampoSenha(props: {
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder: string;
  name: string;
  estado?: "ok" | "erro";
}) {
  const [visivel, setVisivel] = useState(false);
  return (
    <label className={base.campo}>
      <span>{props.rotulo}</span>
      <div className={`${styles.senha} ${props.estado === "ok" ? styles.senhaOk : ""} ${props.estado === "erro" ? styles.senhaErro : ""}`}>
        <input
          name={props.name}
          type={visivel ? "text" : "password"}
          autoComplete="new-password"
          required
          placeholder={props.placeholder}
          value={props.valor}
          onChange={(e) => props.onChange(e.target.value)}
        />
        <button type="button" className={styles.olho} onClick={() => setVisivel((v) => !v)} aria-label={visivel ? "Esconder senha" : "Mostrar senha"}>
          {visivel ? "Esconder" : "Mostrar"}
        </button>
      </div>
    </label>
  );
}

export default function FormularioCadastro() {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const router = useRouter();

  const status = regras.map((r) => r.ok(senha));
  const iguais = confirmacao.length > 0 && confirmacao === senha;
  const senhaForte = status.every(Boolean);
  const tudoCerto = senhaForte && iguais;

  return (
    <main className={base.tela}>
      <header className={base.topo}>
        <Link href="/" className={base.voltar} aria-label="Voltar">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <img className={base.cadeira} src="/marca/cadeira-verde.svg" alt="" width={824} height={896} />
        <span className={base.espaco} />
      </header>

      <h1 className={base.titulo}>Pegue sua cadeira.</h1>
      <p className={base.subtitulo}>Cada jogo que você vê no estádio fica guardado aqui.</p>

      <form
        className={base.formulario}
        onSubmit={(e) => {
          e.preventDefault();
          // Protótipo: sem cadastro real ainda (Supabase). Conta criada,
          // o próximo passo é escolher o time.
          if (!tudoCerto) return;
          const campos = new FormData(e.currentTarget);
          iniciarPerfil(String(campos.get("nome") ?? ""), String(campos.get("apelido") ?? ""));
          router.push("/meu-time");
        }}
      >
        <label className={base.campo}>
          <span>Nome completo</span>
          <input name="nome" autoComplete="name" required placeholder="Seu nome e sobrenome" />
        </label>
        <label className={base.campo}>
          <span>Apelido</span>
          <input name="apelido" autoComplete="nickname" required maxLength={30} placeholder="Como te chamam na arquibancada" />
        </label>
        <label className={base.campo}>
          <span>E-mail</span>
          <input name="email" type="email" inputMode="email" autoComplete="email" required placeholder="voce@email.com" />
        </label>

        <CampoSenha
          rotulo="Senha"
          name="senha"
          valor={senha}
          onChange={setSenha}
          placeholder="Crie sua senha"
          estado={senhaForte ? "ok" : undefined}
        />

        <ul className={styles.regras} aria-live="polite">
          {regras.map((r, i) => (
            <li key={r.id} className={status[i] ? styles.cumprida : ""}>
              <Check ok={status[i]} />
              {r.texto}
            </li>
          ))}
        </ul>

        <CampoSenha
          rotulo="Confirmar senha"
          name="confirmacao"
          valor={confirmacao}
          onChange={setConfirmacao}
          placeholder="Repita a senha"
          estado={iguais ? "ok" : confirmacao.length >= senha.length && confirmacao.length > 0 ? "erro" : undefined}
        />
        {confirmacao.length > 0 && !iguais && confirmacao.length >= senha.length && (
          <p className={styles.erro}>As senhas não são iguais.</p>
        )}

        {tudoCerto && (
          <div className={styles.sucesso} role="status">
            <img src="/marca/cadeira-papel.svg" alt="" width={22} height={24} />
            <span>Senha pronta. Sua cadeira está garantida!</span>
          </div>
        )}

        <button type="submit" className={base.botao} disabled={!tudoCerto}>
          Criar conta
        </button>
      </form>

      <p className={base.rodape}>
        Já tem conta? <Link href="/entrar">Entrar</Link>
      </p>
    </main>
  );
}

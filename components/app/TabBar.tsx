"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./app.module.css";

const ABAS = [
  { href: "/meus-jogos", rotulo: "Jogos", icone: <IconeJogos /> },
  { href: "/conquistas", rotulo: "Conquistas", icone: <IconeConquistas /> },
  { href: "/perfil", rotulo: "Perfil", icone: <IconePerfil /> },
];

export default function TabBar() {
  const caminho = usePathname();
  const [jogos, ...resto] = ABAS;

  const aba = (a: (typeof ABAS)[number]) => (
    <Link key={a.href} href={a.href} className={styles.aba} aria-current={caminho === a.href ? "page" : undefined}>
      {a.icone}
      <span>{a.rotulo}</span>
    </Link>
  );

  return (
    <nav className={styles.tabbar} aria-label="Navegação principal">
      {aba(jogos)}
      <Link
        href="/cheguei"
        className={styles.abaCentral}
        aria-current={caminho === "/cheguei" ? "page" : undefined}
      >
        <span className={styles.botaoCentral}>
          <IconeCadeira />
        </span>
        <span>Cheguei</span>
      </Link>
      {resto.map(aba)}
    </nav>
  );
}

const svg = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

function IconeJogos() {
  return (
    <svg {...svg}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M12 5v14M3 10h3v4H3M21 10h-3v4h3" />
    </svg>
  );
}

function IconeConquistas() {
  return (
    <svg {...svg}>
      <circle cx="12" cy="9" r="5" />
      <path d="M8.5 13 7 21l5-3 5 3-1.5-8" />
    </svg>
  );
}

function IconePerfil() {
  return (
    <svg {...svg}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
    </svg>
  );
}

/** Cadeira da marca, em traço, para o botão de check-in. */
function IconeCadeira() {
  return (
    <svg {...svg} strokeWidth={2.2}>
      <path d="M7 12V7a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v5" />
      <rect x="4.5" y="12" width="15" height="4" rx="2" />
      <path d="M7 16v5M17 16v5" />
    </svg>
  );
}

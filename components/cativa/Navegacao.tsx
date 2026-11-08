"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTime } from "@/components/app/TimeProvider";
import { FaixaDoTime, paraIdentidade } from "./Basicos";
import { IconeCadeira, IconeColecao, IconeInicio, IconePerfil, IconeTorcida, IconeVoltar } from "./Icones";
import s from "./ui.module.css";

// ------------------------------------------------------------ BottomNavigation

const ITENS = [
  { href: "/inicio", rotulo: "Início", Icone: IconeInicio },
  { href: "/torcida", rotulo: "Torcida", Icone: IconeTorcida },
  { href: "/presenca", rotulo: "Presença", Icone: IconeCadeira, central: true },
  { href: "/colecao", rotulo: "Coleção", Icone: IconeColecao },
  { href: "/perfil", rotulo: "Perfil", Icone: IconePerfil },
];

/** Área ativa: a própria rota ou qualquer tela dentro dela (ex.: /colecao/estadio/x). */
function areaAtiva(caminho: string) {
  if (caminho.startsWith("/torcedor")) return "/torcida";
  if (caminho.startsWith("/notificacoes")) return "/inicio";
  return ITENS.find((i) => caminho === i.href || caminho.startsWith(`${i.href}/`))?.href;
}

export function BarraNavegacao() {
  const ativa = areaAtiva(usePathname());
  return (
    <nav className={s.barra} aria-label="Navegação principal">
      {ITENS.map(({ href, rotulo, Icone, central }) => (
        <Link
          key={href}
          href={href}
          className={central ? s.barraCentral : s.barraItem}
          aria-current={ativa === href ? "page" : undefined}
        >
          {central ? (
            <span className={s.barraBotaoPresenca}>
              <Icone tamanho={28} />
            </span>
          ) : (
            <Icone tamanho={24} />
          )}
          <span>{rotulo}</span>
        </Link>
      ))}
    </nav>
  );
}

// ------------------------------------------------------------ Cabeçalho das telas

export function CabecalhoApp({
  titulo,
  sobretitulo,
  voltar,
  assinatura = false,
  direita,
}: {
  titulo?: string;
  sobretitulo?: string;
  voltar?: string;
  /** Mostra o logotipo Cativa no lugar do título (Início). */
  assinatura?: boolean;
  direita?: React.ReactNode;
}) {
  const time = useTime();
  return (
    <header className={s.cabecalho}>
      <div className={s.cabecalhoLinha}>
        {voltar && (
          <Link href={voltar} className={s.cabecalhoVoltar} aria-label="Voltar">
            <IconeVoltar />
          </Link>
        )}
        <div className={s.cabecalhoTitulo}>
          {sobretitulo && <span>{sobretitulo}</span>}
          {assinatura ? (
            <h1>
              <img src="/marca/logotipo-cativa-verde.svg" alt="Cativa" width={762} height={185} />
            </h1>
          ) : (
            <h1>{titulo}</h1>
          )}
        </div>
        {direita && <div className={s.cabecalhoDireita}>{direita}</div>}
      </div>
      <FaixaDoTime time={paraIdentidade(time)} />
    </header>
  );
}

"use client";

import Link from "next/link";
import { useEffect } from "react";
import { EstadoVazio } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { CabecalhoApp } from "@/components/cativa/Navegacao";
import { haQuanto } from "@/lib/dados/formato";
import { marcarNotificacoesLidas, useLoja } from "@/lib/dados/loja";
import s from "@/components/cativa/ui.module.css";

export default function Notificacoes() {
  const { status, dados } = useLoja();
  const temNaoLidas = dados.notificacoes.some((n) => !n.lida);

  // Ao sair da tela, o que foi visto passa a contar como lido.
  useEffect(() => {
    if (status !== "pronto" || !temNaoLidas) return;
    return () => marcarNotificacoesLidas();
  }, [status, temNaoLidas]);

  return (
    <>
      <CabecalhoApp titulo="Notificações" voltar="/inicio" />
      <main className={s.pagina}>
        <ComDados>
          {(d) =>
            d.notificacoes.length === 0 ? (
              <EstadoVazio
                titulo="Nada novo por aqui."
                texto="Quando você destravar um sticker, um selo ou um nível, ele aparece aqui."
                acao={{ rotulo: "Cheguei no estádio", href: "/presenca" }}
              />
            ) : (
              <ul className={s.notificacoes}>
                {d.notificacoes.map((n) => (
                  <li key={n.id} className={n.lida ? undefined : s.naoLida}>
                    <Link href={n.href}>
                      <strong>{n.titulo}</strong>
                      <span>{n.texto}</span>
                      <small>{haQuanto(n.criadaEm)}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          }
        </ComDados>
      </main>
    </>
  );
}

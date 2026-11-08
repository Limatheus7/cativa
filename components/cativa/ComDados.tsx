"use client";

import { apagarTudo, recarregar, useLoja } from "@/lib/dados/loja";
import type { DadosDoTorcedor } from "@/lib/dados/tipos";
import { Carregando, EstadoVazio } from "./Basicos";
import s from "./ui.module.css";

/** Estados de carregando e erro iguais em todas as telas; o conteúdo recebe os dados prontos. */
export default function ComDados({ children }: { children: (dados: DadosDoTorcedor) => React.ReactNode }) {
  const { status, dados, erro } = useLoja();

  if (status === "carregando") {
    return (
      <div className={s.pagina}>
        <Carregando linhas={4} />
      </div>
    );
  }

  if (status === "erro") {
    return (
      <div className={s.pagina}>
        <EstadoVazio
          tom="erro"
          titulo="Algo saiu do lugar."
          texto={`${erro ?? "Não conseguimos abrir seus registros."} Tente de novo. Se continuar, dá para recomeçar do zero neste aparelho.`}
          acao={{ rotulo: "Tentar de novo", onClick: recarregar }}
          acaoSecundaria={{ rotulo: "Recomeçar do zero", onClick: apagarTudo }}
        />
      </div>
    );
  }

  return <>{children(dados)}</>;
}

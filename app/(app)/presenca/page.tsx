"use client";

import CheckIn from "@/components/cativa/CheckIn";
import ComDados from "@/components/cativa/ComDados";
import { CabecalhoApp } from "@/components/cativa/Navegacao";
import s from "@/components/cativa/ui.module.css";

export default function Presenca() {
  return (
    <>
      <CabecalhoApp titulo="Cheguei no estádio" sobretitulo="Presença" />
      <main className={s.pagina}>
        <ComDados>{(dados) => <CheckIn dados={dados} />}</ComDados>
      </main>
    </>
  );
}

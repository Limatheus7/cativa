"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { usePresenca } from "@/components/cativa/PresencaProvider";
import Inicio from "../inicio/page";

// /presenca abre a gaveta "Cheguei no estádio" por cima do Início.
// Ao fechar a gaveta, volta para o Início.
export default function Presenca() {
  const { aberta, abrir } = usePresenca();
  const router = useRouter();
  const abriu = useRef(false);

  useEffect(() => {
    abrir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (aberta) abriu.current = true;
    else if (abriu.current) router.replace("/inicio");
  }, [aberta, router]);

  return <Inicio />;
}

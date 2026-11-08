"use client";

import { useEffect, useState } from "react";

/**
 * Aba ativa guardada na URL (?aba=...), para links como /colecao?aba=estadios
 * abrirem direto na aba certa. Lê a URL no navegador para a página continuar estática.
 */
export function useAbaDaUrl<T extends string>(padrao: T, validas: readonly T[]) {
  const [aba, setAba] = useState<T>(padrao);

  useEffect(() => {
    const daUrl = new URLSearchParams(window.location.search).get("aba") as T | null;
    if (daUrl && validas.includes(daUrl)) setAba(daUrl);
    // validas é uma lista fixa por tela
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function mudar(nova: T) {
    setAba(nova);
    const url = new URL(window.location.href);
    url.searchParams.set("aba", nova);
    window.history.replaceState(window.history.state, "", url);
  }

  return [aba, mudar] as const;
}

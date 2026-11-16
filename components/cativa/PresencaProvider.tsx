"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type Ctx = {
  aberta: boolean;
  /** Abre a gaveta "Cheguei no estádio" por cima da tela atual. */
  abrir: (origem?: HTMLElement | null) => void;
  fechar: () => void;
  /** Elemento que abriu a gaveta (o foco volta para ele ao fechar). */
  origem: React.RefObject<HTMLElement | null>;
};

const PresencaContext = createContext<Ctx | null>(null);

export function PresencaProvider({ children }: { children: React.ReactNode }) {
  const [aberta, setAberta] = useState(false);
  const origem = useRef<HTMLElement | null>(null);
  const abrir = useCallback((el?: HTMLElement | null) => {
    origem.current = el ?? (document.activeElement as HTMLElement | null);
    setAberta(true);
  }, []);
  const fechar = useCallback(() => setAberta(false), []);
  const valor = useMemo(() => ({ aberta, abrir, fechar, origem }), [aberta, abrir, fechar]);
  return <PresencaContext.Provider value={valor}>{children}</PresencaContext.Provider>;
}

export function usePresenca() {
  const c = useContext(PresencaContext);
  if (!c) throw new Error("usePresenca precisa estar dentro de PresencaProvider");
  return c;
}

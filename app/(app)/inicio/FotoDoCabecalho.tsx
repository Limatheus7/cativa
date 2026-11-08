"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { iniciaisDoNome } from "@/lib/dados/formato";
import { reduzirFoto } from "@/lib/dados/imagens";
import { atualizarPerfil } from "@/lib/dados/loja";
import { IconeCamera, IconeFechar } from "@/components/cativa/Icones";
import v from "./inicio.module.css";

/**
 * Foto de perfil no cabeçalho do Início.
 * Sem foto: toque abre a galeria/câmera. Com foto: toque abre a foto grande,
 * com opção de trocar ou remover.
 */
export default function FotoDoCabecalho({ nome, foto }: { nome: string; foto?: string }) {
  const entrada = useRef<HTMLInputElement>(null);
  const [aberta, setAberta] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!aberta) return;
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && setAberta(false);
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [aberta]);

  async function escolher(arquivo?: File) {
    if (!arquivo) return;
    setErro("");
    setSalvando(true);
    try {
      atualizarPerfil({ foto: await reduzirFoto(arquivo, 400, 0.8) });
      setAberta(false);
    } catch {
      setErro("Não deu para usar essa foto. Tente outra.");
    } finally {
      setSalvando(false);
      if (entrada.current) entrada.current.value = "";
    }
  }

  return (
    <>
      <button
        type="button"
        className={v.foto}
        onClick={() => (foto ? setAberta(true) : entrada.current?.click())}
        aria-label={foto ? "Ver foto de perfil" : "Adicionar foto de perfil"}
        disabled={salvando}
      >
        {foto ? <img src={foto} alt="" /> : <span className={v.fotoVazia}>{nome ? iniciaisDoNome(nome) : ""}</span>}
        {!foto && (
          <span className={v.fotoCamera} aria-hidden="true">
            <IconeCamera tamanho={13} />
          </span>
        )}
      </button>
      <input ref={entrada} type="file" accept="image/*" hidden onChange={(e) => escolher(e.target.files?.[0])} />
      {erro && !aberta && (
        <p className={v.fotoErro} role="alert">
          {erro}
        </p>
      )}

      {/* O visor vai direto no <body> para ficar acima de tudo (o cabeçalho tem camada própria). */}
      {aberta && foto && createPortal(
        <div className={v.visor} role="dialog" aria-modal="true" aria-label="Foto de perfil" onClick={() => setAberta(false)}>
          <div className={v.visorConteudo} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={v.visorFechar} onClick={() => setAberta(false)} aria-label="Fechar">
              <IconeFechar />
            </button>
            <img src={foto} alt={`Foto de perfil de ${nome || "você"}`} className={v.visorFoto} />
            <p className={v.visorNome}>{nome}</p>
            {erro && (
              <p className={v.fotoErro} role="alert">
                {erro}
              </p>
            )}
            <div className={v.visorAcoes}>
              <button type="button" onClick={() => entrada.current?.click()} disabled={salvando}>
                {salvando ? "Salvando…" : "Trocar foto"}
              </button>
              <button
                type="button"
                className={v.visorRemover}
                onClick={() => {
                  atualizarPerfil({ foto: undefined });
                  setAberta(false);
                }}
              >
                Remover foto
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

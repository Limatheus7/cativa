"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import RecorteFoto from "@/components/cativa/RecorteFoto";
import { IconeCamera, IconeFechar } from "@/components/cativa/Icones";
import { iniciaisDoNome } from "@/lib/dados/formato";
import { reduzirFoto } from "@/lib/dados/imagens";
import { atualizarPerfil } from "@/lib/dados/loja";
import v from "./inicio.module.css";

/**
 * Foto de perfil no cabeçalho do Início.
 * Sem foto: toque abre a galeria/câmera e, em seguida, o enquadramento.
 * Com foto: toque abre a foto grande, com opções de reenquadrar, trocar ou remover.
 */
export default function FotoDoCabecalho({ nome, foto, fotoOriginal }: { nome: string; foto?: string; fotoOriginal?: string }) {
  const entrada = useRef<HTMLInputElement>(null);
  const [aberta, setAberta] = useState(false);
  const [recortando, setRecortando] = useState<string | null>(null);
  const [original, setOriginal] = useState<string | undefined>(fotoOriginal);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!aberta || recortando) return;
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && setAberta(false);
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [aberta, recortando]);

  async function escolher(arquivo?: File) {
    if (!arquivo) return;
    setErro("");
    try {
      // Original reduzido (bom para zoom) vai para o enquadramento.
      const reduzida = await reduzirFoto(arquivo, 1200, 0.82);
      setOriginal(reduzida);
      setRecortando(reduzida);
    } catch {
      setErro("Não deu para abrir essa foto. Tente outra.");
    } finally {
      if (entrada.current) entrada.current.value = "";
    }
  }

  function salvar(recortada: string) {
    try {
      atualizarPerfil({ foto: recortada, fotoOriginal: original });
      setRecortando(null);
      setAberta(false);
    } catch {
      setErro("Não coube no aparelho. Tente uma foto menor.");
      setRecortando(null);
    }
  }

  return (
    <>
      <button
        type="button"
        className={v.foto}
        onClick={() => (foto ? setAberta(true) : entrada.current?.click())}
        aria-label={foto ? "Ver foto de perfil" : "Adicionar foto de perfil"}
      >
        {/* A imagem fica dentro de um círculo que recorta, qualquer que seja o formato. */}
        <span className={v.fotoCirculo}>
          {foto ? <img src={foto} alt="" /> : <span className={v.fotoVazia}>{nome ? iniciaisDoNome(nome) : ""}</span>}
        </span>
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

      {/* Visor da foto, direto no <body> para ficar acima de tudo. */}
      {aberta &&
        foto &&
        !recortando &&
        createPortal(
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
                <button type="button" onClick={() => setRecortando(original ?? fotoOriginal ?? foto)}>
                  Ajustar enquadramento
                </button>
                <button type="button" className={v.visorSecundario} onClick={() => entrada.current?.click()}>
                  Trocar foto
                </button>
                <button
                  type="button"
                  className={v.visorSecundario}
                  onClick={() => {
                    atualizarPerfil({ foto: undefined, fotoOriginal: undefined });
                    setOriginal(undefined);
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

      {recortando && <RecorteFoto src={recortando} onCancelar={() => setRecortando(null)} onSalvar={salvar} />}
    </>
  );
}

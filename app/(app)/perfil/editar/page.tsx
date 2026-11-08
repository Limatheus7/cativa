"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/cativa/Basicos";
import ComDados from "@/components/cativa/ComDados";
import { CabecalhoApp } from "@/components/cativa/Navegacao";
import { reduzirFoto } from "@/lib/dados/imagens";
import { atualizarPerfil, slugUsuario } from "@/lib/dados/loja";
import type { Perfil } from "@/lib/dados/tipos";
import s from "@/components/cativa/ui.module.css";

const UFS = "AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO".split(" ");

export default function EditarPerfil() {
  return (
    <>
      <CabecalhoApp titulo="Editar perfil" voltar="/perfil" />
      <main className={s.pagina}>
        <ComDados>{(dados) => <Formulario inicial={dados.perfil} />}</ComDados>
      </main>
    </>
  );
}

function Formulario({ inicial }: { inicial: Perfil }) {
  const router = useRouter();
  const [p, setP] = useState<Perfil>(inicial);
  const [erro, setErro] = useState("");

  async function trocarFoto(arquivo?: File) {
    if (!arquivo) return;
    try {
      setP({ ...p, foto: await reduzirFoto(arquivo, 400, 0.8) });
    } catch {
      setErro("Não conseguimos abrir essa imagem.");
    }
  }

  return (
    <form
      className={s.formulario}
      onSubmit={(e) => {
        e.preventDefault();
        try {
          atualizarPerfil({ ...p, nome: p.nome.trim(), usuario: slugUsuario(p.usuario), cidade: p.cidade?.trim(), bio: p.bio?.trim() });
          router.push("/perfil");
        } catch {
          setErro("Não coube no aparelho. Tente uma foto menor.");
        }
      }}
    >
      <div className={s.fotoPerfil}>
        <Avatar nome={p.nome || "Você"} foto={p.foto} tamanho={88} />
        <label className={s.botaoTexto}>
          {p.foto ? "Trocar foto" : "Adicionar foto"}
          <input type="file" accept="image/*" className={s.somenteLeitor} onChange={(e) => trocarFoto(e.target.files?.[0])} />
        </label>
        {p.foto && (
          <button type="button" className={s.botaoTexto} onClick={() => setP({ ...p, foto: undefined })}>
            Remover foto
          </button>
        )}
      </div>

      <label className={s.campo}>
        <span>Nome</span>
        <input required value={p.nome} maxLength={60} onChange={(e) => setP({ ...p, nome: e.target.value })} autoComplete="name" />
      </label>
      <label className={s.campo}>
        <span>@usuário</span>
        <input
          required
          value={p.usuario}
          maxLength={24}
          onChange={(e) => setP({ ...p, usuario: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, "") })}
          autoCapitalize="none"
          placeholder="como.te.chamam"
        />
      </label>
      <div className={s.duasColunas}>
        <label className={s.campo}>
          <span>Cidade</span>
          <input value={p.cidade ?? ""} maxLength={40} onChange={(e) => setP({ ...p, cidade: e.target.value })} />
        </label>
        <label className={s.campo}>
          <span>Estado</span>
          <select value={p.uf ?? ""} onChange={(e) => setP({ ...p, uf: e.target.value || undefined })}>
            <option value="">—</option>
            {UFS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </label>
      </div>
      <label className={s.campo}>
        <span>Sobre você</span>
        <textarea rows={3} maxLength={160} value={p.bio ?? ""} onChange={(e) => setP({ ...p, bio: e.target.value })} placeholder="Desde quando você vai ao estádio?" />
      </label>

      {erro && <p className={s.erroTexto}>{erro}</p>}
      <button type="submit" className={s.botao}>
        Salvar
      </button>
    </form>
  );
}

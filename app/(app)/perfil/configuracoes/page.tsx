"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ComDados from "@/components/cativa/ComDados";
import { CabecalhoApp } from "@/components/cativa/Navegacao";
import { apagarTudo, atualizarConfig } from "@/lib/dados/loja";
import type { Configuracoes } from "@/lib/dados/tipos";
import { definirTema, useTema } from "@/lib/tema";
import s from "@/components/cativa/ui.module.css";

const NOTIFICACOES: { chave: keyof Configuracoes["notificacoes"]; rotulo: string; texto: string }[] = [
  { chave: "conquistas", rotulo: "Conquistas e níveis", texto: "Stickers, selos e níveis destravados." },
  { chave: "curtidas", rotulo: "Curtidas", texto: "Quando curtirem uma presença sua." },
  { chave: "comentarios", rotulo: "Comentários", texto: "Quando comentarem uma presença sua." },
  { chave: "seguidores", rotulo: "Novos na sua torcida", texto: "Quando alguém começar a te acompanhar." },
];

export default function Configuracoes() {
  const router = useRouter();
  const tema = useTema();
  const [confirmando, setConfirmando] = useState(false);

  return (
    <>
      <CabecalhoApp titulo="Configurações" voltar="/perfil" />
      <main className={s.pagina}>
        <ComDados>
          {(dados) => (
            <>
              <section className={s.cartao}>
                <h2 className={s.rotulo}>Privacidade</h2>
                <Alternar
                  rotulo="Perfil público"
                  texto={dados.config.perfilPublico ? "Qualquer torcedor vê seus jogos e selos." : "Só você vê seus jogos. Nada vai para a Torcida."}
                  ligado={dados.config.perfilPublico}
                  onChange={(v) => atualizarConfig({ perfilPublico: v })}
                />
              </section>

              <section className={s.cartao}>
                <h2 className={s.rotulo}>Notificações</h2>
                {NOTIFICACOES.map((n) => (
                  <Alternar
                    key={n.chave}
                    rotulo={n.rotulo}
                    texto={n.texto}
                    ligado={dados.config.notificacoes[n.chave]}
                    onChange={(v) => atualizarConfig({ notificacoes: { ...dados.config.notificacoes, [n.chave]: v } })}
                  />
                ))}
              </section>

              <section className={s.cartao}>
                <h2 className={s.rotulo}>Aparência</h2>
                <Alternar
                  rotulo="Modo escuro"
                  texto="Verde profundo da Cativa no lugar do papel."
                  ligado={tema === "escuro"}
                  onChange={(v) => definirTema(v ? "escuro" : "claro")}
                />
              </section>

              <section className={s.cartao}>
                <h2 className={s.rotulo}>Seu time</h2>
                <Link href="/meu-time" className={s.linhaLink}>
                  Trocar time
                  <span>Seus jogos já registrados continuam com o time da época.</span>
                </Link>
              </section>

              <section className={s.cartao}>
                <h2 className={s.rotulo}>Conta</h2>
                <Link href="/" className={s.linhaLink}>
                  Sair
                  <span>Seus registros ficam guardados neste aparelho.</span>
                </Link>
                {confirmando ? (
                  <div className={s.confirmar} role="alert">
                    <p>Apagar todos os seus registros deste aparelho? Jogos, fotos, selos e perfil. Não dá para desfazer.</p>
                    <div>
                      <button type="button" className={s.botaoTexto} onClick={() => setConfirmando(false)}>
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className={s.botaoPerigo}
                        onClick={() => {
                          apagarTudo();
                          router.push("/inicio");
                        }}
                      >
                        Apagar tudo
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className={`${s.linhaLink} ${s.linhaPerigo}`} onClick={() => setConfirmando(true)}>
                    Apagar meus registros
                    <span>Remove jogos, fotos e perfil deste aparelho.</span>
                  </button>
                )}
              </section>
            </>
          )}
        </ComDados>
      </main>
    </>
  );
}

function Alternar({ rotulo, texto, ligado, onChange }: { rotulo: string; texto: string; ligado: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={s.alternar}>
      <span>
        <strong>{rotulo}</strong>
        <small>{texto}</small>
      </span>
      <input type="checkbox" role="switch" checked={ligado} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

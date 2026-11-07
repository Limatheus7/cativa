"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CORES, PADROES, carregarTime, salvarTime, sugerirIniciais, temaDoTime, type Padrao } from "@/lib/time";
import { buscarClubes, type Clube } from "@/lib/times";
import CartaoMeusJogos from "./CartaoMeusJogos";
import Monograma from "./Monograma";
import base from "./FormularioAcesso.module.css";
import styles from "./CriarTime.module.css";

type Etapa = "lista" | "criar" | "cores";

export default function CriarTime() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("lista");
  const [busca, setBusca] = useState("");
  const [clube, setClube] = useState<string | undefined>();
  const [nome, setNome] = useState("");
  const [iniciais, setIniciais] = useState("");
  const [iniciaisEditadas, setIniciaisEditadas] = useState(false);
  const [corPrincipal, setCorPrincipal] = useState(CORES[0].hex);
  const [corSegunda, setCorSegunda] = useState(CORES[11].hex);
  const [padrao, setPadrao] = useState<Padrao>("liso");
  const [faixas, setFaixas] = useState<string[] | undefined>();

  // Quem volta para trocar de time começa com o time atual em mente.
  useEffect(() => {
    const atual = carregarTime();
    if (!atual) return;
    setNome(atual.nome);
    setIniciais(atual.iniciais);
    setIniciaisEditadas(true);
    setCorPrincipal(atual.corPrincipal);
    setCorSegunda(atual.corSegunda);
    setClube(atual.clube);
    setPadrao(atual.padrao ?? "liso");
    setFaixas(atual.faixas);
  }, []);

  const tema = temaDoTime({ corPrincipal, corSegunda });
  const nomeValido = nome.trim().length >= 2;
  const iniciaisValidas = iniciais.trim().length >= 1;
  const clubes = buscarClubes(busca);
  const camisa = { iniciais, corPrincipal, corSegunda, padrao, faixas };

  function escolherClube(c: Clube) {
    setClube(c.sigla);
    setNome(c.nome);
    setIniciais(c.sigla);
    setCorPrincipal(c.corPrincipal);
    setCorSegunda(c.corSegunda);
    setPadrao(c.padrao);
    setFaixas(c.faixas);
    setEtapa("cores");
  }

  function criarProprio() {
    if (clube) {
      // Sai da lista: começa um time em branco, com cores neutras.
      setClube(undefined);
      setNome("");
      setIniciais("");
      setIniciaisEditadas(false);
      setCorPrincipal(CORES[0].hex);
      setCorSegunda(CORES[11].hex);
      setPadrao("liso");
      setFaixas(undefined);
    }
    setEtapa("criar");
  }

  function mudarNome(valor: string) {
    setNome(valor);
    if (!iniciaisEditadas) setIniciais(sugerirIniciais(valor));
  }

  function escolherPrincipal(hex: string) {
    setCorPrincipal(hex);
    if (hex === corSegunda) setCorSegunda(hex === "#FFFFFF" ? "#1A1A1A" : "#FFFFFF");
  }

  function voltar() {
    if (etapa === "cores") setEtapa(clube ? "lista" : "criar");
    else setEtapa("lista");
  }

  function concluir() {
    salvarTime({ nome: nome.trim(), iniciais: iniciais.trim(), corPrincipal, corSegunda, padrao, faixas, clube });
    router.push("/inicio");
  }

  return (
    <main className={base.tela} style={tema as React.CSSProperties}>
      <header className={base.topo}>
        {etapa === "lista" ? (
          <Link href="/" className={base.voltar} aria-label="Voltar">
            <Seta />
          </Link>
        ) : (
          <button type="button" className={`${base.voltar} ${styles.semBorda}`} aria-label="Voltar" onClick={voltar}>
            <Seta />
          </button>
        )}
        <span className={styles.passos} aria-label={`Etapa ${etapa === "cores" ? 2 : 1} de 2`}>
          <span className={styles.passoAtivo} />
          <span className={etapa === "cores" ? styles.passoAtivo : undefined} />
        </span>
        <span className={base.espaco} />
      </header>

      {etapa === "lista" && (
        <>
          <h1 className={base.titulo}>Qual é o seu time?</h1>
          <p className={base.subtitulo}>É a primeira coisa do seu perfil.</p>

          <label className={`${base.campo} ${styles.busca}`}>
            <span className={styles.somenteLeitor}>Buscar time</span>
            <input
              type="search"
              autoComplete="off"
              placeholder="Buscar por nome, sigla ou estado"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </label>

          {clubes.length > 0 ? (
            <ul className={styles.clubes}>
              {clubes.map((c) => (
                <li key={c.sigla}>
                  <button
                    type="button"
                    className={styles.clube}
                    aria-pressed={clube === c.sigla}
                    onClick={() => escolherClube(c)}
                  >
                    <span className={styles.circulo}>
                      <Monograma time={{ ...c, iniciais: c.sigla }} tamanho={60} />
                    </span>
                    <span className={styles.nomeClube}>{c.nome}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.vazio}>Nenhum time com esse nome por aqui.</p>
          )}

          <button type="button" className={styles.criarProprio} onClick={criarProprio}>
            Meu time não está aqui
          </button>
        </>
      )}

      {etapa === "criar" && (
        <>
          <h1 className={base.titulo}>Monte o seu time.</h1>
          <p className={base.subtitulo}>Escreva do jeito que você chama na arquibancada.</p>

          <form
            className={base.formulario}
            onSubmit={(e) => {
              e.preventDefault();
              if (nomeValido && iniciaisValidas) setEtapa("cores");
            }}
          >
            <label className={base.campo}>
              <span>Nome do time</span>
              <input
                name="time"
                autoComplete="off"
                autoCapitalize="words"
                required
                minLength={2}
                maxLength={40}
                placeholder="Ex.: Esporte Clube Vila Nova"
                value={nome}
                onChange={(e) => mudarNome(e.target.value)}
              />
            </label>

            <div className={styles.linhaIniciais}>
              <Monograma time={camisa} tamanho={56} />
              <label className={`${base.campo} ${styles.campoIniciais}`}>
                <span>Sigla</span>
                <input
                  name="iniciais"
                  autoComplete="off"
                  autoCapitalize="characters"
                  required
                  maxLength={3}
                  placeholder="VNO"
                  value={iniciais}
                  onChange={(e) => {
                    setIniciaisEditadas(true);
                    setIniciais(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
                  }}
                />
              </label>
            </div>
            <p className={styles.nota}>Na Cativa não tem escudo. Seu time aparece pela sigla, nas cores dele.</p>

            <button type="submit" className={base.botao} disabled={!nomeValido || !iniciaisValidas}>
              Continuar
            </button>
          </form>
        </>
      )}

      {etapa === "cores" && (
        <>
          <h1 className={base.titulo}>{clube ? `${nome}.` : "Quais são as cores dele?"}</h1>
          <p className={base.subtitulo}>O app veste o seu time.</p>

          <div className={styles.previa}>
            <CartaoMeusJogos time={camisa} jogos={0} previa />
          </div>

          {!clube && (
            <>
              <fieldset className={styles.cores}>
                <legend>
                  Camisa <span>{PADROES.find((p) => p.valor === padrao)?.nome}</span>
                </legend>
                <div className={styles.padroes}>
                  {PADROES.map((p) => (
                    <label key={p.valor} className={styles.padrao} title={p.nome}>
                      <input
                        type="radio"
                        name="padrao"
                        value={p.valor}
                        checked={padrao === p.valor}
                        onChange={() => setPadrao(p.valor)}
                        aria-label={p.nome}
                      />
                      <Monograma time={{ ...camisa, padrao: p.valor }} tamanho={48} semSigla />
                    </label>
                  ))}
                </div>
              </fieldset>
              <SeletorCor titulo="Cor principal" valor={corPrincipal} onChange={escolherPrincipal} />
              <SeletorCor titulo="Segunda cor" valor={corSegunda} desabilitada={corPrincipal} onChange={setCorSegunda} />
            </>
          )}

          <button type="button" className={`${base.botao} ${styles.botaoFinal}`} onClick={concluir}>
            Vestir o app
          </button>
          {clube && (
            <button type="button" className={styles.criarProprio} onClick={() => setEtapa("lista")}>
              Não é esse? Escolher outro time
            </button>
          )}
        </>
      )}
    </main>
  );
}

function SeletorCor({
  titulo,
  valor,
  desabilitada,
  onChange,
}: {
  titulo: string;
  valor: string;
  desabilitada?: string;
  onChange: (hex: string) => void;
}) {
  const atual = CORES.find((c) => c.hex === valor);
  return (
    <fieldset className={styles.cores}>
      <legend>
        {titulo} <span>{atual?.nome}</span>
      </legend>
      <div className={styles.grade}>
        {CORES.map((c) => (
          <label key={c.hex} className={styles.amostra} title={c.nome}>
            <input
              type="radio"
              name={titulo}
              value={c.hex}
              checked={valor === c.hex}
              disabled={c.hex === desabilitada}
              onChange={() => onChange(c.hex)}
              aria-label={c.nome}
            />
            <span style={{ background: c.hex }} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Seta() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

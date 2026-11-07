import { fundoDaCamisa, letrasSobreLiso, precisaContorno, type Padrao } from "@/lib/time";
import styles from "./Monograma.module.css";

export type DadosCamisa = {
  iniciais: string;
  corPrincipal: string;
  corSegunda: string;
  padrao?: Padrao;
  faixas?: string[];
};

/**
 * Círculo do time: a camisa (lisa, listrada ou com faixa) com a sigla.
 * Nunca escudo. Em camisa com desenho, a sigla vai numa placa clara,
 * como a placa da cadeira, para continuar legível.
 */
export default function Monograma({
  time,
  tamanho = 44,
  contorno,
  semSigla,
}: {
  time: DadosCamisa;
  tamanho?: number;
  /** Só a camisa (ex.: no seletor de padrão). */
  semSigla?: boolean;
  /** Cor de um anel em volta (ex.: sobre o cabeçalho na cor do time). */
  contorno?: string;
}) {
  const padrao = time.padrao ?? "liso";
  const cores = time.faixas?.length ? time.faixas : [time.corPrincipal, time.corSegunda];
  const liso = padrao === "liso";
  const sigla = time.iniciais || "?";
  const sombras = [
    precisaContorno(cores) ? "inset 0 0 0 1.5px #D9CDB4" : "",
    contorno ? `0 0 0 2px ${contorno}` : "",
  ].filter(Boolean);

  return (
    <span
      className={styles.monograma}
      style={{
        width: tamanho,
        height: tamanho,
        background: fundoDaCamisa(padrao, liso ? [time.corPrincipal] : cores),
        color: letrasSobreLiso(time.corPrincipal, time.corSegunda),
        boxShadow: sombras.join(", ") || "none",
      }}
      aria-hidden="true"
    >
      {semSigla ? null : liso ? (
        <span style={{ fontSize: tamanho * (sigla.length > 2 ? 0.27 : 0.36) }}>{sigla}</span>
      ) : (
        <span className={styles.placa} style={{ fontSize: tamanho * (sigla.length > 2 ? 0.22 : 0.27) }}>
          {sigla}
        </span>
      )}
    </span>
  );
}

import { proximoNivel } from "@/lib/dados/estatisticas";
import Monograma, { type DadosCamisa } from "./Monograma";
import styles from "./CartaoMeusJogos.module.css";

// Níveis definidos em um só lugar (lib/dados/estatisticas).
export { NIVEIS, proximoNivel } from "@/lib/dados/estatisticas";

type Props = {
  time: DadosCamisa;
  jogos: number;
  /** Na prévia o botão é só ilustrativo. */
  previa?: boolean;
  onCheguei?: () => void;
};

export default function CartaoMeusJogos({ time, jogos, previa, onCheguei }: Props) {
  const proximo = proximoNivel(jogos);
  const progresso = proximo ? Math.max(jogos / proximo.jogos, 0.04) : 1;

  return (
    <div className={styles.cartao}>
      <div className={styles.cabecalho}>
        <Monograma
          time={time}
          tamanho={44}
          contorno="color-mix(in srgb, var(--time-sobre-principal) 60%, transparent)"
        />
        <span>Meus jogos</span>
      </div>
      <div className={styles.corpo}>
        <p className={styles.numero}>{jogos}</p>
        <p className={styles.legenda}>{jogos === 1 ? "jogo visto ao vivo" : "jogos vistos ao vivo"}</p>
        <div className={styles.barra} aria-hidden="true">
          <span style={{ width: `${progresso * 100}%` }} />
        </div>
        {previa ? (
          <span className={styles.botao} aria-hidden="true">
            Eternize a história
          </span>
        ) : (
          <button type="button" className={styles.botao} onClick={onCheguei}>
            Eternize a história
          </button>
        )}
      </div>
    </div>
  );
}

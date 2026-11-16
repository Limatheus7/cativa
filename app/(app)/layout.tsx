import TimeProvider from "@/components/app/TimeProvider";
import { PresencaGaveta } from "@/components/cativa/CheckIn";
import { BarraNavegacao } from "@/components/cativa/Navegacao";
import { PresencaProvider } from "@/components/cativa/PresencaProvider";
import styles from "@/components/app/app.module.css";

// Telas do app depois de escolher o time: Início, Torcida, Presença, Coleção e
// Perfil (e as telas dentro delas). Todas têm a barra de navegação embaixo.
// "Cheguei no estádio" é uma gaveta montada uma vez aqui, por cima da tela atual.
export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <TimeProvider>
      <PresencaProvider>
        <div className={styles.conteudo} data-fundo-gaveta>
          {children}
        </div>
        <BarraNavegacao />
        <PresencaGaveta />
      </PresencaProvider>
    </TimeProvider>
  );
}

import TimeProvider from "@/components/app/TimeProvider";
import { BarraNavegacao } from "@/components/cativa/Navegacao";
import styles from "@/components/app/app.module.css";

// Telas do app depois de escolher o time: Início, Torcida, Presença, Coleção e
// Perfil (e as telas dentro delas). Todas têm a barra de navegação embaixo.
export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <TimeProvider>
      <div className={styles.conteudo}>{children}</div>
      <BarraNavegacao />
    </TimeProvider>
  );
}

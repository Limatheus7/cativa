import TabBar from "@/components/app/TabBar";
import TimeProvider from "@/components/app/TimeProvider";

// Telas do app depois de escolher o time: todas vestem o time e têm a barra de abas.
export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <TimeProvider>
      <div style={{ flex: 1 }}>{children}</div>
      <TabBar />
    </TimeProvider>
  );
}

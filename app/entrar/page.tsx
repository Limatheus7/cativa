import type { Metadata } from "next";
import FormularioAcesso from "@/components/FormularioAcesso";

export const metadata: Metadata = { title: "Entrar · Cativa" };

export default function Entrar() {
  return <FormularioAcesso modo="entrar" />;
}

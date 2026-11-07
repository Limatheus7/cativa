import type { Metadata } from "next";
import FormularioTelefone from "@/components/FormularioTelefone";

export const metadata: Metadata = { title: "Entrar com telefone · Cativa" };

export default function Telefone() {
  return <FormularioTelefone />;
}

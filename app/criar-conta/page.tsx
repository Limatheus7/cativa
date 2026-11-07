import type { Metadata } from "next";
import FormularioAcesso from "@/components/FormularioAcesso";

export const metadata: Metadata = { title: "Criar conta · Cativa" };

export default function CriarConta() {
  return <FormularioAcesso modo="criar" />;
}

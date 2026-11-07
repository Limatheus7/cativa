import type { Metadata } from "next";
import FormularioCadastro from "@/components/FormularioCadastro";

export const metadata: Metadata = { title: "Criar conta · Cativa" };

export default function CriarConta() {
  return <FormularioCadastro />;
}

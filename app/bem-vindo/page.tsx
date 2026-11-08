import type { Metadata } from "next";
import Inicio from "@/components/Inicio";

// Boas-vindas do time: a tela inteira veste o time. "Eternize a história" abre o app.
export const metadata: Metadata = { title: "Seu time · Cativa" };

export default function BemVindo() {
  return <Inicio />;
}

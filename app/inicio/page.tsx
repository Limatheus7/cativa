import type { Metadata } from "next";
import Inicio from "@/components/Inicio";

export const metadata: Metadata = { title: "Meus jogos · Cativa" };

export default function PaginaInicio() {
  return <Inicio />;
}

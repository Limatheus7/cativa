import type { Metadata } from "next";
import CriarTime from "@/components/CriarTime";

export const metadata: Metadata = { title: "Seu time · Cativa" };

export default function MeuTime() {
  return <CriarTime />;
}

import type { Presenca } from "./tipos";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "2026-08-16" → "16 ago 2026" */
export function formatarData(iso: string) {
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MESES[m - 1]} ${a}`;
}

/** Quanto tempo atrás, para o feed e notificações. */
export function haQuanto(iso: string, hoje = new Date()) {
  const dias = Math.floor((hoje.getTime() - new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).getTime()) / 86_400_000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 7) return `há ${dias} dias`;
  if (dias < 31) return `há ${Math.floor(dias / 7)} sem`;
  return formatarData(iso);
}

/** Nº 0001 */
export function numeroPresenca(n: number) {
  return `Nº ${String(n).padStart(4, "0")}`;
}

/** Placar sempre do ponto de vista de quem joga em casa. */
export function placar(p: Presenca) {
  const { partida, time } = p;
  const timeEmCasa = partida.mando !== "fora";
  const casa = timeEmCasa ? { sigla: time.sigla, gols: partida.golsTime } : { sigla: partida.adversario.sigla, gols: partida.golsAdversario };
  const fora = timeEmCasa ? { sigla: partida.adversario.sigla, gols: partida.golsAdversario } : { sigla: time.sigla, gols: partida.golsTime };
  return { casa, fora, texto: `${casa.sigla} ${casa.gols} × ${fora.gols} ${fora.sigla}` };
}

/** "no Maracanã", "na Arena MRV", "na Vila Belmiro". */
export function noEstadio(nome: string) {
  const feminino = /^(arena|fonte|ilha|vila|ressacada|baixada)\b/i.test(nome.trim());
  return `${feminino ? "na" : "no"} ${nome}`;
}

export function iniciaisDoNome(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  return ((partes[0][0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

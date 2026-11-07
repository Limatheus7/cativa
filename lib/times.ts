import type { Padrao } from "./time";

// Clubes com a sigla usada nas transmissões e o desenho da camisa principal.
// Só sigla, cores e listras: nada de escudo, mascote ou arte do clube.
// corPrincipal veste o cabeçalho e os destaques do app.
// faixas = cores das listras/faixa na ordem (para "faixa-*", a 1ª é a base da camisa).
// Cores e padrões aproximados a partir dos uniformes: revisar antes de lançar.

export type Clube = {
  sigla: string;
  nome: string;
  estado: string;
  corPrincipal: string;
  corSegunda: string;
  padrao: Padrao;
  faixas?: string[];
};

// Vermelho vivo o bastante para o preto ser legível em cima (Cativa em preto no Flamengo).
const VERMELHO = "#D81E2B";
const PRETO = "#1A1A1A";
const BRANCO = "#FFFFFF";
const GRENA = "#7A1F2B";
const VERDE_FLU = "#00613C";

export const CLUBES: Clube[] = [
  { sigla: "FLA", nome: "Flamengo", estado: "RJ", corPrincipal: VERMELHO, corSegunda: PRETO, padrao: "horizontal" },
  { sigla: "FLU", nome: "Fluminense", estado: "RJ", corPrincipal: GRENA, corSegunda: VERDE_FLU, padrao: "vertical", faixas: [GRENA, BRANCO, VERDE_FLU, BRANCO] },
  { sigla: "BOT", nome: "Botafogo", estado: "RJ", corPrincipal: PRETO, corSegunda: BRANCO, padrao: "vertical" },
  { sigla: "VAS", nome: "Vasco", estado: "RJ", corPrincipal: PRETO, corSegunda: BRANCO, padrao: "faixa-diagonal" },
  { sigla: "COR", nome: "Corinthians", estado: "SP", corPrincipal: BRANCO, corSegunda: PRETO, padrao: "liso" },
  { sigla: "PAL", nome: "Palmeiras", estado: "SP", corPrincipal: "#006437", corSegunda: BRANCO, padrao: "liso" },
  { sigla: "SAO", nome: "São Paulo", estado: "SP", corPrincipal: BRANCO, corSegunda: "#E4002B", padrao: "faixa-horizontal", faixas: [BRANCO, "#E4002B", PRETO] },
  { sigla: "SAN", nome: "Santos", estado: "SP", corPrincipal: BRANCO, corSegunda: PRETO, padrao: "liso" },
  { sigla: "RBB", nome: "Bragantino", estado: "SP", corPrincipal: BRANCO, corSegunda: "#D6001C", padrao: "liso" },
  { sigla: "MIR", nome: "Mirassol", estado: "SP", corPrincipal: "#F5D000", corSegunda: "#00843D", padrao: "liso" },
  { sigla: "PON", nome: "Ponte Preta", estado: "SP", corPrincipal: PRETO, corSegunda: BRANCO, padrao: "liso" },
  { sigla: "GUA", nome: "Guarani", estado: "SP", corPrincipal: "#00843D", corSegunda: BRANCO, padrao: "liso" },
  { sigla: "CAM", nome: "Atlético-MG", estado: "MG", corPrincipal: PRETO, corSegunda: BRANCO, padrao: "vertical" },
  { sigla: "CRU", nome: "Cruzeiro", estado: "MG", corPrincipal: "#0033A0", corSegunda: BRANCO, padrao: "liso" },
  { sigla: "AME", nome: "América-MG", estado: "MG", corPrincipal: "#00843D", corSegunda: PRETO, padrao: "liso" },
  { sigla: "INT", nome: "Internacional", estado: "RS", corPrincipal: "#E30613", corSegunda: BRANCO, padrao: "liso" },
  { sigla: "GRE", nome: "Grêmio", estado: "RS", corPrincipal: "#0D80BF", corSegunda: PRETO, padrao: "vertical", faixas: ["#0D80BF", PRETO, BRANCO] },
  { sigla: "JUV", nome: "Juventude", estado: "RS", corPrincipal: "#00843D", corSegunda: BRANCO, padrao: "vertical" },
  { sigla: "CAP", nome: "Athletico-PR", estado: "PR", corPrincipal: VERMELHO, corSegunda: PRETO, padrao: "vertical" },
  { sigla: "CFC", nome: "Coritiba", estado: "PR", corPrincipal: "#00543C", corSegunda: BRANCO, padrao: "horizontal", faixas: [BRANCO, "#00543C"] },
  { sigla: "AVA", nome: "Avaí", estado: "SC", corPrincipal: "#0055A4", corSegunda: BRANCO, padrao: "vertical" },
  { sigla: "FIG", nome: "Figueirense", estado: "SC", corPrincipal: PRETO, corSegunda: BRANCO, padrao: "vertical" },
  { sigla: "CHA", nome: "Chapecoense", estado: "SC", corPrincipal: "#00843D", corSegunda: BRANCO, padrao: "liso" },
  { sigla: "BAH", nome: "Bahia", estado: "BA", corPrincipal: "#005CA9", corSegunda: "#E30613", padrao: "liso" },
  { sigla: "VIT", nome: "Vitória", estado: "BA", corPrincipal: VERMELHO, corSegunda: PRETO, padrao: "horizontal" },
  { sigla: "FOR", nome: "Fortaleza", estado: "CE", corPrincipal: "#1D4F91", corSegunda: "#E30613", padrao: "horizontal", faixas: ["#E30613", BRANCO, "#1D4F91"] },
  { sigla: "CEA", nome: "Ceará", estado: "CE", corPrincipal: PRETO, corSegunda: BRANCO, padrao: "vertical" },
  { sigla: "SPT", nome: "Sport", estado: "PE", corPrincipal: VERMELHO, corSegunda: PRETO, padrao: "horizontal" },
  { sigla: "NAU", nome: "Náutico", estado: "PE", corPrincipal: VERMELHO, corSegunda: BRANCO, padrao: "vertical" },
  { sigla: "STC", nome: "Santa Cruz", estado: "PE", corPrincipal: VERMELHO, corSegunda: PRETO, padrao: "horizontal", faixas: [PRETO, BRANCO, VERMELHO] },
  { sigla: "GOI", nome: "Goiás", estado: "GO", corPrincipal: "#006B3F", corSegunda: BRANCO, padrao: "liso" },
  { sigla: "ACG", nome: "Atlético-GO", estado: "GO", corPrincipal: VERMELHO, corSegunda: PRETO, padrao: "vertical" },
  { sigla: "VNO", nome: "Vila Nova", estado: "GO", corPrincipal: VERMELHO, corSegunda: BRANCO, padrao: "liso" },
  { sigla: "CUI", nome: "Cuiabá", estado: "MT", corPrincipal: "#00843D", corSegunda: "#F5D000", padrao: "liso" },
  { sigla: "PAY", nome: "Paysandu", estado: "PA", corPrincipal: "#5BB4E5", corSegunda: BRANCO, padrao: "liso" },
  { sigla: "REM", nome: "Remo", estado: "PA", corPrincipal: "#14254A", corSegunda: BRANCO, padrao: "liso" },
  { sigla: "CRB", nome: "CRB", estado: "AL", corPrincipal: VERMELHO, corSegunda: BRANCO, padrao: "horizontal" },
  { sigla: "CSA", nome: "CSA", estado: "AL", corPrincipal: "#0055A4", corSegunda: BRANCO, padrao: "liso" },
  { sigla: "ABC", nome: "ABC", estado: "RN", corPrincipal: PRETO, corSegunda: BRANCO, padrao: "liso" },
];

function semAcento(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function buscarClubes(termo: string): Clube[] {
  const t = semAcento(termo.trim());
  if (!t) return CLUBES;
  return CLUBES.filter(
    (c) => semAcento(c.nome).includes(t) || c.sigla.toLowerCase().includes(t) || c.estado.toLowerCase() === t,
  );
}

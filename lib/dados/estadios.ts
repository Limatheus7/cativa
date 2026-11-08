import type { Estadio } from "./tipos";

// Catálogo de estádios brasileiros (dado de referência, não do torcedor).
// Cada um vira um sticker na Coleção quando o torcedor registra uma presença lá.
export const ESTADIOS: Estadio[] = [
  { id: "maracana", nome: "Maracanã", cidade: "Rio de Janeiro", uf: "RJ", arte: "/estadios/maracana.png" },
  { id: "nilton-santos", nome: "Nilton Santos", apelido: "Engenhão", cidade: "Rio de Janeiro", uf: "RJ", arte: "/estadios/nilton-santos.png" },
  { id: "sao-januario", nome: "São Januário", cidade: "Rio de Janeiro", uf: "RJ", arte: "/estadios/sao-januario.png" },
  { id: "morumbis", nome: "Morumbis", cidade: "São Paulo", uf: "SP", arte: "/estadios/morumbis.png" },
  { id: "allianz", nome: "Nubank Parque", apelido: "antigo Allianz Parque", cidade: "São Paulo", uf: "SP", arte: "/estadios/nubank-parque.png" },
  { id: "arena-corinthians", nome: "Arena Corinthians", cidade: "São Paulo", uf: "SP" },
  { id: "pacaembu", nome: "Pacaembu", cidade: "São Paulo", uf: "SP" },
  { id: "vila-belmiro", nome: "Vila Belmiro", cidade: "Santos", uf: "SP" },
  { id: "nabi-abi-chedid", nome: "Nabi Abi Chedid", cidade: "Bragança Paulista", uf: "SP" },
  { id: "mineirao", nome: "Mineirão", cidade: "Belo Horizonte", uf: "MG" },
  { id: "arena-mrv", nome: "Arena MRV", cidade: "Belo Horizonte", uf: "MG" },
  { id: "independencia", nome: "Independência", cidade: "Belo Horizonte", uf: "MG" },
  { id: "beira-rio", nome: "Beira-Rio", cidade: "Porto Alegre", uf: "RS" },
  { id: "arena-gremio", nome: "Arena do Grêmio", cidade: "Porto Alegre", uf: "RS" },
  { id: "alfredo-jaconi", nome: "Alfredo Jaconi", cidade: "Caxias do Sul", uf: "RS" },
  { id: "arena-baixada", nome: "Arena da Baixada", cidade: "Curitiba", uf: "PR" },
  { id: "couto-pereira", nome: "Couto Pereira", cidade: "Curitiba", uf: "PR" },
  { id: "ressacada", nome: "Ressacada", cidade: "Florianópolis", uf: "SC" },
  { id: "arena-conda", nome: "Arena Condá", cidade: "Chapecó", uf: "SC" },
  { id: "fonte-nova", nome: "Fonte Nova", cidade: "Salvador", uf: "BA" },
  { id: "barradao", nome: "Barradão", cidade: "Salvador", uf: "BA" },
  { id: "castelao", nome: "Castelão", cidade: "Fortaleza", uf: "CE" },
  { id: "ilha-do-retiro", nome: "Ilha do Retiro", cidade: "Recife", uf: "PE" },
  { id: "arena-pernambuco", nome: "Arena Pernambuco", cidade: "São Lourenço da Mata", uf: "PE" },
  { id: "serra-dourada", nome: "Serra Dourada", cidade: "Goiânia", uf: "GO" },
  { id: "arena-pantanal", nome: "Arena Pantanal", cidade: "Cuiabá", uf: "MT" },
  { id: "mane-garrincha", nome: "Mané Garrincha", cidade: "Brasília", uf: "DF" },
  { id: "mangueirao", nome: "Mangueirão", cidade: "Belém", uf: "PA" },
  { id: "arena-amazonia", nome: "Arena da Amazônia", cidade: "Manaus", uf: "AM" },
  { id: "rei-pele", nome: "Rei Pelé", cidade: "Maceió", uf: "AL" },
  { id: "arena-das-dunas", nome: "Arena das Dunas", cidade: "Natal", uf: "RN" },
];

/** Estádio de casa de cada clube da lista, para sugerir no check-in. */
const CASA: Record<string, string> = {
  FLA: "maracana", FLU: "maracana", BOT: "nilton-santos", VAS: "sao-januario",
  COR: "arena-corinthians", PAL: "allianz", SAO: "morumbis", SAN: "vila-belmiro", RBB: "nabi-abi-chedid",
  CAM: "arena-mrv", CRU: "mineirao", AME: "independencia",
  INT: "beira-rio", GRE: "arena-gremio", JUV: "alfredo-jaconi",
  CAP: "arena-baixada", CFC: "couto-pereira", AVA: "ressacada", CHA: "arena-conda",
  BAH: "fonte-nova", VIT: "barradao", FOR: "castelao", CEA: "castelao", SPT: "ilha-do-retiro",
  CUI: "arena-pantanal", PAY: "mangueirao", REM: "mangueirao", CRB: "rei-pele", CSA: "rei-pele",
};

export function estadioPorId(id?: string): Estadio | undefined {
  return id ? ESTADIOS.find((e) => e.id === id) : undefined;
}

export function estadioDeCasa(sigla?: string): Estadio | undefined {
  return sigla ? estadioPorId(CASA[sigla]) : undefined;
}

function semAcento(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function buscarEstadios(termo: string): Estadio[] {
  const t = semAcento(termo.trim());
  if (!t) return ESTADIOS;
  return ESTADIOS.filter((e) =>
    [e.nome, e.apelido ?? "", e.cidade, e.uf].some((campo) => semAcento(campo).includes(t)),
  );
}

/** Chave para contar estádios: id do catálogo, ou nome+UF quando digitado. */
export function chaveDoEstadio(e: { id?: string; nome: string; uf: string }) {
  return e.id ?? `${semAcento(e.nome)}|${e.uf}`;
}

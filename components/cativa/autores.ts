import { EU } from "@/lib/dados/loja";
import { torcedorPorUsuario } from "@/lib/dados/mock/torcedores";
import type { DadosDoTorcedor, IdentidadeDoTime, ItemDoFeed } from "@/lib/dados/tipos";
import type { AutorDoFeed } from "./Social";

/** Quem publicou o item do feed: você ou alguém da sua torcida. */
export function autorDoItem(item: ItemDoFeed, dados: DadosDoTorcedor, meuTime: IdentidadeDoTime): AutorDoFeed {
  if (item.autor === EU) {
    return { nome: dados.perfil.nome || "Você", usuario: dados.perfil.usuario, time: meuTime, foto: dados.perfil.foto, eu: true };
  }
  const t = torcedorPorUsuario(item.autor);
  return t
    ? { nome: t.nome, usuario: t.usuario, time: t.time }
    : { nome: "Torcedor", usuario: item.autor, time: meuTime };
}

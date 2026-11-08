"use client";

import Link from "next/link";
import { useState } from "react";
import { conquistaPorId } from "@/lib/dados/conquistas";
import { estatisticas } from "@/lib/dados/estatisticas";
import { formatarData, haQuanto, noEstadio, placar } from "@/lib/dados/formato";
import type { Comentario, IdentidadeDoTime, ItemDoFeed, TorcedorPublico } from "@/lib/dados/tipos";
import { Avatar, SeloPresenca } from "./Basicos";
import { IconeCadeira, IconeComentario, IconeCoracao } from "./Icones";
import s from "./ui.module.css";

// ------------------------------------------------------------ UserProfileSummary

export function ResumoTorcedor({
  torcedor,
  seguindo,
  onSeguir,
}: {
  torcedor: TorcedorPublico;
  seguindo: boolean;
  onSeguir: () => void;
}) {
  const est = estatisticas(torcedor.presencas);
  return (
    <article className={s.resumo}>
      <Link href={`/torcedor/${torcedor.usuario}`} className={s.resumoLink}>
        <Avatar nome={torcedor.nome} time={torcedor.time} tamanho={52} />
        <div className={s.resumoTexto}>
          <strong>{torcedor.nome}</strong>
          <span>
            @{torcedor.usuario} · {torcedor.time.nome}
          </span>
          <span className={s.resumoNumeros}>
            {est.total} {est.total === 1 ? "jogo" : "jogos"} · {est.estadios} {est.estadios === 1 ? "estádio" : "estádios"} · {est.nivel?.nome ?? "Sem nível"}
          </span>
          {est.ultima && (
            <span className={s.resumoUltima}>
              Última presença: {est.ultima.estadio.nome}, {formatarData(est.ultima.partida.data)}
            </span>
          )}
        </div>
      </Link>
      <button
        type="button"
        className={`${s.seguir} ${seguindo ? s.seguindo : ""}`}
        onClick={onSeguir}
        aria-pressed={seguindo}
        aria-label={seguindo ? `Deixar de acompanhar ${torcedor.nome}` : `Acompanhar ${torcedor.nome}`}
      >
        {seguindo ? "Acompanhando" : "Acompanhar"}
      </button>
    </article>
  );
}

// ------------------------------------------------------------ ActivityFeedItem

export type AutorDoFeed = { nome: string; usuario: string; time: IdentidadeDoTime; foto?: string; eu?: boolean };

export function ItemFeed({
  item,
  autor,
  curtido,
  curtidas,
  comentarios,
  onCurtir,
  onComentar,
}: {
  item: ItemDoFeed;
  autor: AutorDoFeed;
  curtido: boolean;
  curtidas: number;
  comentarios: Comentario[];
  onCurtir: () => void;
  onComentar: (texto: string) => void;
}) {
  const [abrirComentarios, setAbrirComentarios] = useState(false);
  const [texto, setTexto] = useState("");
  const perfilHref = autor.eu ? "/perfil" : `/torcedor/${autor.usuario}`;

  return (
    <article className={s.feedItem}>
      <header className={s.feedTopo}>
        <Link href={perfilHref} aria-label={`Perfil de ${autor.nome}`}>
          <Avatar nome={autor.nome} foto={autor.foto} time={autor.time} tamanho={40} />
        </Link>
        <p>
          <Link href={perfilHref}>
            <strong>{autor.eu ? "Você" : autor.nome}</strong>
          </Link>{" "}
          {item.tipo === "presenca" ? (
            <>
              esteve {noEstadio(item.presenca.estadio.nome).split(" ")[0]} <strong>{item.presenca.estadio.nome}</strong>
            </>
          ) : (
            <>
              desbloqueou <strong>{conquistaPorId(item.conquistaId)?.nome}</strong>
            </>
          )}
          <span className={s.feedQuando}>{haQuanto(item.data)}</span>
        </p>
      </header>

      {item.tipo === "presenca" ? (
        <div className={s.feedPresenca}>
          <div className={s.feedJogo}>
            <SeloPresenca resultado={item.presenca.resultado} tamanho={32} />
            <div>
              <strong>{placar(item.presenca).texto}</strong>
              <span>
                {item.presenca.partida.competicao} · {formatarData(item.presenca.partida.data)}
                {item.presenca.lugar?.setor ? ` · Setor ${item.presenca.lugar.setor}` : ""}
              </span>
            </div>
          </div>
          {item.presenca.frase && <blockquote className={s.feedFrase}>“{item.presenca.frase}”</blockquote>}
          {item.presenca.fotos.length > 0 && (
            <div className={s.feedFotos} data-qtd={Math.min(item.presenca.fotos.length, 3)}>
              {item.presenca.fotos.slice(0, 3).map((f, i) => (
                <img key={i} src={f} alt={`Foto ${i + 1} do jogo`} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={s.feedConquista}>
          <span className={s.conquistaMedalha} aria-hidden="true">
            <IconeCadeira tamanho={24} />
          </span>
          <div>
            <small>Conquista</small>
            <strong>{conquistaPorId(item.conquistaId)?.nome}</strong>
            <span>{conquistaPorId(item.conquistaId)?.descricao}</span>
          </div>
        </div>
      )}

      <footer className={s.feedAcoes}>
        <button type="button" onClick={onCurtir} aria-pressed={curtido} className={curtido ? s.curtido : undefined}>
          <IconeCoracao cheio={curtido} />
          <span>{curtidas}</span>
          <span className={s.somenteLeitor}>{curtido ? "Descurtir" : "Curtir"}</span>
        </button>
        <button type="button" onClick={() => setAbrirComentarios((v) => !v)} aria-expanded={abrirComentarios}>
          <IconeComentario tamanho={22} />
          <span>{comentarios.length}</span>
          <span className={s.somenteLeitor}>Comentários</span>
        </button>
      </footer>

      {abrirComentarios && (
        <div className={s.comentarios}>
          {comentarios.map((c) => (
            <p key={c.id}>
              <strong>@{c.autor}</strong> {c.texto}
            </p>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onComentar(texto);
              setTexto("");
            }}
          >
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escreva um comentário"
              maxLength={200}
              aria-label="Escreva um comentário"
            />
            <button type="submit" disabled={!texto.trim()}>
              Enviar
            </button>
          </form>
        </div>
      )}
    </article>
  );
}

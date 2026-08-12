import type { ReactNode } from "react";

interface Props {
  titulo: string;
  subtitulo?: string;
  acoes?: ReactNode;
}

export default function CabecalhoPagina({ titulo, subtitulo, acoes }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-graphite-400">{subtitulo}</p>}
      </div>
      {acoes && <div className="flex flex-wrap items-center gap-2">{acoes}</div>}
    </div>
  );
}

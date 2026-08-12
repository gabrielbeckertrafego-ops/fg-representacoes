import CabecalhoPagina from "./CabecalhoPagina";

interface Props {
  titulo: string;
  subtitulo?: string;
}

/** Placeholder das telas que ainda serão construídas nas próximas etapas. */
export default function EmBreve({ titulo, subtitulo }: Props) {
  return (
    <>
      <CabecalhoPagina titulo={titulo} subtitulo={subtitulo} />
      <div className="card-painel grid place-items-center py-16 text-center">
        <p className="text-sm text-graphite-400">Esta tela entra na próxima etapa.</p>
      </div>
    </>
  );
}

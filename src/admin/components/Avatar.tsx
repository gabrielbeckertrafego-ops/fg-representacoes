import { iniciais } from "../lib/formato";
import type { Consultor } from "../data/tipos";

interface Props {
  consultor?: Consultor | null;
  tamanho?: "sm" | "md" | "lg";
  titulo?: boolean;
}

const TAMANHOS = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-14 w-14 text-base",
};

export default function Avatar({ consultor, tamanho = "sm", titulo = true }: Props) {
  const classe = `${TAMANHOS[tamanho]} shrink-0 rounded-full object-cover ring-1 ring-white/15`;

  if (!consultor) {
    return (
      <span
        title={titulo ? "Sem consultor" : undefined}
        className={`${TAMANHOS[tamanho]} grid shrink-0 place-items-center rounded-full border border-dashed border-white/25 font-bold text-graphite-500`}
      >
        ?
      </span>
    );
  }

  if (consultor.foto) {
    return (
      <img
        src={consultor.foto}
        alt={consultor.nome}
        title={titulo ? consultor.nome : undefined}
        className={classe}
      />
    );
  }

  return (
    <span
      title={titulo ? consultor.nome : undefined}
      className={`${TAMANHOS[tamanho]} grid shrink-0 place-items-center rounded-full font-bold text-graphite-900`}
      style={{ backgroundColor: consultor.cor }}
    >
      {iniciais(consultor.nome)}
    </span>
  );
}

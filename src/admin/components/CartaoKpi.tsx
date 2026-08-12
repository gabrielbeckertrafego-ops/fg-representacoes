import type { ReactNode } from "react";

interface Props {
  rotulo: string;
  valor: string;
  detalhe?: string;
  variacao?: number | null;
  /** true quando subir é bom (volume); false quando subir é ruim (atrasos). */
  subirEhBom?: boolean;
  destaque?: "gold" | "vermelho" | "verde" | null;
  icone?: ReactNode;
}

export default function CartaoKpi({
  rotulo,
  valor,
  detalhe,
  variacao,
  subirEhBom = true,
  destaque = null,
  icone,
}: Props) {
  const bom = variacao === null || variacao === undefined ? null : variacao >= 0 === subirEhBom;

  const corValor =
    destaque === "vermelho"
      ? "text-red-400"
      : destaque === "verde"
      ? "text-emerald-400"
      : destaque === "gold"
      ? "text-gold-gradient"
      : "text-white";

  return (
    <div className="card-painel">
      <div className="flex items-center justify-between gap-2">
        <p className="rotulo-painel truncate">{rotulo}</p>
        {icone && <span className="text-graphite-600">{icone}</span>}
      </div>

      <p className={`mt-1.5 font-display text-2xl font-bold tabular-nums sm:text-[1.75rem] ${corValor}`}>
        {valor}
      </p>

      <div className="mt-1 flex items-center gap-2">
        {variacao !== null && variacao !== undefined && Number.isFinite(variacao) && (
          <span
            className={`text-xs font-semibold ${bom ? "text-emerald-400" : "text-red-400"}`}
            title="Comparado ao mês passado"
          >
            {variacao >= 0 ? "▲" : "▼"} {Math.abs(variacao).toFixed(0)}%
          </span>
        )}
        {detalhe && <span className="truncate text-xs text-graphite-500">{detalhe}</span>}
      </div>
    </div>
  );
}

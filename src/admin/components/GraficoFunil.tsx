import { moedaCompacta, numero, percentual } from "../lib/formato";
import type { EtapaFunilResumo } from "../lib/metricas";

interface Props {
  etapas: EtapaFunilResumo[];
}

/** Funil desenhado com divs: barras decrescentes com a taxa de passagem entre
 *  etapas. Recharts não tem funil na v2 sem plugin, e à mão fica melhor. */
export default function GraficoFunil({ etapas }: Props) {
  const maior = Math.max(...etapas.map((e) => e.total), 1);

  return (
    <div className="space-y-2">
      {etapas.map((etapa, i) => (
        <div key={etapa.etapa}>
          {i > 0 && etapa.passagem !== null && (
            <p className="py-0.5 pl-2 text-[11px] text-graphite-600">
              ↓ {percentual(etapa.passagem, 0)} seguem
            </p>
          )}
          <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]">
            <div
              className="absolute inset-y-0 left-0 transition-all duration-500"
              style={{
                width: `${(etapa.total / maior) * 100}%`,
                backgroundColor: `${etapa.cor}26`,
                borderRight: `2px solid ${etapa.cor}`,
              }}
            />
            <div className="relative flex items-center justify-between gap-3 px-3 py-2.5">
              <span className="truncate text-sm font-semibold text-white">{etapa.nome}</span>
              <span className="flex shrink-0 items-baseline gap-2">
                <span className="font-display text-sm font-bold text-white tabular-nums">
                  {numero(etapa.total)}
                </span>
                {/* graphite-300 e não 500: este texto cai por cima da barra
                    preenchida, onde o cinza escuro some. */}
                <span className="text-[11px] font-semibold text-graphite-300">
                  {moedaCompacta(etapa.credito)}
                </span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

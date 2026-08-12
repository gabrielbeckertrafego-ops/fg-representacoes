import type { ReactNode } from "react";

// Tema escuro dos gráficos. O tooltip padrão do Recharts é branco e destrói o
// visual do painel, então todo gráfico passa `content={<Tooltip…/>}`.

export const COR_PRINCIPAL = "#C9A24B";
export const COR_EIXO = "#71717A";
export const COR_GRADE = "rgba(255,255,255,0.06)";
export const COR_META = "#5EA9E8";

export const eixoPadrao = {
  axisLine: false,
  tickLine: false,
  tick: { fill: COR_EIXO, fontSize: 11 },
};

interface ItemTooltip {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
}

interface PropsTooltip {
  active?: boolean;
  payload?: ItemTooltip[];
  label?: string;
  formatar?: (valor: number, nome: string) => string;
  titulo?: (label: string) => string;
}

export function TooltipFG({ active, payload, label, formatar, titulo }: PropsTooltip) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-night/95 px-3 py-2 shadow-soft backdrop-blur">
      {label && (
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-graphite-500">
          {titulo ? titulo(label) : label}
        </p>
      )}
      {payload.map((item, i) => (
        <p key={i} className="flex items-center gap-2 text-sm text-graphite-200">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color ?? COR_PRINCIPAL }}
          />
          <span className="text-graphite-400">{item.name}</span>
          <span className="ml-auto font-semibold text-white">
            {formatar && typeof item.value === "number"
              ? formatar(item.value, item.name ?? "")
              : item.value}
          </span>
        </p>
      ))}
    </div>
  );
}

/** ResponsiveContainer calcula 0 se o pai não tiver altura explícita. */
export function MolduraGrafico({ altura = 288, children }: { altura?: number; children: ReactNode }) {
  return (
    <div className="w-full" style={{ height: altura }}>
      {children}
    </div>
  );
}

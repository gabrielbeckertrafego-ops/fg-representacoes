import { moedaCompacta } from "../lib/formato";

interface Props {
  realizado: number;
  meta: number;
  diasRestantes: number;
}

/** Medidor semicircular em SVG puro — fica melhor com as cores exatas do tema
 *  do que qualquer gauge de biblioteca, e são 20 linhas. */
export default function MedidorMeta({ realizado, meta, diasRestantes }: Props) {
  const percentual = meta > 0 ? Math.min(100, (realizado / meta) * 100) : 0;
  const falta = Math.max(0, meta - realizado);

  const raio = 70;
  const comprimento = Math.PI * raio; // meia circunferência
  const preenchido = (percentual / 100) * comprimento;

  return (
    <div className="card-painel flex flex-col items-center">
      <p className="rotulo-painel self-start">Meta da equipe</p>

      <svg viewBox="0 0 180 100" className="mt-2 w-full max-w-[220px]" aria-hidden="true">
        <defs>
          <linearGradient id="medidor-meta-fg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#B4863A" />
            <stop offset="50%" stopColor="#E9D399" />
            <stop offset="100%" stopColor="#C9A24B" />
          </linearGradient>
        </defs>
        <path
          d="M 20 90 A 70 70 0 0 1 160 90"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 20 90 A 70 70 0 0 1 160 90"
          fill="none"
          stroke="url(#medidor-meta-fg)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${preenchido} ${comprimento}`}
        />
        <text
          x="90"
          y="78"
          textAnchor="middle"
          className="fill-white font-display"
          style={{ fontSize: 26, fontWeight: 700 }}
        >
          {percentual.toFixed(0)}%
        </text>
      </svg>

      <p className="-mt-1 text-center text-sm font-semibold text-white">
        {moedaCompacta(realizado)}{" "}
        <span className="font-normal text-graphite-500">de {moedaCompacta(meta)}</span>
      </p>
      <p className="mt-1 text-center text-xs text-graphite-500">
        {falta > 0
          ? `Faltam ${moedaCompacta(falta)} e ${diasRestantes} dia${diasRestantes === 1 ? "" : "s"}`
          : "Meta batida"}
      </p>
    </div>
  );
}

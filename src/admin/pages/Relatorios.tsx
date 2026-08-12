import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CabecalhoPagina from "../components/CabecalhoPagina";
import CampoMoeda from "../components/CampoMoeda";
import {
  COR_EIXO,
  COR_GRADE,
  COR_PRINCIPAL,
  MolduraGrafico,
  TooltipFG,
  eixoPadrao,
} from "../components/TemaGrafico";
import { COR_ORIGEM } from "../data/constantes";
import { repositorio } from "../data/repositorio";
import { useDados } from "../data/useDados";
import { moeda, moedaCompacta, numero, percentual } from "../lib/formato";
import { periodoAtual, porOrigem, serieMensal } from "../lib/metricas";
import type { BaseDados, Origem } from "../data/tipos";

export default function Relatorios() {
  const { dados: base } = useDados<BaseDados | null>("rel-base", () => repositorio.obterBase(), null);
  const [editandoVerba, setEditandoVerba] = useState<Origem | null>(null);

  const p = periodoAtual();

  const linhas = useMemo(() => (base ? porOrigem(base, p) : []), [base, p.ano, p.mes]);
  const serie = useMemo(() => (base ? serieMensal(base, 8) : []), [base]);

  const historicoCpl = useMemo(() => {
    if (!base) return [];
    return serie.map((ponto) => {
      const doMes = porOrigem(base, { ano: ponto.ano, mes: ponto.mes });
      const meta = doMes.find((l) => l.origem === "meta-ads");
      const google = doMes.find((l) => l.origem === "google-ads");
      return {
        rotulo: ponto.rotulo,
        "Meta Ads": Math.round(meta?.custoPorLead ?? 0),
        "Google Ads": Math.round(google?.custoPorLead ?? 0),
      };
    });
  }, [base, serie]);

  if (!base) return <div className="card-painel h-64 animate-pulse" />;

  const totalInvestido = linhas.reduce((s, l) => s + l.investimento, 0);
  const totalLeads = linhas.reduce((s, l) => s + l.leads, 0);
  const totalAdesoes = linhas.reduce((s, l) => s + l.adesoes, 0);
  const totalVolume = linhas.reduce((s, l) => s + l.volume, 0);
  const totalComissao = linhas.reduce((s, l) => s + l.comissao, 0);

  async function salvarVerba(origem: Origem, valor: number) {
    await repositorio.salvarInvestimento({
      id: "",
      origem,
      ano: p.ano,
      mes: p.mes,
      valor,
    });
  }

  const mesNome = new Date(p.ano, p.mes - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <CabecalhoPagina
        titulo="Relatórios"
        subtitulo={`De onde veio cada cliente e quanto custou — ${mesNome}`}
      />

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { rotulo: "Investido em mídia", valor: moedaCompacta(totalInvestido) },
          { rotulo: "Leads", valor: numero(totalLeads) },
          {
            rotulo: "Custo por lead",
            valor: totalLeads ? moeda(totalInvestido / totalLeads) : "—",
          },
          {
            rotulo: "Custo por venda",
            valor: totalAdesoes ? moeda(totalInvestido / totalAdesoes) : "—",
          },
          {
            rotulo: "Retorno em comissão",
            valor: totalInvestido ? `${(totalComissao / totalInvestido).toFixed(1)}x` : "—",
            destaque: true,
          },
        ].map((k) => (
          <div key={k.rotulo} className="card-painel">
            <p className="rotulo-painel truncate">{k.rotulo}</p>
            <p
              className={`mt-1 font-display text-xl font-bold ${
                k.destaque ? "text-gold-gradient" : "text-white"
              }`}
            >
              {k.valor}
            </p>
          </div>
        ))}
      </div>

      <div className="card-painel mb-4 overflow-x-auto p-0">
        <table className="w-full min-w-[62rem] text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-left">
              {[
                "Origem",
                "Investimento",
                "Leads",
                "Custo/lead",
                "Adesões",
                "Conversão",
                "Vendido",
                "Custo/venda",
                "Comissão",
              ].map((h) => (
                <th key={h} className="rotulo-painel px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.origem} className="linha-tabela">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: l.cor }}
                    />
                    <span className="font-semibold text-white">{l.nome}</span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  {editandoVerba === l.origem ? (
                    <CampoMoeda
                      valor={l.investimento}
                      onChange={(v) => void salvarVerba(l.origem, v)}
                      className="field-sm w-32"
                    />
                  ) : (
                    <button
                      onClick={() => setEditandoVerba(l.origem)}
                      className="text-graphite-300 underline decoration-dotted underline-offset-4 hover:text-gold-400"
                      title="Clique para ajustar a verba do mês"
                    >
                      {l.investimento ? moeda(l.investimento) : "informar"}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-graphite-200">{numero(l.leads)}</td>
                <td className="px-4 py-3 text-graphite-200">
                  {l.custoPorLead ? moeda(l.custoPorLead) : "—"}
                </td>
                <td className="px-4 py-3 font-semibold text-white">{numero(l.adesoes)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      l.conversao >= 8
                        ? "font-semibold text-emerald-400"
                        : l.conversao > 0
                        ? "text-graphite-200"
                        : "text-graphite-600"
                    }
                  >
                    {percentual(l.conversao)}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-gold-400">
                  {l.volume ? moedaCompacta(l.volume) : "—"}
                </td>
                <td className="px-4 py-3 text-graphite-200">
                  {l.custoPorVenda ? moeda(l.custoPorVenda) : "—"}
                </td>
                <td className="px-4 py-3 text-emerald-400">
                  {l.comissao ? moedaCompacta(l.comissao) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/[0.12] font-semibold">
              <td className="px-4 py-3 text-white">Total</td>
              <td className="px-4 py-3 text-white">{moeda(totalInvestido)}</td>
              <td className="px-4 py-3 text-white">{numero(totalLeads)}</td>
              <td className="px-4 py-3 text-white">
                {totalLeads ? moeda(totalInvestido / totalLeads) : "—"}
              </td>
              <td className="px-4 py-3 text-white">{numero(totalAdesoes)}</td>
              <td className="px-4 py-3 text-white">
                {totalLeads ? percentual((totalAdesoes / totalLeads) * 100) : "—"}
              </td>
              <td className="px-4 py-3 text-gold-400">{moedaCompacta(totalVolume)}</td>
              <td className="px-4 py-3 text-white">
                {totalAdesoes ? moeda(totalInvestido / totalAdesoes) : "—"}
              </td>
              <td className="px-4 py-3 text-emerald-400">{moedaCompacta(totalComissao)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mb-6 text-xs text-graphite-600">
        A verba de cada canal pode ser ajustada clicando no valor — o custo por lead e por
        venda recalculam na hora.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-painel">
          <p className="rotulo-painel">Custo por lead ao longo dos meses</p>
          <MolduraGrafico altura={260}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicoCpl} margin={{ top: 16, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke={COR_GRADE} vertical={false} />
                <XAxis dataKey="rotulo" {...eixoPadrao} />
                <YAxis {...eixoPadrao} width={46} tickFormatter={(v: number) => `R$${v}`} />
                <Tooltip
                  cursor={{ stroke: COR_EIXO, strokeDasharray: 3 }}
                  content={<TooltipFG formatar={(v) => moeda(v)} />}
                />
                <Line
                  type="monotone"
                  dataKey="Meta Ads"
                  stroke={COR_ORIGEM["meta-ads"]}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Google Ads"
                  stroke={COR_ORIGEM["google-ads"]}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </MolduraGrafico>
        </div>

        <div className="card-painel">
          <p className="rotulo-painel">Leads e adesões por mês</p>
          <MolduraGrafico altura={260}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serie} margin={{ top: 16, right: 8, bottom: 0, left: -22 }}>
                <CartesianGrid stroke={COR_GRADE} vertical={false} />
                <XAxis dataKey="rotulo" {...eixoPadrao} />
                <YAxis {...eixoPadrao} width={40} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  content={<TooltipFG formatar={(v) => numero(v)} />}
                />
                <Bar dataKey="leads" name="Leads" fill="#3F3F46" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vendas" name="Adesões" fill={COR_PRINCIPAL} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </MolduraGrafico>
        </div>
      </div>
    </>
  );
}

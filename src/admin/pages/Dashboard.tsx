import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CabecalhoPagina from "../components/CabecalhoPagina";
import CartaoKpi from "../components/CartaoKpi";
import MedidorMeta from "../components/MedidorMeta";
import GraficoFunil from "../components/GraficoFunil";
import Avatar from "../components/Avatar";
import Elo from "../components/Elo";
import { AlertaIcon, RelogioIcon } from "../components/IconesAdmin";
import {
  COR_EIXO,
  COR_META,
  COR_PRINCIPAL,
  MolduraGrafico,
  TooltipFG,
  eixoPadrao,
} from "../components/TemaGrafico";
import { COR_ORIGEM, NOME_MODALIDADE } from "../data/constantes";
import { repositorio } from "../data/repositorio";
import { useDados } from "../data/useDados";
import {
  diasRestantesNoMes,
  funilConversao,
  leadsDoPeriodo,
  leadsEsfriando,
  metaDoPeriodo,
  periodoAnterior,
  periodoAtual,
  porModalidade,
  porOrigem,
  ranking,
  tarefasAtrasadas,
  taxaConversao,
  ticketMedio,
  serieMensal,
  variacao,
  vendasDoPeriodo,
  volume,
  comissao,
} from "../lib/metricas";
import { moeda, moedaCompacta, numero, percentual, relativo } from "../lib/formato";
import type { BaseDados } from "../data/tipos";

const CORES_ROSCA = ["#C9A24B", "#5EA9E8", "#3FBF7F", "#B48EE0", "#E9C46A", "#E06A5A"];

export default function Dashboard() {
  const { dados: base, carregando } = useDados<BaseDados | null>(
    "base",
    () => repositorio.obterBase(),
    null
  );

  const m = useMemo(() => {
    if (!base) return null;
    const atual = periodoAtual();
    const anterior = periodoAnterior(atual);

    const leadsMes = leadsDoPeriodo(base.leads, atual);
    const leadsAntes = leadsDoPeriodo(base.leads, anterior);
    const vendasMes = vendasDoPeriodo(base.vendas, atual);
    const vendasAntes = vendasDoPeriodo(base.vendas, anterior);

    return {
      atual,
      leadsMes,
      vendasMes,
      volumeMes: volume(vendasMes),
      volumeAntes: volume(vendasAntes),
      comissaoMes: comissao(vendasMes),
      conversao: taxaConversao(leadsMes, vendasMes),
      conversaoAntes: taxaConversao(leadsAntes, vendasAntes),
      ticket: ticketMedio(vendasMes),
      ticketAntes: ticketMedio(vendasAntes),
      variacaoLeads: variacao(leadsMes.length, leadsAntes.length),
      meta: metaDoPeriodo(base, atual),
      atrasadas: tarefasAtrasadas(base),
      esfriando: leadsEsfriando(base),
      serie: serieMensal(base),
      origens: porOrigem(base, atual),
      modalidades: porModalidade(leadsMes.length ? leadsMes : base.leads),
      funil: funilConversao(base.leads),
      ranking: ranking(base, atual),
      proximas: base.tarefas
        .filter((t) => !t.concluida)
        .sort((a, b) => (a.vencimentoEm < b.vencimentoEm ? -1 : 1))
        .slice(0, 6),
    };
  }, [base]);

  if (carregando || !base || !m) {
    return (
      <>
        <CabecalhoPagina titulo="Painel" subtitulo="Visão geral do mês" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card-painel h-28 animate-pulse" />
          ))}
        </div>
      </>
    );
  }

  const mesNome = new Date(m.atual.ano, m.atual.mes - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
  });

  return (
    <>
      <CabecalhoPagina
        titulo="Painel"
        subtitulo={`Como está ${mesNome} até agora`}
      />

      {/* Linha 1: o dinheiro */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CartaoKpi
          rotulo="Crédito vendido"
          valor={moedaCompacta(m.volumeMes)}
          variacao={variacao(m.volumeMes, m.volumeAntes)}
          detalhe={`${m.vendasMes.length} adesões`}
          destaque="gold"
        />
        <CartaoKpi
          rotulo="Leads no mês"
          valor={numero(m.leadsMes.length)}
          variacao={m.variacaoLeads}
          detalhe="vs. mês passado"
        />
        <CartaoKpi
          rotulo="Conversão"
          valor={percentual(m.conversao)}
          variacao={variacao(m.conversao, m.conversaoAntes)}
          detalhe="adesões ÷ leads"
        />
        <CartaoKpi
          rotulo="Ticket médio"
          valor={moedaCompacta(m.ticket)}
          variacao={variacao(m.ticket, m.ticketAntes)}
          detalhe="carta média"
        />
      </div>

      {/* Linha 2: meta, comissão e o que está pegando fogo */}
      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        <MedidorMeta
          realizado={m.volumeMes}
          meta={m.meta}
          diasRestantes={diasRestantesNoMes()}
        />

        <div className="grid gap-4 lg:col-span-3 lg:grid-cols-3">
          <CartaoKpi
            rotulo="Comissão gerada"
            valor={moedaCompacta(m.comissaoMes)}
            detalhe="sobre as adesões do mês"
            destaque="verde"
          />
          <Elo para="/admin/agenda" className="block">
            <CartaoKpi
              rotulo="Follow-ups atrasados"
              valor={numero(m.atrasadas)}
              detalhe="combinados que passaram da data"
              destaque={m.atrasadas > 0 ? "vermelho" : null}
              icone={<AlertaIcon className="h-4 w-4" />}
            />
          </Elo>
          <Elo para="/admin/funil" className="block">
            <CartaoKpi
              rotulo="Leads esfriando"
              valor={numero(m.esfriando.length)}
              detalhe={`mais de ${base.config.diasParaEsfriar} dias sem contato`}
              destaque={m.esfriando.length > 10 ? "vermelho" : null}
              icone={<RelogioIcon className="h-4 w-4" />}
            />
          </Elo>

          <div className="card-painel lg:col-span-3">
            <p className="rotulo-painel">Crédito vendido nos últimos meses</p>
            <MolduraGrafico altura={200}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={m.serie} margin={{ top: 12, right: 8, bottom: 0, left: -12 }}>
                  <defs>
                    <linearGradient id="grad-volume-mensal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COR_PRINCIPAL} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={COR_PRINCIPAL} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="rotulo" {...eixoPadrao} />
                  <YAxis
                    {...eixoPadrao}
                    width={54}
                    tickFormatter={(v: number) => moedaCompacta(v).replace("R$ ", "")}
                  />
                  <Tooltip
                    cursor={{ stroke: COR_EIXO, strokeDasharray: 3 }}
                    content={
                      <TooltipFG formatar={(v) => moeda(v)} titulo={(l) => `Mês de ${l}`} />
                    }
                  />
                  <ReferenceLine
                    y={m.meta}
                    stroke={COR_META}
                    strokeDasharray="4 4"
                    strokeOpacity={0.7}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    name="Vendido"
                    stroke={COR_PRINCIPAL}
                    strokeWidth={2}
                    fill="url(#grad-volume-mensal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </MolduraGrafico>
            <p className="text-center text-[11px] text-graphite-600">
              A linha azul é a meta da equipe ({moedaCompacta(m.meta)} por mês).
            </p>
          </div>
        </div>
      </div>

      {/* Linha 3: funil, origem e modalidade */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card-painel">
          <p className="rotulo-painel">Funil</p>
          <p className="mb-3 text-xs text-graphite-500">Quantos chegam a cada etapa</p>
          <GraficoFunil etapas={m.funil} />
        </div>

        <div className="card-painel">
          <p className="rotulo-painel">De onde vêm os leads</p>
          <p className="mb-3 text-xs text-graphite-500">No mês, com o custo de cada um</p>
          <MolduraGrafico altura={230}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={m.origens}
                layout="vertical"
                margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="nome"
                  {...eixoPadrao}
                  width={78}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  content={<TooltipFG formatar={(v) => `${numero(v)} leads`} />}
                />
                <Bar dataKey="leads" name="Leads" radius={[0, 6, 6, 0]} barSize={16}>
                  {m.origens.map((o) => (
                    <Cell key={o.origem} fill={COR_ORIGEM[o.origem]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </MolduraGrafico>
          <ul className="mt-1 space-y-1">
            {m.origens
              .filter((o) => o.investimento > 0)
              .map((o) => (
                <li key={o.origem} className="flex justify-between text-xs">
                  <span className="text-graphite-500">{o.nome}</span>
                  <span className="text-graphite-300">
                    {moeda(o.custoPorLead)} por lead
                  </span>
                </li>
              ))}
          </ul>
        </div>

        <div className="card-painel">
          <p className="rotulo-painel">O que procuram</p>
          <p className="mb-3 text-xs text-graphite-500">Modalidade dos leads</p>
          <MolduraGrafico altura={230}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {/* isAnimationActive={false}: com ResponsiveContainer o Pie monta
                    em largura 0 e a animação inicial deixa os setores vazios. */}
                <Pie
                  data={m.modalidades}
                  dataKey="total"
                  nameKey="modalidade"
                  innerRadius="55%"
                  outerRadius="82%"
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {m.modalidades.map((mod, i) => (
                    <Cell key={mod.modalidade} fill={CORES_ROSCA[i % CORES_ROSCA.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <TooltipFG
                      formatar={(v) => `${numero(v)} leads`}
                      titulo={(l) => NOME_MODALIDADE[l as keyof typeof NOME_MODALIDADE] ?? l}
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </MolduraGrafico>
          <ul className="mt-1 space-y-1">
            {m.modalidades.slice(0, 4).map((mod, i) => (
              <li key={mod.modalidade} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: CORES_ROSCA[i % CORES_ROSCA.length] }}
                />
                <span className="text-graphite-400">{NOME_MODALIDADE[mod.modalidade]}</span>
                <span className="ml-auto text-graphite-300">{mod.total}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Linha 4: time e follow-ups */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="card-painel">
          <p className="rotulo-painel">Como está o time este mês</p>
          <ul className="mt-3 space-y-3">
            {m.ranking.map((linha) => (
              <li key={linha.consultor.id} className="flex items-center gap-3">
                <Avatar consultor={linha.consultor} tamanho="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-white">
                      {linha.consultor.nome}
                    </span>
                    <span className="shrink-0 text-xs text-graphite-400">
                      {moedaCompacta(linha.volume)}{" "}
                      <span className="text-graphite-600">/ {moedaCompacta(linha.meta)}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, linha.percentual)}%`,
                        backgroundColor: linha.consultor.cor,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-graphite-600">
                    {percentual(linha.percentual, 0)} da meta · {linha.vendas} adesões ·{" "}
                    {linha.leadsAtivos} leads em aberto
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-painel">
          <p className="rotulo-painel">Próximos follow-ups</p>
          <ul className="mt-3 space-y-2">
            {m.proximas.map((t) => {
              const atrasada = new Date(t.vencimentoEm).getTime() < Date.now();
              return (
                <li key={t.id} className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={t.concluida}
                    onChange={() => void repositorio.concluirTarefa(t.id, true)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-gold-500"
                    aria-label={`Concluir: ${t.titulo}`}
                  />
                  <span className="min-w-0 flex-1">
                    <Elo
                      para={t.leadId ? `/admin/leads/${t.leadId}` : "/admin/agenda"}
                      className="block truncate text-sm text-graphite-200 hover:text-gold-300"
                    >
                      {t.titulo}
                    </Elo>
                    <span
                      className={`text-[11px] ${atrasada ? "text-red-400" : "text-graphite-600"}`}
                    >
                      {relativo(t.vencimentoEm)}
                    </span>
                  </span>
                </li>
              );
            })}
            {m.proximas.length === 0 && (
              <li className="py-6 text-center text-sm text-graphite-500">
                Nenhum follow-up combinado.
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}

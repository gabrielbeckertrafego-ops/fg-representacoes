import { ETAPAS_ATIVAS, ORIGENS } from "../data/constantes";
import { diasDesde } from "./formato";
import type {
  BaseDados,
  Consultor,
  EtapaFunil,
  Lead,
  Modalidade,
  Origem,
  Venda,
} from "../data/tipos";

// Agregações puras: entram dados, saem números. Nada de React aqui, para que
// qualquer tela (e um teste, no futuro) possa reaproveitar.

export interface Periodo {
  ano: number;
  mes: number; // 1-12
}

export function periodoAtual(): Periodo {
  const hoje = new Date();
  return { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 };
}

export function periodoAnterior({ ano, mes }: Periodo): Periodo {
  return mes === 1 ? { ano: ano - 1, mes: 12 } : { ano, mes: mes - 1 };
}

function ehDoPeriodo(iso: string, { ano, mes }: Periodo): boolean {
  const d = new Date(iso);
  return d.getFullYear() === ano && d.getMonth() + 1 === mes;
}

export function leadsDoPeriodo(leads: Lead[], p: Periodo): Lead[] {
  return leads.filter((l) => ehDoPeriodo(l.criadoEm, p));
}

export function vendasDoPeriodo(vendas: Venda[], p: Periodo): Venda[] {
  return vendas.filter((v) => ehDoPeriodo(v.dataAdesao, p));
}

export const volume = (vendas: Venda[]): number =>
  vendas.reduce((s, v) => s + v.valorCredito, 0);

export const comissao = (vendas: Venda[]): number =>
  vendas.reduce((s, v) => s + v.comissaoValor, 0);

export const ticketMedio = (vendas: Venda[]): number =>
  vendas.length ? volume(vendas) / vendas.length : 0;

/** Adesões ÷ leads que entraram no mesmo mês. */
export function taxaConversao(leads: Lead[], vendas: Venda[]): number {
  return leads.length ? (vendas.length / leads.length) * 100 : 0;
}

export function variacao(atual: number, anterior: number): number | null {
  if (!anterior) return null;
  return ((atual - anterior) / anterior) * 100;
}

export function tarefasAtrasadas(base: BaseDados): number {
  return base.tarefas.filter((t) => !t.concluida && diasDesde(t.vencimentoEm) > 0).length;
}

export function leadsEsfriando(base: BaseDados): Lead[] {
  const limite = base.config.diasParaEsfriar;
  return base.leads.filter((l) => {
    if (l.etapa === "perdido" || l.etapa === "adesao") return false;
    const referencia = l.ultimoContatoEm ?? l.criadoEm;
    return diasDesde(referencia) > limite;
  });
}

/** Meta do mês somando as metas individuais (cai para a meta da equipe). */
export function metaDoPeriodo(base: BaseDados, p: Periodo): number {
  const doMes = base.metas.filter((m) => m.ano === p.ano && m.mes === p.mes && m.consultorId);
  if (doMes.length) return doMes.reduce((s, m) => s + m.valor, 0);
  return base.config.metaEquipeMensal;
}

export interface PontoMensal {
  rotulo: string;
  ano: number;
  mes: number;
  volume: number;
  meta: number;
  leads: number;
  vendas: number;
}

export function serieMensal(base: BaseDados, meses = 8): PontoMensal[] {
  const hoje = new Date();
  const pontos: PontoMensal[] = [];
  for (let i = meses - 1; i >= 0; i -= 1) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const p = { ano: d.getFullYear(), mes: d.getMonth() + 1 };
    const vendas = vendasDoPeriodo(base.vendas, p);
    pontos.push({
      rotulo: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      ano: p.ano,
      mes: p.mes,
      volume: volume(vendas),
      meta: metaDoPeriodo(base, p),
      leads: leadsDoPeriodo(base.leads, p).length,
      vendas: vendas.length,
    });
  }
  return pontos;
}

export interface LinhaOrigem {
  origem: Origem;
  nome: string;
  cor: string;
  leads: number;
  investimento: number;
  custoPorLead: number;
  adesoes: number;
  conversao: number;
  volume: number;
  custoPorVenda: number;
  comissao: number;
}

export function porOrigem(base: BaseDados, p: Periodo): LinhaOrigem[] {
  const leads = leadsDoPeriodo(base.leads, p);
  const vendas = vendasDoPeriodo(base.vendas, p);
  const porId = new Map(base.leads.map((l) => [l.id, l]));

  return ORIGENS.map(({ chave, nome, cor }) => {
    const doCanal = leads.filter((l) => l.origem === chave);
    const investimento = base.investimentos
      .filter((i) => i.origem === chave && i.ano === p.ano && i.mes === p.mes)
      .reduce((s, i) => s + i.valor, 0);

    const vendasDoCanal = vendas.filter((v) => {
      const lead = v.leadId ? porId.get(v.leadId) : null;
      return lead?.origem === chave;
    });

    return {
      origem: chave,
      nome,
      cor,
      leads: doCanal.length,
      investimento,
      custoPorLead: doCanal.length ? investimento / doCanal.length : 0,
      adesoes: vendasDoCanal.length,
      conversao: doCanal.length ? (vendasDoCanal.length / doCanal.length) * 100 : 0,
      volume: volume(vendasDoCanal),
      custoPorVenda: vendasDoCanal.length ? investimento / vendasDoCanal.length : 0,
      comissao: comissao(vendasDoCanal),
    };
  }).filter((l) => l.leads > 0 || l.investimento > 0);
}

export function porModalidade(leads: Lead[]): { modalidade: Modalidade; total: number }[] {
  const mapa = new Map<Modalidade, number>();
  leads.forEach((l) => mapa.set(l.modalidade, (mapa.get(l.modalidade) ?? 0) + 1));
  return [...mapa.entries()]
    .map(([modalidade, total]) => ({ modalidade, total }))
    .sort((a, b) => b.total - a.total);
}

export interface EtapaFunilResumo {
  etapa: EtapaFunil;
  nome: string;
  cor: string;
  total: number;
  credito: number;
  passagem: number | null;
}

/** Funil acumulado: quantos leads chegaram a cada etapa ou além dela. */
export function funilConversao(leads: Lead[]): EtapaFunilResumo[] {
  const ordem = ETAPAS_ATIVAS.map((e) => e.chave);
  const indice = (e: EtapaFunil) => ordem.indexOf(e);
  const ativos = leads.filter((l) => l.etapa !== "perdido");

  return ETAPAS_ATIVAS.map((etapa, i) => {
    const alcancaram = ativos.filter((l) => indice(l.etapa) >= i);
    const anteriores = i === 0 ? null : ativos.filter((l) => indice(l.etapa) >= i - 1).length;
    return {
      etapa: etapa.chave,
      nome: etapa.nome,
      cor: etapa.cor,
      total: alcancaram.length,
      credito: alcancaram.reduce((s, l) => s + l.valorCreditoDesejado, 0),
      passagem: anteriores ? (alcancaram.length / anteriores) * 100 : null,
    };
  });
}

export interface LinhaRanking {
  consultor: Consultor;
  volume: number;
  meta: number;
  percentual: number;
  vendas: number;
  comissao: number;
  leadsAtivos: number;
}

export function ranking(base: BaseDados, p: Periodo): LinhaRanking[] {
  const vendas = vendasDoPeriodo(base.vendas, p);
  return base.consultores
    .filter((c) => c.ativo)
    .map((consultor) => {
      const dele = vendas.filter((v) => v.consultorId === consultor.id);
      const meta =
        base.metas.find((m) => m.consultorId === consultor.id && m.ano === p.ano && m.mes === p.mes)
          ?.valor ?? consultor.metaMensal;
      const vol = volume(dele);
      return {
        consultor,
        volume: vol,
        meta,
        percentual: meta ? (vol / meta) * 100 : 0,
        vendas: dele.length,
        comissao: comissao(dele),
        leadsAtivos: base.leads.filter(
          (l) => l.consultorId === consultor.id && l.etapa !== "perdido" && l.etapa !== "adesao"
        ).length,
      };
    })
    .sort((a, b) => b.volume - a.volume);
}

/** Quantos dias ainda restam no mês corrente — usado no medidor de meta. */
export function diasRestantesNoMes(): number {
  const hoje = new Date();
  const ultimo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  return ultimo - hoje.getDate();
}

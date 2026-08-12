import { gravarAgora, gravarBase, lerBase, limparBase } from "./armazenamento";
import { EVENTO_DADOS, NOME_ETAPA, VERSAO_BASE } from "./constantes";
import { gerarBase } from "./seed";
import { agora, novoId } from "../lib/id";
import type { FiltroLeads, FiltroTarefas, FiltroVendas, Repositorio } from "./repositorio";
import type {
  BaseDados,
  Configuracao,
  EtapaFunil,
  Integracao,
  Interacao,
  Investimento,
  Lead,
  Meta,
  Simulacao,
} from "./tipos";

// Implementação sobre localStorage. Mantém a base em memória e grava com debounce;
// cada mutação avisa a interface pelo evento fg:dados — mesmo padrão de barramento
// que src/lib/modal.ts usa para o modal do site, então o projeto não ganha um
// conceito novo só por causa do painel.

let base: BaseDados | null = null;

function obter(): BaseDados {
  if (base) return base;
  const salva = lerBase();
  // Idempotente: o StrictMode monta duas vezes em desenvolvimento e sem isto a
  // base nasceria duplicada.
  if (salva && salva.versao === VERSAO_BASE) {
    base = salva;
    return base;
  }
  base = gerarBase();
  gravarAgora(base);
  return base;
}

function avisar(): void {
  window.dispatchEvent(new Event(EVENTO_DADOS));
}

function persistir(): void {
  if (base) gravarBase(base);
  avisar();
}

const clonar = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export const repositorioLocal: Repositorio = {
  // ---- Leads
  async listarLeads(filtro?: FiltroLeads) {
    const b = obter();
    let lista = b.leads;
    if (filtro?.etapa) lista = lista.filter((l) => l.etapa === filtro.etapa);
    if (filtro?.consultorId !== undefined) {
      lista = lista.filter((l) => l.consultorId === filtro.consultorId);
    }
    if (filtro?.busca?.trim()) {
      const termo = normalizar(filtro.busca.trim());
      const soDigitos = termo.replace(/\D/g, "");
      lista = lista.filter(
        (l) =>
          normalizar(l.nome).includes(termo) ||
          (soDigitos.length >= 3 && l.telefone.includes(soDigitos))
      );
    }
    return clonar(lista);
  },

  async obterLead(id: string) {
    const lead = obter().leads.find((l) => l.id === id);
    return lead ? clonar(lead) : null;
  },

  async criarLead(dados) {
    const b = obter();
    const naEtapa = b.leads.filter((l) => l.etapa === dados.etapa).length;
    const lead: Lead = {
      ...dados,
      id: novoId("lead"),
      ordem: 0, // entra no topo da coluna
      criadoEm: agora(),
      atualizadoEm: agora(),
    };
    b.leads.forEach((l) => {
      if (l.etapa === lead.etapa) l.ordem += 1;
    });
    void naEtapa;
    b.leads.unshift(lead);
    b.interacoes.push({
      id: novoId("int"),
      leadId: lead.id,
      tipo: "sistema",
      texto: "Lead cadastrado no CRM.",
      consultorId: null,
      automatica: true,
      criadoEm: agora(),
    });
    persistir();
    return clonar(lead);
  },

  async atualizarLead(id, mudancas) {
    const b = obter();
    const lead = b.leads.find((l) => l.id === id);
    if (!lead) throw new Error("Lead não encontrado");
    Object.assign(lead, mudancas, { atualizadoEm: agora() });
    persistir();
    return clonar(lead);
  },

  async moverLead(id, etapa: EtapaFunil, ordem: number) {
    const b = obter();
    const lead = b.leads.find((l) => l.id === id);
    if (!lead) throw new Error("Lead não encontrado");

    const mudouEtapa = lead.etapa !== etapa;
    lead.etapa = etapa;
    lead.ordem = ordem;
    lead.atualizadoEm = agora();

    // Reindexa os irmãos para não sobrar empate de ordem.
    b.leads
      .filter((l) => l.etapa === etapa && l.id !== id)
      .sort((a, c) => a.ordem - c.ordem)
      .forEach((l, i) => {
        l.ordem = i >= ordem ? i + 1 : i;
      });

    if (mudouEtapa) {
      b.interacoes.push({
        id: novoId("int"),
        leadId: id,
        tipo: "etapa",
        texto: `Movido para "${NOME_ETAPA[etapa]}".`,
        consultorId: lead.consultorId,
        automatica: true,
        criadoEm: agora(),
      });
    }
    persistir();
    return clonar(lead);
  },

  async removerLead(id) {
    const b = obter();
    b.leads = b.leads.filter((l) => l.id !== id);
    b.interacoes = b.interacoes.filter((i) => i.leadId !== id);
    b.tarefas = b.tarefas.filter((t) => t.leadId !== id);
    persistir();
  },

  // ---- Consultores
  async listarConsultores() {
    return clonar(obter().consultores);
  },

  async salvarConsultor(consultor) {
    const b = obter();
    const i = b.consultores.findIndex((c) => c.id === consultor.id);
    if (i >= 0) b.consultores[i] = consultor;
    else b.consultores.push({ ...consultor, id: consultor.id || novoId("c") });
    persistir();
    return clonar(consultor);
  },

  async removerConsultor(id) {
    const b = obter();
    b.consultores = b.consultores.filter((c) => c.id !== id);
    b.leads.forEach((l) => {
      if (l.consultorId === id) l.consultorId = null;
    });
    persistir();
  },

  // ---- Vendas
  async listarVendas(filtro?: FiltroVendas) {
    let lista = obter().vendas;
    if (filtro?.consultorId) lista = lista.filter((v) => v.consultorId === filtro.consultorId);
    if (filtro?.ano) {
      lista = lista.filter((v) => {
        const d = new Date(v.dataAdesao);
        return (
          d.getFullYear() === filtro.ano && (!filtro.mes || d.getMonth() + 1 === filtro.mes)
        );
      });
    }
    return clonar(lista);
  },

  async salvarVenda(venda) {
    const b = obter();
    const i = b.vendas.findIndex((v) => v.id === venda.id);
    if (i >= 0) b.vendas[i] = venda;
    else b.vendas.push({ ...venda, id: venda.id || novoId("venda") });
    persistir();
    return clonar(venda);
  },

  async removerVenda(id) {
    const b = obter();
    b.vendas = b.vendas.filter((v) => v.id !== id);
    persistir();
  },

  // ---- Interações
  async listarInteracoes(leadId) {
    const lista = obter()
      .interacoes.filter((i) => i.leadId === leadId)
      .sort((a, b2) => (a.criadoEm < b2.criadoEm ? 1 : -1));
    return clonar(lista);
  },

  async registrarInteracao(dados) {
    const b = obter();
    const interacao: Interacao = { ...dados, id: novoId("int"), criadoEm: agora() };
    b.interacoes.push(interacao);
    const lead = b.leads.find((l) => l.id === dados.leadId);
    if (lead && !dados.automatica) {
      lead.ultimoContatoEm = interacao.criadoEm;
      lead.atualizadoEm = interacao.criadoEm;
    }
    persistir();
    return clonar(interacao);
  },

  // ---- Tarefas
  async listarTarefas(filtro?: FiltroTarefas) {
    let lista = obter().tarefas;
    if (filtro?.consultorId) lista = lista.filter((t) => t.consultorId === filtro.consultorId);
    if (filtro?.concluida !== undefined) {
      lista = lista.filter((t) => t.concluida === filtro.concluida);
    }
    return clonar(lista.sort((a, b2) => (a.vencimentoEm < b2.vencimentoEm ? -1 : 1)));
  },

  async salvarTarefa(tarefa) {
    const b = obter();
    const i = b.tarefas.findIndex((t) => t.id === tarefa.id);
    if (i >= 0) b.tarefas[i] = tarefa;
    else b.tarefas.push({ ...tarefa, id: tarefa.id || novoId("tar") });
    persistir();
    return clonar(tarefa);
  },

  async concluirTarefa(id, concluida) {
    const b = obter();
    const tarefa = b.tarefas.find((t) => t.id === id);
    if (!tarefa) throw new Error("Tarefa não encontrada");
    tarefa.concluida = concluida;
    tarefa.concluidaEm = concluida ? agora() : undefined;
    persistir();
    return clonar(tarefa);
  },

  async removerTarefa(id) {
    const b = obter();
    b.tarefas = b.tarefas.filter((t) => t.id !== id);
    persistir();
  },

  // ---- Simulações
  async listarSimulacoes(leadId?: string) {
    const lista = obter().simulacoes.filter((s) => !leadId || s.leadId === leadId);
    return clonar(lista);
  },

  async salvarSimulacao(simulacao: Simulacao) {
    const b = obter();
    const nova = { ...simulacao, id: simulacao.id || novoId("sim") };
    b.simulacoes.push(nova);
    if (nova.leadId) {
      b.interacoes.push({
        id: novoId("int"),
        leadId: nova.leadId,
        tipo: "simulacao",
        texto: `Simulação salva: crédito de R$ ${nova.valorCredito.toLocaleString("pt-BR")} em ${nova.prazoMeses} meses.`,
        consultorId: nova.consultorId,
        automatica: true,
        criadoEm: agora(),
      });
    }
    persistir();
    return clonar(nova);
  },

  // ---- Metas e investimentos
  async listarMetas() {
    return clonar(obter().metas);
  },

  async salvarMeta(meta: Meta) {
    const b = obter();
    const i = b.metas.findIndex(
      (m) => m.consultorId === meta.consultorId && m.ano === meta.ano && m.mes === meta.mes
    );
    if (i >= 0) b.metas[i] = meta;
    else b.metas.push({ ...meta, id: meta.id || novoId("meta") });
    persistir();
    return clonar(meta);
  },

  async listarInvestimentos() {
    return clonar(obter().investimentos);
  },

  async salvarInvestimento(investimento: Investimento) {
    const b = obter();
    const i = b.investimentos.findIndex(
      (v) =>
        v.origem === investimento.origem &&
        v.ano === investimento.ano &&
        v.mes === investimento.mes
    );
    if (i >= 0) b.investimentos[i] = investimento;
    else b.investimentos.push({ ...investimento, id: investimento.id || novoId("inv") });
    persistir();
    return clonar(investimento);
  },

  // ---- Integrações
  async listarIntegracoes() {
    return clonar(obter().integracoes);
  },

  async salvarIntegracao(integracao: Integracao) {
    const b = obter();
    const i = b.integracoes.findIndex((x) => x.id === integracao.id);
    if (i >= 0) b.integracoes[i] = integracao;
    else b.integracoes.push(integracao);
    persistir();
    return clonar(integracao);
  },

  // ---- Configuração e demonstração
  async obterConfig() {
    return clonar(obter().config);
  },

  async salvarConfig(mudancas: Partial<Configuracao>) {
    const b = obter();
    b.config = { ...b.config, ...mudancas };
    persistir();
    return clonar(b.config);
  },

  async obterBase() {
    return clonar(obter());
  },

  async importarBase(nova: BaseDados) {
    base = nova;
    gravarAgora(nova);
    avisar();
  },

  async reiniciarDemo() {
    limparBase();
    base = gerarBase();
    gravarAgora(base);
    avisar();
  },

  async atualizarDatasDemo() {
    const b = obter();
    const geradaEm = new Date(b.geradaEm).getTime();
    const deslocamento = Date.now() - geradaEm;
    if (deslocamento < 86_400_000) return; // menos de um dia: não mexe

    const deslocar = (iso?: string) =>
      iso ? new Date(new Date(iso).getTime() + deslocamento).toISOString() : iso;

    b.leads.forEach((l) => {
      l.criadoEm = deslocar(l.criadoEm)!;
      l.atualizadoEm = deslocar(l.atualizadoEm)!;
      l.ultimoContatoEm = deslocar(l.ultimoContatoEm);
      l.proximoContatoEm = deslocar(l.proximoContatoEm);
    });
    b.interacoes.forEach((i) => (i.criadoEm = deslocar(i.criadoEm)!));
    b.tarefas.forEach((t) => {
      t.vencimentoEm = deslocar(t.vencimentoEm)!;
      t.concluidaEm = deslocar(t.concluidaEm);
      t.criadoEm = deslocar(t.criadoEm)!;
    });
    b.vendas.forEach((v) => {
      v.dataAdesao = deslocar(v.dataAdesao)!;
      v.contempladaEm = deslocar(v.contempladaEm);
    });
    b.geradaEm = new Date().toISOString();
    gravarAgora(b);
    avisar();
  },
};

export function consultarBaseSincrona(): BaseDados {
  return obter();
}

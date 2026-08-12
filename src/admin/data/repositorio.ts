import { repositorioLocal } from "./repositorioLocal";
import type {
  BaseDados,
  Configuracao,
  Consultor,
  EtapaFunil,
  Integracao,
  Interacao,
  Investimento,
  Lead,
  Meta,
  Simulacao,
  Tarefa,
  Venda,
} from "./tipos";

export interface FiltroLeads {
  etapa?: EtapaFunil;
  consultorId?: string | null;
  busca?: string;
}

export interface FiltroVendas {
  consultorId?: string;
  ano?: number;
  mes?: number;
}

export interface FiltroTarefas {
  consultorId?: string;
  concluida?: boolean;
}

/**
 * Porta única de acesso aos dados. TUDO é Promise mesmo lendo da memória —
 * é isso que permite trocar a implementação por Supabase depois sem tocar em
 * nenhuma tela.
 */
export interface Repositorio {
  listarLeads(filtro?: FiltroLeads): Promise<Lead[]>;
  obterLead(id: string): Promise<Lead | null>;
  criarLead(dados: Omit<Lead, "id" | "criadoEm" | "atualizadoEm" | "ordem">): Promise<Lead>;
  atualizarLead(id: string, mudancas: Partial<Lead>): Promise<Lead>;
  /** Separado de atualizarLead de propósito: em banco isso vira reordenação de
   *  irmãos numa transação, e essa lógica não pode vazar para a tela. */
  moverLead(id: string, etapa: EtapaFunil, ordem: number): Promise<Lead>;
  removerLead(id: string): Promise<void>;

  listarConsultores(): Promise<Consultor[]>;
  salvarConsultor(consultor: Consultor): Promise<Consultor>;
  removerConsultor(id: string): Promise<void>;

  listarVendas(filtro?: FiltroVendas): Promise<Venda[]>;
  salvarVenda(venda: Venda): Promise<Venda>;
  removerVenda(id: string): Promise<void>;

  listarInteracoes(leadId: string): Promise<Interacao[]>;
  registrarInteracao(dados: Omit<Interacao, "id" | "criadoEm">): Promise<Interacao>;

  listarTarefas(filtro?: FiltroTarefas): Promise<Tarefa[]>;
  salvarTarefa(tarefa: Tarefa): Promise<Tarefa>;
  concluirTarefa(id: string, concluida: boolean): Promise<Tarefa>;
  removerTarefa(id: string): Promise<void>;

  listarSimulacoes(leadId?: string): Promise<Simulacao[]>;
  salvarSimulacao(simulacao: Simulacao): Promise<Simulacao>;

  listarMetas(): Promise<Meta[]>;
  salvarMeta(meta: Meta): Promise<Meta>;

  listarInvestimentos(): Promise<Investimento[]>;
  salvarInvestimento(investimento: Investimento): Promise<Investimento>;

  listarIntegracoes(): Promise<Integracao[]>;
  salvarIntegracao(integracao: Integracao): Promise<Integracao>;

  obterConfig(): Promise<Configuracao>;
  salvarConfig(mudancas: Partial<Configuracao>): Promise<Configuracao>;

  obterBase(): Promise<BaseDados>;
  importarBase(base: BaseDados): Promise<void>;
  reiniciarDemo(): Promise<void>;
  /** Desloca todas as datas para que a demonstração nunca pareça abandonada. */
  atualizarDatasDemo(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Trocar para Supabase = trocar SÓ esta linha (e escrever repositorioSupabase).
// ---------------------------------------------------------------------------
export const repositorio: Repositorio = repositorioLocal;

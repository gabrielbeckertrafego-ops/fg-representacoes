// Modelo de dados do CRM. Tudo que o painel manipula passa por aqui.
// Os campos refletem o negócio de consórcio (carta de crédito, lance, comissão),
// não um CRM genérico.

export type Modalidade =
  | "imoveis"
  | "automoveis"
  | "pesados"
  | "construcao"
  | "capital-giro"
  | "alavancagem";

export type EtapaFunil =
  | "novo"
  | "contato"
  | "simulacao"
  | "proposta"
  | "documentacao"
  | "adesao"
  | "perdido";

export type Origem =
  | "meta-ads"
  | "google-ads"
  | "indicacao"
  | "organico"
  | "site-fg"
  | "whatsapp"
  | "planilha"
  | "manual";

export type Temperatura = "frio" | "morno" | "quente";
export type TipoLance = "nenhum" | "livre" | "fixo" | "embutido";
export type SituacaoVenda = "ativa" | "contemplada" | "inadimplente" | "cancelada" | "quitada";
export type Permissao = "diretora" | "consultor";

export interface Lead {
  id: string;
  nome: string;
  telefone: string; // só dígitos, com DDI: "5551999998888"
  email?: string;
  cidade?: string;
  uf?: string;
  modalidade: Modalidade;
  valorCreditoDesejado: number;
  etapa: EtapaFunil;
  /** Posição dentro da coluna do kanban. Sem isso, arrastar não guarda ordem. */
  ordem: number;
  origem: Origem;
  campanha?: string;
  conjunto?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  consultorId: string | null;
  temperatura: Temperatura;
  etiquetas: string[];
  observacoes?: string;
  motivoPerda?: string;
  criadoEm: string; // ISO completo, sempre com hora (ver armadilha de fuso em lib/formato.ts)
  atualizadoEm: string;
  ultimoContatoEm?: string;
  proximoContatoEm?: string;
}

export interface Consultor {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  foto?: string; // caminho em /public; vazio cai para as iniciais
  cor: string; // hex — avatar e séries de gráfico
  metaMensal: number; // R$ de crédito vendido
  comissaoPercentual: number;
  permissao: Permissao;
  ativo: boolean;
  criadoEm: string;
}

export interface Venda {
  id: string;
  leadId: string | null;
  clienteNome: string;
  consultorId: string;
  administradora: string;
  modalidade: Modalidade;
  valorCredito: number;
  prazoMeses: number;
  taxaAdministracao: number; // % total sobre o crédito
  fundoReserva: number; // %
  seguroMensal: number; // % ao mês
  parcela: number; // congelada no fechamento
  grupo: string;
  cota: string;
  tipoLance: TipoLance;
  percentualLance?: number;
  dataAdesao: string;
  comissaoPercentual: number;
  comissaoValor: number;
  comissaoParcelas: number;
  comissaoRecebida: number;
  situacao: SituacaoVenda;
  contempladaEm?: string;
  formaContemplacao?: "sorteio" | "lance";
  parcelasPagas: number;
  observacoes?: string;
}

export interface Interacao {
  id: string;
  leadId: string;
  tipo: "nota" | "whatsapp" | "ligacao" | "email" | "reuniao" | "simulacao" | "etapa" | "sistema";
  texto: string;
  consultorId: string | null;
  automatica: boolean;
  criadoEm: string;
}

export interface Tarefa {
  id: string;
  leadId: string | null;
  consultorId: string | null;
  titulo: string;
  tipo: "ligar" | "whatsapp" | "enviar-simulacao" | "documentos" | "reuniao" | "outro";
  vencimentoEm: string;
  concluida: boolean;
  concluidaEm?: string;
  criadoEm: string;
}

export interface Simulacao {
  id: string;
  leadId: string | null;
  consultorId: string | null;
  modalidade: Modalidade;
  administradora: string;
  valorCredito: number;
  prazoMeses: number;
  taxaAdministracao: number;
  fundoReserva: number;
  seguroMensal: number;
  tipoLance: TipoLance;
  percentualLance: number;
  // resultado congelado no momento em que foi salva
  parcela: number;
  parcelaSemSeguro: number;
  totalPlano: number;
  valorLance: number;
  creditoLiquido: number;
  criadoEm: string;
}

export type ChaveIntegracao =
  | "whatsapp"
  | "meta-lead-ads"
  | "google-ads"
  | "site-fg"
  | "planilha"
  | "webhook";

export interface Integracao {
  id: string;
  chave: ChaveIntegracao;
  nome: string;
  descricao: string;
  status: "conectado" | "desconectado" | "sincronizando" | "erro";
  conectadaEm?: string;
  ultimaSincronizacao?: string;
  leadsRecebidos: number;
  configuracao: Record<string, string>;
}

export interface Meta {
  id: string;
  consultorId: string | null; // null = meta da equipe
  ano: number;
  mes: number; // 1-12
  valor: number;
}

/** Verba de mídia por origem/mês. Sem isto, Relatórios vira contagem de leads
 *  em vez de CPL e CAC — que é o que prova o trabalho de tráfego. */
export interface Investimento {
  id: string;
  origem: Origem;
  campanha?: string;
  ano: number;
  mes: number;
  valor: number;
}

export interface PadraoModalidade {
  taxaAdministracao: number;
  fundoReserva: number;
  seguroMensal: number;
  prazos: number[];
}

export interface Configuracao {
  nomeEmpresa: string;
  senhaPainel: string;
  diasParaEsfriar: number;
  metaEquipeMensal: number;
  distribuicaoAutomatica: boolean;
  proximoDaFila: number;
  /** Liga a trava que impede abrir wa.me de telefone fictício ao vivo. */
  modoDemo: boolean;
  administradoras: string[];
  padroesPorModalidade: Record<Modalidade, PadraoModalidade>;
}

export interface BaseDados {
  versao: number;
  geradaEm: string;
  leads: Lead[];
  consultores: Consultor[];
  vendas: Venda[];
  interacoes: Interacao[];
  tarefas: Tarefa[];
  simulacoes: Simulacao[];
  integracoes: Integracao[];
  metas: Meta[];
  investimentos: Investimento[];
  config: Configuracao;
}

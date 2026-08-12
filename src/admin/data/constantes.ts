import type {
  EtapaFunil,
  Modalidade,
  Origem,
  PadraoModalidade,
  SituacaoVenda,
  Temperatura,
} from "./tipos";

// ATENÇÃO, LEIA ANTES DE CONFIAR NISTO:
// A senha abaixo vai em texto puro dentro do JavaScript que o navegador baixa.
// Qualquer pessoa a encontra no DevTools em 30 segundos. Ela serve para a
// demonstração parecer um sistema e para afastar curiosos — NÃO é segurança.
// O que torna isso aceitável hoje: toda a base é fictícia e mora no localStorage
// de quem abre a página, então não há dado de cliente para vazar. No dia em que
// entrar telefone real, isto tem que virar Supabase Auth com RLS.
export const SENHA_PADRAO = "fg2026";

export const VERSAO_BASE = 1;
export const CHAVE_BASE = "fg-crm:v1";
export const CHAVE_SESSAO = "fg-crm:sessao";
export const EVENTO_DADOS = "fg:dados";

export const ETAPAS: { chave: EtapaFunil; nome: string; cor: string; ajuda: string }[] = [
  { chave: "novo", nome: "Novo lead", cor: "#8FA3B8", ajuda: "Chegou e ainda não foi atendido" },
  { chave: "contato", nome: "Em contato", cor: "#5EA9E8", ajuda: "Conversa iniciada" },
  { chave: "simulacao", nome: "Simulação enviada", cor: "#C9A24B", ajuda: "Recebeu números" },
  { chave: "proposta", nome: "Negociação", cor: "#E9C46A", ajuda: "Discutindo prazo e parcela" },
  { chave: "documentacao", nome: "Documentação", cor: "#B48EE0", ajuda: "Juntando papelada" },
  { chave: "adesao", nome: "Adesão", cor: "#3FBF7F", ajuda: "Contrato assinado" },
  { chave: "perdido", nome: "Perdido", cor: "#E06A5A", ajuda: "Não seguiu" },
];

/** Só as colunas do quadro — "perdido" fica fora e vira zona de descarte. */
export const ETAPAS_ATIVAS = ETAPAS.filter((e) => e.chave !== "perdido");

export const NOME_ETAPA: Record<EtapaFunil, string> = ETAPAS.reduce(
  (acc, e) => ({ ...acc, [e.chave]: e.nome }),
  {} as Record<EtapaFunil, string>
);

export const COR_ETAPA: Record<EtapaFunil, string> = ETAPAS.reduce(
  (acc, e) => ({ ...acc, [e.chave]: e.cor }),
  {} as Record<EtapaFunil, string>
);

export const MODALIDADES: { chave: Modalidade; nome: string; curto: string }[] = [
  { chave: "imoveis", nome: "Imóveis", curto: "Imóvel" },
  { chave: "automoveis", nome: "Automóveis", curto: "Auto" },
  { chave: "pesados", nome: "Pesados & Máquinas", curto: "Pesados" },
  { chave: "construcao", nome: "Construção", curto: "Construção" },
  { chave: "capital-giro", nome: "Capital de Giro", curto: "Giro" },
  { chave: "alavancagem", nome: "Alavancagem Patrimonial", curto: "Alavancagem" },
];

export const NOME_MODALIDADE: Record<Modalidade, string> = MODALIDADES.reduce(
  (acc, m) => ({ ...acc, [m.chave]: m.nome }),
  {} as Record<Modalidade, string>
);

export const ORIGENS: { chave: Origem; nome: string; cor: string; paga: boolean }[] = [
  { chave: "meta-ads", nome: "Meta Ads", cor: "#4E8FE8", paga: true },
  { chave: "google-ads", nome: "Google Ads", cor: "#E8B44E", paga: true },
  { chave: "indicacao", nome: "Indicação", cor: "#3FBF7F", paga: false },
  { chave: "organico", nome: "Orgânico", cor: "#9B8FE8", paga: false },
  { chave: "site-fg", nome: "Site FG", cor: "#C9A24B", paga: false },
  { chave: "whatsapp", nome: "WhatsApp", cor: "#25D366", paga: false },
  { chave: "planilha", nome: "Planilha", cor: "#8FA3B8", paga: false },
  { chave: "manual", nome: "Cadastro manual", cor: "#71717A", paga: false },
];

export const NOME_ORIGEM: Record<Origem, string> = ORIGENS.reduce(
  (acc, o) => ({ ...acc, [o.chave]: o.nome }),
  {} as Record<Origem, string>
);

export const COR_ORIGEM: Record<Origem, string> = ORIGENS.reduce(
  (acc, o) => ({ ...acc, [o.chave]: o.cor }),
  {} as Record<Origem, string>
);

export const TEMPERATURAS: { chave: Temperatura; nome: string; cor: string }[] = [
  { chave: "frio", nome: "Frio", cor: "#5EA9E8" },
  { chave: "morno", nome: "Morno", cor: "#E9C46A" },
  { chave: "quente", nome: "Quente", cor: "#E06A5A" },
];

export const NOME_SITUACAO: Record<SituacaoVenda, string> = {
  ativa: "Ativa",
  contemplada: "Contemplada",
  inadimplente: "Inadimplente",
  cancelada: "Cancelada",
  quitada: "Quitada",
};

export const MOTIVOS_PERDA = [
  "Achou a parcela alta",
  "Preferiu financiamento",
  "Prazo não serviu",
  "Parou de responder",
  "Já comprou em outro lugar",
  "Não tinha perfil de crédito",
  "Só estava pesquisando",
];

export const ADMINISTRADORAS = ["Embracon", "Banco do Brasil", "Itaú", "Porto Seguro"];

// Taxas ilustrativas e plausíveis — CALIBRAR COM A PRISCILA antes de apresentar.
// Ela trabalha com consórcio há 15 anos; uma parcela errada na frente dela custa
// mais credibilidade do que o painel inteiro ganha.
export const PADROES_MODALIDADE: Record<Modalidade, PadraoModalidade> = {
  imoveis: { taxaAdministracao: 22, fundoReserva: 2, seguroMensal: 0.035, prazos: [150, 180, 200, 240] },
  automoveis: { taxaAdministracao: 18, fundoReserva: 2, seguroMensal: 0.055, prazos: [50, 60, 72, 80] },
  pesados: { taxaAdministracao: 20, fundoReserva: 2, seguroMensal: 0.045, prazos: [80, 100, 120, 150] },
  construcao: { taxaAdministracao: 21, fundoReserva: 2, seguroMensal: 0.035, prazos: [120, 150, 180, 200] },
  "capital-giro": { taxaAdministracao: 19, fundoReserva: 2, seguroMensal: 0.04, prazos: [60, 80, 100] },
  alavancagem: { taxaAdministracao: 22, fundoReserva: 2, seguroMensal: 0.035, prazos: [180, 200, 240] },
};

/** Taxa mensal usada só na comparação "no financiamento sairia por…". */
export const TAXA_FINANCIAMENTO_MES = 1.19;

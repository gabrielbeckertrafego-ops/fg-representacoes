import { repositorio } from "./repositorio";
import { novoId } from "../lib/id";
import type { ChaveIntegracao, Integracao, Lead, Modalidade, Origem } from "./tipos";

// Integrações da demonstração.
//
// A conexão é fingida, mas o FORMATO é o real: mesma forma de configuração,
// mesmo estado, mesmo efeito no funil. Quando for ligar de verdade, troque o
// corpo de `conectar` e de `receberLeadDeTeste` por chamadas HTTP — a Evolution
// API (WhatsApp) e o Graph da Meta já são usados em outro projeto do usuário e
// devolvem exatamente estes campos.

export interface CampoConfig {
  chave: string;
  rotulo: string;
  exemplo?: string;
  ajuda?: string;
  somenteLeitura?: boolean;
}

export const CAMPOS_POR_CANAL: Record<ChaveIntegracao, CampoConfig[]> = {
  whatsapp: [
    { chave: "numero", rotulo: "Número que atende", exemplo: "(51) 99533-6879" },
    { chave: "instancia", rotulo: "Nome da conexão", exemplo: "fg-principal" },
    {
      chave: "token",
      rotulo: "Chave de acesso",
      exemplo: "••••••••••••",
      ajuda: "Fica guardada no servidor, ninguém do time enxerga.",
    },
  ],
  "meta-lead-ads": [
    { chave: "conta", rotulo: "Conta de anúncios", exemplo: "FG Representações" },
    { chave: "formulario", rotulo: "Formulário", exemplo: "Consórcio — Imóveis" },
    { chave: "token", rotulo: "Token de acesso", exemplo: "••••••••••••" },
  ],
  "google-ads": [
    { chave: "conta", rotulo: "ID da conta", exemplo: "123-456-7890" },
    { chave: "token", rotulo: "Token de acesso", exemplo: "••••••••••••" },
  ],
  "site-fg": [
    { chave: "site", rotulo: "Endereço do site", exemplo: "fgrepresentacoes.com.br" },
  ],
  planilha: [
    {
      chave: "arquivo",
      rotulo: "Planilha",
      exemplo: "clientes-2025.csv",
      ajuda: "Colunas esperadas: nome, telefone, modalidade, valor.",
    },
  ],
  webhook: [
    {
      chave: "url",
      rotulo: "Endereço para enviar os leads",
      exemplo: "https://fgrepresentacoes.com.br/api/leads/entrada",
      somenteLeitura: true,
      ajuda: "Cole este endereço na ferramenta que vai mandar os leads.",
    },
    { chave: "chave", rotulo: "Chave de segurança", exemplo: "fg_wh_9f2b71", somenteLeitura: true },
  ],
};

const ORIGEM_POR_CANAL: Record<ChaveIntegracao, Origem> = {
  whatsapp: "whatsapp",
  "meta-lead-ads": "meta-ads",
  "google-ads": "google-ads",
  "site-fg": "site-fg",
  planilha: "planilha",
  webhook: "manual",
};

const NOMES_TESTE = [
  "Rodrigo Bertoldo",
  "Camila Fontoura",
  "Anderson Vargas",
  "Letícia Bianchi",
  "Marcos Dallabrida",
  "Priscila Schmitt",
];

const MODALIDADES_TESTE: Modalidade[] = ["imoveis", "automoveis", "pesados", "construcao"];

const CAMPANHA_POR_CANAL: Partial<Record<ChaveIntegracao, string>> = {
  "meta-lead-ads": "[MT] Imóveis | Interesses | POA",
  "google-ads": "[GAds] Consórcio Imóvel | Pesquisa Exata",
};

/** Simula o aperto de mão com o serviço: leva um tempinho e volta conectado. */
export async function conectar(
  integracao: Integracao,
  configuracao: Record<string, string>
): Promise<Integracao> {
  await new Promise((r) => setTimeout(r, 1200));
  const atualizada: Integracao = {
    ...integracao,
    status: "conectado",
    conectadaEm: new Date().toISOString(),
    ultimaSincronizacao: new Date().toISOString(),
    configuracao,
  };
  return repositorio.salvarIntegracao(atualizada);
}

export async function desconectar(integracao: Integracao): Promise<Integracao> {
  return repositorio.salvarIntegracao({
    ...integracao,
    status: "desconectado",
    conectadaEm: undefined,
    configuracao: {},
  });
}

/**
 * Cria um lead como se tivesse acabado de chegar pelo canal.
 * É o truque de demonstração mais eficiente do painel: prova a integração em
 * dois segundos, sem depender da rede nem de credencial na hora da reunião.
 */
export async function receberLeadDeTeste(integracao: Integracao): Promise<Lead> {
  const consultores = await repositorio.listarConsultores();
  const config = await repositorio.obterConfig();
  const ativos = consultores.filter((c) => c.ativo);

  // Rotaciona em vez de sortear: sorteando, o mesmo nome repetia em cliques
  // seguidos e a demonstração perdia a graça.
  const indice = integracao.leadsRecebidos % NOMES_TESTE.length;
  const nome = NOMES_TESTE[indice];
  const modalidade = MODALIDADES_TESTE[indice % MODALIDADES_TESTE.length];
  const valores = [120_000, 180_000, 250_000, 320_000, 450_000];

  const dono = config.distribuicaoAutomatica && ativos.length
    ? ativos[config.proximoDaFila % ativos.length]
    : null;

  const lead = await repositorio.criarLead({
    nome,
    telefone: `5551${Math.floor(900000000 + Math.random() * 99999999)}`,
    modalidade,
    valorCreditoDesejado: valores[indice % valores.length],
    etapa: "novo",
    origem: ORIGEM_POR_CANAL[integracao.chave],
    campanha: CAMPANHA_POR_CANAL[integracao.chave],
    consultorId: dono?.id ?? null,
    temperatura: "morno",
    etiquetas: ["Chegou agora"],
    cidade: "Porto Alegre",
    uf: "RS",
  });

  if (dono) {
    await repositorio.salvarConfig({ proximoDaFila: config.proximoDaFila + 1 });
  }

  await repositorio.salvarIntegracao({
    ...integracao,
    leadsRecebidos: integracao.leadsRecebidos + 1,
    ultimaSincronizacao: new Date().toISOString(),
  });

  await repositorio.registrarInteracao({
    leadId: lead.id,
    tipo: "sistema",
    texto: `Lead recebido por ${integracao.nome}.`,
    consultorId: null,
    automatica: true,
  });

  return lead;
}

/** Endereço e chave do webhook — estáveis por integração. */
export function dadosWebhook(): Record<string, string> {
  return {
    url: "https://fgrepresentacoes.com.br/api/leads/entrada",
    chave: `fg_wh_${novoId("").replace("-", "").slice(0, 6)}`,
  };
}

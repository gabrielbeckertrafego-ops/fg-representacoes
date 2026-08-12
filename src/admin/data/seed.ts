import {
  ADMINISTRADORAS,
  PADROES_MODALIDADE,
  SENHA_PADRAO,
  VERSAO_BASE,
} from "./constantes";
import type {
  BaseDados,
  Consultor,
  EtapaFunil,
  Integracao,
  Interacao,
  Investimento,
  Lead,
  Meta,
  Modalidade,
  Origem,
  SituacaoVenda,
  Tarefa,
  Temperatura,
  Venda,
} from "./tipos";

// Base fictícia da demonstração.
//
// Determinística de propósito (gerador congruente linear com semente fixa): a
// demonstração que foi testada aqui é exatamente a que o cliente vê na reunião.
// Math.random deixaria cada máquina com números diferentes.

function criarAleatorio(semente: number) {
  let s = semente;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const rnd = criarAleatorio(20260812);

const inteiro = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;
const escolher = <T,>(lista: T[]): T => lista[Math.floor(rnd() * lista.length)];
const talvez = (chance: number) => rnd() < chance;

/** Data no passado, com hora comercial plausível. */
function diasAtras(dias: number, horaMin = 8, horaMax = 20): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(inteiro(horaMin, horaMax), inteiro(0, 59), 0, 0);
  return d.toISOString();
}

function diasAFrente(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(inteiro(9, 17), 0, 0, 0);
  return d.toISOString();
}

const PRENOMES = [
  "Ana", "Bruno", "Carla", "Diego", "Eduarda", "Fernando", "Gabriela", "Henrique",
  "Isabela", "Jorge", "Karina", "Lucas", "Mariana", "Nelson", "Otávio", "Patrícia",
  "Rafael", "Simone", "Thiago", "Vanessa", "William", "Camila", "Douglas", "Elaine",
  "Felipe", "Giovana", "Marcelo", "Renata", "Rodrigo", "Tatiane", "Vinícius", "Aline",
  "Cristiano", "Débora", "Everton", "Juliana", "Leandro", "Michele", "Paulo", "Sabrina",
];

const SOBRENOMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Pereira", "Lima", "Costa", "Ferreira",
  "Rodrigues", "Almeida", "Nascimento", "Carvalho", "Gomes", "Martins", "Rocha",
  "Ribeiro", "Alves", "Monteiro", "Cardoso", "Teixeira", "Bertoldo", "Kunz",
  "Schmitt", "Bastos", "Vargas", "Machado", "Fontoura", "Bianchi", "Dallabrida",
];

const CIDADES_RS: [string, string][] = [
  ["Porto Alegre", "RS"], ["Canoas", "RS"], ["Gravataí", "RS"], ["Novo Hamburgo", "RS"],
  ["São Leopoldo", "RS"], ["Caxias do Sul", "RS"], ["Viamão", "RS"], ["Alvorada", "RS"],
  ["Pelotas", "RS"], ["Santa Maria", "RS"], ["Cachoeirinha", "RS"], ["Sapucaia do Sul", "RS"],
];

const CIDADES_FORA: [string, string][] = [
  ["Florianópolis", "SC"], ["Curitiba", "PR"], ["São Paulo", "SP"],
  ["Joinville", "SC"], ["Londrina", "PR"], ["Balneário Camboriú", "SC"],
];

const CAMPANHAS: Record<string, { origem: Origem; conjuntos: string[] }> = {
  "[MT] Imóveis | Interesses | POA": { origem: "meta-ads", conjuntos: ["Interesse imóvel 25-45", "Lookalike compradores 1%"] },
  "[MT] Pesados | Lookalike 1%": { origem: "meta-ads", conjuntos: ["LAL vendas 1%", "Transportadores"] },
  "[MT] Auto | Remarketing 30d": { origem: "meta-ads", conjuntos: ["Visitou site 30d", "Engajou no perfil"] },
  "[GAds] Consórcio Imóvel | Pesquisa Exata": { origem: "google-ads", conjuntos: ["consórcio imóvel", "carta de crédito imóvel"] },
  "[GAds] Consórcio Carro | Pesquisa Ampla": { origem: "google-ads", conjuntos: ["consórcio carro", "consórcio automóvel"] },
};

const NOMES_CAMPANHA = Object.keys(CAMPANHAS);

const FAIXA_CREDITO: Record<Modalidade, [number, number]> = {
  imoveis: [150_000, 600_000],
  automoveis: [40_000, 180_000],
  pesados: [200_000, 900_000],
  construcao: [80_000, 350_000],
  "capital-giro": [50_000, 300_000],
  alavancagem: [300_000, 1_200_000],
};

/** Cartas são sempre valores redondos — múltiplos de 5 mil. */
function valorCarta(modalidade: Modalidade): number {
  const [min, max] = FAIXA_CREDITO[modalidade];
  const bruto = inteiro(min, max);
  return Math.round(bruto / 5000) * 5000;
}

const PESO_MODALIDADE: [Modalidade, number][] = [
  ["imoveis", 34], ["automoveis", 27], ["pesados", 13],
  ["construcao", 10], ["capital-giro", 9], ["alavancagem", 7],
];

const PESO_ORIGEM: [Origem, number][] = [
  ["meta-ads", 55], ["google-ads", 18], ["indicacao", 12],
  ["organico", 8], ["site-fg", 7],
];

const PESO_ETAPA: [EtapaFunil, number][] = [
  ["novo", 28], ["contato", 20], ["simulacao", 15], ["proposta", 11],
  ["documentacao", 5], ["adesao", 9], ["perdido", 12],
];

function sortearPeso<T>(pesos: [T, number][]): T {
  const total = pesos.reduce((s, [, p]) => s + p, 0);
  let n = rnd() * total;
  for (const [item, peso] of pesos) {
    n -= peso;
    if (n <= 0) return item;
  }
  return pesos[0][0];
}

const NOTAS_POR_ETAPA: Record<EtapaFunil, string[]> = {
  novo: ["Preencheu o formulário do site.", "Chegou pelo anúncio, ainda não respondeu.", "Mandou mensagem no WhatsApp fora do horário."],
  contato: ["Atendeu, pediu para retornar depois das 18h.", "Conversamos rápido, vai ver com a esposa.", "Quer entender a diferença para financiamento.", "Pediu para mandar tudo por WhatsApp."],
  simulacao: ["Enviei simulação com prazo mais longo.", "Mandei duas opções de parcela.", "Achou a parcela justa, vai analisar.", "Pediu simulação com valor menor."],
  proposta: ["Negociando o prazo para caber no orçamento.", "Quer entrar com lance no terceiro mês.", "Aguardando resposta sobre a proposta enviada.", "Pediu desconto na primeira parcela."],
  documentacao: ["Aguardando comprovante de renda.", "Documentos quase completos, falta o RG.", "Enviou os documentos, conferindo com a administradora."],
  adesao: ["Contrato assinado. Cliente muito satisfeito.", "Fechou a carta, entrou no grupo desta semana.", "Assinou e já quer indicar o cunhado."],
  perdido: ["Achou a parcela alta para o momento.", "Optou por financiamento no banco.", "Parou de responder após a simulação.", "Disse que só estava pesquisando."],
};

function nomePessoa(usados: Set<string>): string {
  for (let i = 0; i < 60; i += 1) {
    const nome = `${escolher(PRENOMES)} ${escolher(SOBRENOMES)}`;
    if (!usados.has(nome)) {
      usados.add(nome);
      return nome;
    }
  }
  return `${escolher(PRENOMES)} ${escolher(SOBRENOMES)} ${usados.size}`;
}

function telefoneRS(): string {
  return `55${escolher(["51", "51", "51", "54", "53", "47", "41"])}9${inteiro(10_000_000, 99_999_999)}`;
}

export function gerarBase(): BaseDados {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;

  // ---- Consultores: o time real da FG, com as fotos que já estão no site.
  // É o detalhe que faz a diretora reconhecer a própria equipe na primeira olhada.
  const consultores: Consultor[] = [
    { id: "c-priscila", nome: "Priscila Correa", foto: "/equipe/priscila-correa.jpg", cor: "#C9A24B", metaMensal: 900_000, comissaoPercentual: 2.4, permissao: "diretora", ativo: true, criadoEm: diasAtras(400), telefone: "5551995336879", email: "priscila@fgrepresentacoes.com.br" },
    { id: "c-adriele", nome: "Adriele Narciso", foto: "/equipe/especialista-1.jpg", cor: "#5EA9E8", metaMensal: 550_000, comissaoPercentual: 1.8, permissao: "consultor", ativo: true, criadoEm: diasAtras(320) },
    { id: "c-filipe", nome: "Filipe Rodrigues", foto: "/equipe/especialista-4.jpg", cor: "#3FBF7F", metaMensal: 650_000, comissaoPercentual: 2.0, permissao: "consultor", ativo: true, criadoEm: diasAtras(300) },
    { id: "c-julia", nome: "Júlia Eduarda", foto: "/equipe/especialista-6.jpg", cor: "#B48EE0", metaMensal: 450_000, comissaoPercentual: 1.8, permissao: "consultor", ativo: true, criadoEm: diasAtras(180) },
    { id: "c-isabelle", nome: "Isabelle Correa", foto: "/equipe/isabelle-correa.jpg", cor: "#E9C46A", metaMensal: 450_000, comissaoPercentual: 1.8, permissao: "consultor", ativo: true, criadoEm: diasAtras(90) },
  ];

  const idsConsultores = consultores.map((c) => c.id);

  // ---- Leads
  const leads: Lead[] = [];
  const interacoes: Interacao[] = [];
  const usados = new Set<string>();
  const contagemPorEtapa: Record<string, number> = {};

  // 320 leads em 120 dias (~85/mês) para ~5 adesões mensais: conversão de ~6%,
  // que é o que uma operação boa de consórcio faz. Com menos leads a tela de
  // Relatórios mostrava 25% de conversão, e ninguém do ramo acredita nisso.
  const TOTAL_LEADS = 320;

  for (let i = 0; i < TOTAL_LEADS; i += 1) {
    // Mais peso nos últimos 30 dias: o funil precisa parecer vivo.
    const dias = talvez(0.55) ? inteiro(0, 30) : inteiro(31, 120);
    const criadoEm = diasAtras(dias);
    const modalidade = sortearPeso(PESO_MODALIDADE);
    const etapa = sortearPeso(PESO_ETAPA);
    const origem = sortearPeso(PESO_ORIGEM);

    const nomeCampanha =
      origem === "meta-ads" || origem === "google-ads"
        ? escolher(NOMES_CAMPANHA.filter((n) => CAMPANHAS[n].origem === origem))
        : undefined;

    const [cidade, uf] = talvez(0.85) ? escolher(CIDADES_RS) : escolher(CIDADES_FORA);
    const nome = nomePessoa(usados);
    const semDono = etapa === "novo" && talvez(0.3);

    const temperatura: Temperatura =
      etapa === "proposta" || etapa === "documentacao" || etapa === "adesao"
        ? "quente"
        : etapa === "simulacao"
        ? "morno"
        : etapa === "perdido"
        ? "frio"
        : escolher<Temperatura>(["frio", "morno", "morno"]);

    contagemPorEtapa[etapa] = (contagemPorEtapa[etapa] ?? 0) + 1;

    // Último contato: quanto mais avançada a etapa, mais recente. Alguns leads
    // ficam propositalmente parados para o alerta de "esfriando" ter o que mostrar.
    const diasSemContato =
      etapa === "novo" ? inteiro(0, 9) : talvez(0.25) ? inteiro(5, 14) : inteiro(0, 4);

    const lead: Lead = {
      id: `lead-${i.toString(36)}${inteiro(100, 999)}`,
      nome,
      telefone: telefoneRS(),
      email: talvez(0.45) ? `${nome.toLowerCase().replace(/[^a-z ]/g, "").replace(/ /g, ".")}@email.com` : undefined,
      cidade,
      uf,
      modalidade,
      valorCreditoDesejado: valorCarta(modalidade),
      etapa,
      ordem: contagemPorEtapa[etapa],
      origem,
      campanha: nomeCampanha,
      conjunto: nomeCampanha ? escolher(CAMPANHAS[nomeCampanha].conjuntos) : undefined,
      utm: nomeCampanha
        ? {
            source: origem === "meta-ads" ? "facebook" : "google",
            medium: origem === "meta-ads" ? "paid_social" : "cpc",
            campaign: nomeCampanha,
          }
        : undefined,
      consultorId: semDono ? null : escolher(idsConsultores),
      temperatura,
      etiquetas: talvez(0.2) ? [escolher(["Indicação forte", "Já tem consórcio", "Urgente", "Segunda carta"])] : [],
      observacoes: undefined,
      motivoPerda: undefined,
      criadoEm,
      atualizadoEm: diasAtras(Math.max(0, dias - inteiro(0, Math.min(dias, 5)))),
      ultimoContatoEm: etapa === "novo" && talvez(0.5) ? undefined : diasAtras(Math.min(dias, diasSemContato)),
      proximoContatoEm:
        etapa !== "perdido" && etapa !== "adesao" && talvez(0.35)
          ? diasAFrente(inteiro(-3, 10))
          : undefined,
    };

    leads.push(lead);

    // Timeline: 2 a 7 interações, sempre em ordem cronológica.
    const quantas = inteiro(2, 7);
    for (let j = 0; j < quantas; j += 1) {
      const diasInteracao = Math.max(0, Math.round(dias - (dias / quantas) * j));
      interacoes.push({
        id: `int-${i}-${j}`,
        leadId: lead.id,
        tipo: j === quantas - 1 ? "sistema" : escolher(["nota", "whatsapp", "ligacao", "nota", "whatsapp"]),
        texto:
          j === quantas - 1
            ? `Lead recebido via ${origem === "meta-ads" ? "Meta Ads" : origem === "google-ads" ? "Google Ads" : origem === "site-fg" ? "formulário do site" : "contato direto"}.`
            : escolher(NOTAS_POR_ETAPA[etapa]),
        consultorId: j === quantas - 1 ? null : lead.consultorId,
        automatica: j === quantas - 1,
        criadoEm: diasAtras(diasInteracao),
      });
    }
  }

  // ---- Vendas: 8 meses de história, crescendo devagar, com o mês corrente
  // parcialmente preenchido para o medidor de meta ter o que contar.
  const vendas: Venda[] = [];
  // As vendas do mês são vinculadas a leads de origens INTERCALADAS. Pegando na
  // ordem natural, saíam quase todas de Meta Ads e o relatório mostrava 25% de
  // conversão num canal só — número que ninguém do ramo acredita.
  const porOrigemAdesao = new Map<Origem, Lead[]>();
  leads
    .filter((l) => l.etapa === "adesao")
    .forEach((l) => {
      const atual = porOrigemAdesao.get(l.origem) ?? [];
      atual.push(l);
      porOrigemAdesao.set(l.origem, atual);
    });

  const leadsAdesao: Lead[] = [];
  let restam = true;
  while (restam) {
    restam = false;
    porOrigemAdesao.forEach((lista) => {
      const proximo = lista.shift();
      if (proximo) {
        leadsAdesao.push(proximo);
        restam = true;
      }
    });
  }
  let indiceLeadAdesao = 0;

  for (let voltarMeses = 7; voltarMeses >= 0; voltarMeses -= 1) {
    const base = new Date(anoAtual, mesAtual - 1 - voltarMeses, 1);
    const ano = base.getFullYear();
    const mes = base.getMonth() + 1;
    const ehMesCorrente = voltarMeses === 0;
    const diasNoMes = new Date(ano, mes, 0).getDate();

    // O mês corrente vem incompleto de propósito: é o que faz o medidor de meta
    // contar uma história ("falta pouco") em vez de parecer estático.
    const quantas = ehMesCorrente ? 5 : inteiro(3, 6);

    for (let k = 0; k < quantas; k += 1) {
      const modalidade = sortearPeso(PESO_MODALIDADE);
      const padrao = PADROES_MODALIDADE[modalidade];
      const prazo = escolher(padrao.prazos);
      const credito = valorCarta(modalidade);
      const totalPlano = credito * (1 + padrao.taxaAdministracao / 100 + padrao.fundoReserva / 100);
      const parcela = totalPlano / prazo + credito * (padrao.seguroMensal / 100);
      // No mês corrente as vendas circulam pelo time, para o ranking não abrir
      // com metade da equipe zerada na frente dela.
      const consultor = ehMesCorrente ? consultores[k % consultores.length] : escolher(consultores);
      const diaLimite = ehMesCorrente ? Math.min(hoje.getDate(), diasNoMes) : diasNoMes;
      const dia = inteiro(1, Math.max(1, diaLimite));
      const dataAdesao = new Date(ano, mes - 1, dia, 14, 0, 0).toISOString();

      const leadVinculado =
        ehMesCorrente && indiceLeadAdesao < leadsAdesao.length
          ? leadsAdesao[indiceLeadAdesao++]
          : null;

      const situacao: SituacaoVenda =
        voltarMeses > 3 && talvez(0.28)
          ? "contemplada"
          : talvez(0.06)
          ? "inadimplente"
          : talvez(0.04)
          ? "cancelada"
          : "ativa";

      const comissaoPercentual = consultor.comissaoPercentual;
      const comissaoValor = credito * (comissaoPercentual / 100);
      const comissaoParcelas = 4;
      const parcelasComissaoPagas = Math.min(comissaoParcelas, Math.max(0, 7 - voltarMeses));

      vendas.push({
        id: `venda-${ano}${mes}-${k}`,
        leadId: leadVinculado?.id ?? null,
        clienteNome: leadVinculado?.nome ?? nomePessoa(usados),
        consultorId: consultor.id,
        administradora: escolher(ADMINISTRADORAS),
        modalidade,
        valorCredito: credito,
        prazoMeses: prazo,
        taxaAdministracao: padrao.taxaAdministracao,
        fundoReserva: padrao.fundoReserva,
        seguroMensal: padrao.seguroMensal,
        parcela: Math.round(parcela * 100) / 100,
        grupo: String(inteiro(1000, 1400)),
        cota: String(inteiro(1, 999)).padStart(3, "0"),
        tipoLance: talvez(0.3) ? escolher(["livre", "embutido"]) : "nenhum",
        percentualLance: talvez(0.3) ? inteiro(10, 30) : undefined,
        dataAdesao,
        comissaoPercentual,
        comissaoValor,
        comissaoParcelas,
        comissaoRecebida: (comissaoValor / comissaoParcelas) * parcelasComissaoPagas,
        situacao,
        contempladaEm: undefined,
        formaContemplacao: undefined,
        parcelasPagas: Math.max(0, voltarMeses),
        observacoes: undefined,
      });
    }
  }

  // Contemplação só faz sentido depois de alguns meses de grupo.
  vendas.forEach((v) => {
    if (v.situacao === "contemplada") {
      const d = new Date(v.dataAdesao);
      d.setMonth(d.getMonth() + inteiro(2, 5));
      v.contempladaEm = d.toISOString();
      v.formaContemplacao = talvez(0.5) ? "lance" : "sorteio";
    }
  });

  // ---- Tarefas: o número vermelho de atrasadas é o gancho da apresentação.
  const tarefas: Tarefa[] = [];
  const leadsAtivos = leads.filter((l) => l.etapa !== "perdido" && l.etapa !== "adesao");

  const criarTarefa = (dias: number, i: number) => {
    const lead = escolher(leadsAtivos);
    tarefas.push({
      id: `tar-${i}`,
      leadId: lead.id,
      consultorId: lead.consultorId,
      titulo: escolher([
        `Retornar ligação para ${lead.nome.split(" ")[0]}`,
        `Enviar simulação para ${lead.nome.split(" ")[0]}`,
        `Cobrar documentos de ${lead.nome.split(" ")[0]}`,
        `Confirmar interesse com ${lead.nome.split(" ")[0]}`,
      ]),
      tipo: escolher(["ligar", "whatsapp", "enviar-simulacao", "documentos"]),
      vencimentoEm: dias < 0 ? diasAtras(Math.abs(dias)) : dias === 0 ? diasAFrente(0) : diasAFrente(dias),
      concluida: false,
      criadoEm: diasAtras(Math.abs(dias) + inteiro(1, 6)),
    });
  };

  [-4, -3, -1].forEach((d, i) => criarTarefa(d, i));
  [0, 0, 0, 0, 0].forEach((d, i) => criarTarefa(d, 10 + i));
  [1, 1, 2, 2, 3, 4, 5, 6, 8, 10].forEach((d, i) => criarTarefa(d, 20 + i));

  // Algumas já feitas, para o histórico não nascer vazio.
  for (let i = 0; i < 12; i += 1) {
    const lead = escolher(leadsAtivos);
    const dias = inteiro(1, 20);
    tarefas.push({
      id: `tar-feita-${i}`,
      leadId: lead.id,
      consultorId: lead.consultorId,
      titulo: `Follow-up com ${lead.nome.split(" ")[0]}`,
      tipo: escolher(["ligar", "whatsapp"]),
      vencimentoEm: diasAtras(dias),
      concluida: true,
      concluidaEm: diasAtras(dias),
      criadoEm: diasAtras(dias + 2),
    });
  }

  // ---- Metas por consultor, últimos 8 meses
  const metas: Meta[] = [];
  for (let voltarMeses = 7; voltarMeses >= 0; voltarMeses -= 1) {
    const base = new Date(anoAtual, mesAtual - 1 - voltarMeses, 1);
    consultores.forEach((c) => {
      metas.push({
        id: `meta-${c.id}-${base.getFullYear()}-${base.getMonth() + 1}`,
        consultorId: c.id,
        ano: base.getFullYear(),
        mes: base.getMonth() + 1,
        valor: c.metaMensal,
      });
    });
  }

  // ---- Investimento de mídia.
  // Os valores são calibrados pelo volume de leads que este seed gera (~40/mês):
  // dão custo por lead na casa de R$ 45 no Meta e R$ 100 no Google, que é o que
  // se vê em consórcio (ticket alto, lead caro). Se mexer no total de leads,
  // mexa aqui junto, senão o CPL da tela de Relatórios fica irreal.
  const investimentos: Investimento[] = [];
  for (let voltarMeses = 7; voltarMeses >= 0; voltarMeses -= 1) {
    const base = new Date(anoAtual, mesAtual - 1 - voltarMeses, 1);
    const fator = voltarMeses === 0 ? 0.6 : 1; // mês corrente ainda rodando
    investimentos.push(
      {
        id: `inv-meta-${base.getFullYear()}-${base.getMonth() + 1}`,
        origem: "meta-ads",
        ano: base.getFullYear(),
        mes: base.getMonth() + 1,
        valor: Math.round(inteiro(2600, 3600) * fator),
      },
      {
        id: `inv-google-${base.getFullYear()}-${base.getMonth() + 1}`,
        origem: "google-ads",
        ano: base.getFullYear(),
        mes: base.getMonth() + 1,
        valor: Math.round(inteiro(1200, 1800) * fator),
      }
    );
  }

  // ---- Integrações
  const integracoes: Integracao[] = [
    {
      id: "int-whatsapp",
      chave: "whatsapp",
      nome: "WhatsApp",
      descricao: "Recebe as conversas e envia mensagem direto do CRM.",
      status: "conectado",
      conectadaEm: diasAtras(45),
      ultimaSincronizacao: diasAtras(0),
      leadsRecebidos: 38,
      configuracao: { numero: "(51) 99533-6879", instancia: "fg-principal" },
    },
    {
      id: "int-meta",
      chave: "meta-lead-ads",
      nome: "Formulários do Facebook e Instagram",
      descricao: "Cada lead do formulário cai direto no funil, sem planilha.",
      status: "conectado",
      conectadaEm: diasAtras(45),
      ultimaSincronizacao: diasAtras(0),
      leadsRecebidos: 84,
      configuracao: { conta: "FG Representações", formulario: "Consórcio — Imóveis" },
    },
    {
      id: "int-google",
      chave: "google-ads",
      nome: "Google Ads",
      descricao: "Traz o custo das campanhas para calcular o custo por lead.",
      status: "desconectado",
      leadsRecebidos: 0,
      configuracao: {},
    },
    {
      id: "int-site",
      chave: "site-fg",
      nome: "Formulário do site FG",
      descricao: "As simulações pedidas no site viram leads aqui.",
      status: "conectado",
      conectadaEm: diasAtras(60),
      ultimaSincronizacao: diasAtras(1),
      leadsRecebidos: 11,
      configuracao: { site: "fgrepresentacoes.com.br" },
    },
    {
      id: "int-planilha",
      chave: "planilha",
      nome: "Planilha / CSV",
      descricao: "Importa a base antiga que hoje mora no Excel.",
      status: "desconectado",
      leadsRecebidos: 0,
      configuracao: {},
    },
    {
      id: "int-webhook",
      chave: "webhook",
      nome: "Webhook",
      descricao: "Conecta qualquer outra ferramenta que envie leads.",
      status: "desconectado",
      leadsRecebidos: 0,
      configuracao: {},
    },
  ];

  return {
    versao: VERSAO_BASE,
    geradaEm: new Date().toISOString(),
    leads,
    consultores,
    vendas,
    interacoes,
    tarefas,
    simulacoes: [],
    integracoes,
    metas,
    investimentos,
    config: {
      nomeEmpresa: "FG Representações",
      senhaPainel: SENHA_PADRAO,
      diasParaEsfriar: 4,
      metaEquipeMensal: consultores.reduce((s, c) => s + c.metaMensal, 0),
      distribuicaoAutomatica: true,
      proximoDaFila: 0,
      modoDemo: true,
      administradoras: [...ADMINISTRADORAS],
      padroesPorModalidade: { ...PADROES_MODALIDADE },
    },
  };
}

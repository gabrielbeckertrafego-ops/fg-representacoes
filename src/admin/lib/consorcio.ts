import type { TipoLance } from "../data/tipos";

// Matemática do consórcio.
//
// ATENÇÃO: as taxas padrão (em data/constantes.ts) são plausíveis mas
// ILUSTRATIVAS. Antes de apresentar, calibrar com uma proposta real de cada
// administradora — a Priscila trabalha com isso há 15 anos e uma parcela
// visivelmente errada custa mais credibilidade do que o painel inteiro ganha.

export interface EntradaSimulacao {
  valorCredito: number;
  prazoMeses: number;
  /** % total sobre o crédito (ex.: 22 = 22%). */
  taxaAdministracao: number;
  /** % sobre o crédito. */
  fundoReserva: number;
  /** % ao mês sobre o crédito. */
  seguroMensal: number;
  tipoLance: TipoLance;
  /** % do crédito ofertado como lance. */
  percentualLance: number;
  /** Só vale para lance livre/fixo. */
  efeitoLance?: "prazo" | "parcela";
}

export interface ResultadoSimulacao {
  totalPlano: number;
  parcelaSemSeguro: number;
  seguroMes: number;
  parcela: number;
  /** Quanto a parcela representa do crédito, por mês. */
  percentualMensal: number;
  valorLance: number;
  /** O que o cliente efetivamente recebe (o embutido sai da própria carta). */
  creditoLiquido: number;
  prazoFinal: number;
  parcelaAposLance: number;
  composicao: { rotulo: string; valor: number; cor: string }[];
}

const CORES_COMPOSICAO = {
  fundo: "#C9A24B",
  taxa: "#5EA9E8",
  reserva: "#B48EE0",
  seguro: "#3FBF7F",
};

export function simular(e: EntradaSimulacao): ResultadoSimulacao {
  const credito = Math.max(0, e.valorCredito);
  const prazo = Math.max(1, Math.round(e.prazoMeses));
  const taxa = Math.max(0, e.taxaAdministracao) / 100;
  const reserva = Math.max(0, e.fundoReserva) / 100;
  const seguro = Math.max(0, e.seguroMensal) / 100;

  const totalPlano = credito * (1 + taxa + reserva);
  const parcelaSemSeguro = totalPlano / prazo;
  const seguroMes = credito * seguro;
  const parcela = parcelaSemSeguro + seguroMes;

  const percentualLance = Math.min(100, Math.max(0, e.percentualLance));
  const valorLance = e.tipoLance === "nenhum" ? 0 : credito * (percentualLance / 100);

  // Embutido sai da própria carta: reduz o que o cliente recebe e NÃO mexe na
  // parcela, porque o plano continua sendo sobre o crédito cheio.
  const creditoLiquido = e.tipoLance === "embutido" ? credito - valorLance : credito;

  let prazoFinal = prazo;
  let parcelaAposLance = parcela;

  if ((e.tipoLance === "livre" || e.tipoLance === "fixo") && valorLance > 0) {
    if (e.efeitoLance === "parcela") {
      parcelaAposLance = Math.max(0, (totalPlano - valorLance) / prazo + seguroMes);
    } else {
      const mesesQuitados = Math.floor(valorLance / parcelaSemSeguro);
      prazoFinal = Math.max(1, prazo - mesesQuitados);
    }
  }

  return {
    totalPlano,
    parcelaSemSeguro,
    seguroMes,
    parcela,
    percentualMensal: credito ? (parcelaSemSeguro / credito) * 100 : 0,
    valorLance,
    creditoLiquido,
    prazoFinal,
    parcelaAposLance,
    composicao: [
      { rotulo: "Crédito", valor: credito / prazo, cor: CORES_COMPOSICAO.fundo },
      { rotulo: "Taxa de administração", valor: (credito * taxa) / prazo, cor: CORES_COMPOSICAO.taxa },
      { rotulo: "Fundo de reserva", valor: (credito * reserva) / prazo, cor: CORES_COMPOSICAO.reserva },
      { rotulo: "Seguro", valor: seguroMes, cor: CORES_COMPOSICAO.seguro },
    ],
  };
}

/** Parcela de um financiamento equivalente (Tabela Price) — só para comparação. */
export function parcelaFinanciamento(
  valor: number,
  prazoMeses: number,
  taxaMensalPercentual: number
): number {
  const i = taxaMensalPercentual / 100;
  const n = Math.max(1, prazoMeses);
  if (valor <= 0) return 0;
  if (i === 0) return valor / n;
  return (valor * i) / (1 - Math.pow(1 + i, -n));
}

export function jurosTotaisFinanciamento(
  valor: number,
  prazoMeses: number,
  taxaMensalPercentual: number
): number {
  return parcelaFinanciamento(valor, prazoMeses, taxaMensalPercentual) * prazoMeses - valor;
}

/** Teto usual do lance embutido nas administradoras. */
export const LIMITE_LANCE_EMBUTIDO = 30;

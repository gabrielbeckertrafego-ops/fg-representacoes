// Formatação centralizada. Nenhum componente deve formatar data ou dinheiro na mão.
//
// Armadilha de fuso que motiva este arquivo: new Date("2026-08-12") é lido como
// UTC e, em Brasília, vira 11/08 às 21h — a data aparece um dia atrasada. Por isso
// gravamos sempre ISO completo (com hora) e, quando for preciso montar data a
// partir de partes, usamos new Date(ano, mes - 1, dia).

const MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const MOEDA_CURTA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function moeda(valor: number): string {
  if (!Number.isFinite(valor)) return "R$ 0,00";
  return MOEDA.format(valor);
}

export function moedaCurta(valor: number): string {
  if (!Number.isFinite(valor)) return "R$ 0";
  return MOEDA_CURTA.format(valor);
}

/** R$ 2,4 mi / R$ 340 mil / R$ 900 — para caber em card e cabeçalho de coluna. */
export function moedaCompacta(valor: number): string {
  if (!Number.isFinite(valor) || valor === 0) return "R$ 0";
  const abs = Math.abs(valor);
  if (abs >= 1_000_000) {
    const n = valor / 1_000_000;
    return `R$ ${n.toFixed(n >= 10 ? 0 : 1).replace(".", ",")} mi`;
  }
  if (abs >= 1_000) return `R$ ${Math.round(valor / 1_000)} mil`;
  return `R$ ${Math.round(valor)}`;
}

export function numero(valor: number, casas = 0): string {
  if (!Number.isFinite(valor)) return "0";
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function percentual(valor: number, casas = 1): string {
  if (!Number.isFinite(valor)) return "0%";
  return `${valor.toFixed(casas).replace(".", ",")}%`;
}

export function data(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function dataCurta(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
}

export function dataHora(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${data(iso)} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

/** Diferença em dias inteiros entre a data e hoje (positivo = passado). */
export function diasDesde(iso?: string): number {
  if (!iso) return 0;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0;
  const umDia = 86_400_000;
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const hoje = new Date();
  const b = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
  return Math.round((b - a) / umDia);
}

/** "hoje", "ontem", "há 3 dias", "em 2 dias" — para timeline e follow-up. */
export function relativo(iso?: string): string {
  if (!iso) return "—";
  const dias = diasDesde(iso);
  if (dias === 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias === -1) return "amanhã";
  if (dias > 1) return `há ${dias} dias`;
  return `em ${Math.abs(dias)} dias`;
}

export function mesAno(ano: number, mes: number): string {
  return new Date(ano, mes - 1, 1)
    .toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
    .replace(".", "");
}

/** (51) 99999-8888 a partir de "5551999998888". */
export function telefone(numeroTelefone: string): string {
  const so = numeroTelefone.replace(/\D/g, "");
  const semDdi = so.startsWith("55") ? so.slice(2) : so;
  if (semDdi.length === 11) return `(${semDdi.slice(0, 2)}) ${semDdi.slice(2, 7)}-${semDdi.slice(7)}`;
  if (semDdi.length === 10) return `(${semDdi.slice(0, 2)}) ${semDdi.slice(2, 6)}-${semDdi.slice(6)}`;
  return numeroTelefone;
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0];
}

/** Chave "2026-08" para agrupar por mês sem esbarrar em fuso. */
export function chaveMes(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

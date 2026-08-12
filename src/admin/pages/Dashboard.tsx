import CabecalhoPagina from "../components/CabecalhoPagina";
import { repositorio } from "../data/repositorio";
import { useDados } from "../data/useDados";
import { moedaCompacta } from "../lib/formato";
import type { BaseDados } from "../data/tipos";

// Versão de verificação da etapa 3: prova que o seed carregou e que o painel lê
// do repositório. O dashboard de verdade (KPIs e gráficos) entra na etapa 5.
export default function Dashboard() {
  const { dados, carregando } = useDados<BaseDados | null>(
    "base",
    () => repositorio.obterBase(),
    null
  );

  if (carregando || !dados) {
    return (
      <>
        <CabecalhoPagina titulo="Painel" subtitulo="Visão geral do mês" />
        <div className="card-painel h-32 animate-pulse" />
      </>
    );
  }

  const creditoVendido = dados.vendas.reduce((s, v) => s + v.valorCredito, 0);
  const contagens = [
    { rotulo: "Leads", valor: String(dados.leads.length) },
    { rotulo: "Consultores", valor: String(dados.consultores.length) },
    { rotulo: "Vendas", valor: String(dados.vendas.length) },
    { rotulo: "Interações", valor: String(dados.interacoes.length) },
    { rotulo: "Tarefas", valor: String(dados.tarefas.length) },
    { rotulo: "Crédito vendido", valor: moedaCompacta(creditoVendido) },
  ];

  return (
    <>
      <CabecalhoPagina titulo="Painel" subtitulo="Visão geral do mês" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {contagens.map((c) => (
          <div key={c.rotulo} className="card-painel">
            <p className="rotulo-painel">{c.rotulo}</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">{c.valor}</p>
          </div>
        ))}
      </div>
    </>
  );
}

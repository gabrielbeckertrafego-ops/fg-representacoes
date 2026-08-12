import { useMemo, useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import Avatar from "../components/Avatar";
import Badge from "../components/Badge";
import ModalPainel from "../components/ModalPainel";
import { NOME_MODALIDADE, NOME_SITUACAO } from "../data/constantes";
import { repositorio } from "../data/repositorio";
import { useDados } from "../data/useDados";
import { data, moeda, moedaCompacta, numero, percentual } from "../lib/formato";
import type { BaseDados, SituacaoVenda, Venda } from "../data/tipos";

const COR_SITUACAO: Record<SituacaoVenda, string> = {
  ativa: "#5EA9E8",
  contemplada: "#3FBF7F",
  inadimplente: "#E06A5A",
  cancelada: "#71717A",
  quitada: "#C9A24B",
};

type Aba = "todas" | "posvenda";

export default function Vendas() {
  const { dados: base } = useDados<BaseDados | null>("vendas-base", () => repositorio.obterBase(), null);
  const [aba, setAba] = useState<Aba>("todas");
  const [filtroConsultor, setFiltroConsultor] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState<SituacaoVenda | "">("");
  const [detalhe, setDetalhe] = useState<Venda | null>(null);

  const lista = useMemo(() => {
    if (!base) return [];
    return base.vendas
      .filter((v) => !filtroConsultor || v.consultorId === filtroConsultor)
      .filter((v) => !filtroSituacao || v.situacao === filtroSituacao)
      .filter((v) => (aba === "posvenda" ? v.situacao !== "cancelada" : true))
      .sort((a, b) => (a.dataAdesao < b.dataAdesao ? 1 : -1));
  }, [base, filtroConsultor, filtroSituacao, aba]);

  if (!base) return <div className="card-painel h-64 animate-pulse" />;

  const consultorDe = (id: string) => base.consultores.find((c) => c.id === id) ?? null;
  const totalCredito = lista.reduce((s, v) => s + v.valorCredito, 0);
  const totalComissao = lista.reduce((s, v) => s + v.comissaoValor, 0);
  const recebido = lista.reduce((s, v) => s + v.comissaoRecebida, 0);
  const contempladas = base.vendas.filter((v) => v.situacao === "contemplada");
  const inadimplentes = base.vendas.filter((v) => v.situacao === "inadimplente");

  return (
    <>
      <CabecalhoPagina
        titulo="Vendas"
        subtitulo="Adesões fechadas, comissão e acompanhamento das cotas"
        acoes={
          <>
            <select
              value={filtroConsultor}
              onChange={(e) => setFiltroConsultor(e.target.value)}
              className="field-sm w-auto"
              aria-label="Filtrar por consultor"
            >
              <option value="">Todo o time</option>
              {base.consultores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <select
              value={filtroSituacao}
              onChange={(e) => setFiltroSituacao(e.target.value as SituacaoVenda | "")}
              className="field-sm w-auto"
              aria-label="Filtrar por situação"
            >
              <option value="">Todas as situações</option>
              {Object.entries(NOME_SITUACAO).map(([chave, nome]) => (
                <option key={chave} value={chave}>
                  {nome}
                </option>
              ))}
            </select>
          </>
        }
      />

      <div className="mb-4 flex gap-2">
        {(
          [
            ["todas", "Todas as adesões"],
            ["posvenda", "Pós-venda"],
          ] as [Aba, string][]
        ).map(([chave, rotulo]) => (
          <button
            key={chave}
            onClick={() => setAba(chave)}
            className={`btn-sm ${
              aba === chave
                ? "bg-white/[0.08] text-white"
                : "text-graphite-400 hover:text-white"
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {aba === "posvenda" ? (
        <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="card-painel">
            <p className="rotulo-painel">Cotas ativas</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">
              {numero(base.vendas.filter((v) => v.situacao === "ativa").length)}
            </p>
          </div>
          <div className="card-painel">
            <p className="rotulo-painel">Contempladas</p>
            <p className="mt-1 font-display text-2xl font-bold text-emerald-400">
              {numero(contempladas.length)}
            </p>
            <p className="text-[11px] text-graphite-500">
              {contempladas.filter((v) => v.formaContemplacao === "lance").length} por lance
            </p>
          </div>
          <div className="card-painel">
            <p className="rotulo-painel">Inadimplentes</p>
            <p className="mt-1 font-display text-2xl font-bold text-red-400">
              {numero(inadimplentes.length)}
            </p>
            <p className="text-[11px] text-graphite-500">precisam de contato</p>
          </div>
          <div className="card-painel">
            <p className="rotulo-painel">Carteira total</p>
            <p className="mt-1 font-display text-2xl font-bold text-gold-gradient">
              {moedaCompacta(base.vendas.reduce((s, v) => s + v.valorCredito, 0))}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="card-painel">
            <p className="rotulo-painel">Adesões</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">{numero(lista.length)}</p>
          </div>
          <div className="card-painel">
            <p className="rotulo-painel">Crédito vendido</p>
            <p className="mt-1 font-display text-2xl font-bold text-gold-gradient">
              {moedaCompacta(totalCredito)}
            </p>
          </div>
          <div className="card-painel">
            <p className="rotulo-painel">Comissão gerada</p>
            <p className="mt-1 font-display text-2xl font-bold text-emerald-400">
              {moedaCompacta(totalComissao)}
            </p>
          </div>
          <div className="card-painel">
            <p className="rotulo-painel">Já recebido</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">
              {moedaCompacta(recebido)}
            </p>
            <p className="text-[11px] text-graphite-500">
              {percentual(totalComissao ? (recebido / totalComissao) * 100 : 0, 0)} da comissão
            </p>
          </div>
        </div>
      )}

      <div className="card-painel overflow-x-auto p-0">
        <table className="w-full min-w-[54rem] text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-left">
              {["Cliente", "Consultor", "Carta", "Parcela", "Administradora", "Adesão", "Situação"].map(
                (h) => (
                  <th key={h} className="rotulo-painel px-4 py-3 font-semibold">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {lista.map((v) => (
              <tr
                key={v.id}
                onClick={() => setDetalhe(v)}
                className="linha-tabela cursor-pointer"
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{v.clienteNome}</p>
                  <p className="text-[11px] text-graphite-500">
                    {NOME_MODALIDADE[v.modalidade]} · grupo {v.grupo}/{v.cota}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <Avatar consultor={consultorDe(v.consultorId)} />
                    <span className="hidden text-graphite-300 sm:inline">
                      {consultorDe(v.consultorId)?.nome.split(" ")[0]}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-gold-400">
                  {moedaCompacta(v.valorCredito)}
                </td>
                <td className="px-4 py-3 text-graphite-300">{moeda(v.parcela)}</td>
                <td className="px-4 py-3 text-graphite-300">{v.administradora}</td>
                <td className="px-4 py-3 text-graphite-400">{data(v.dataAdesao)}</td>
                <td className="px-4 py-3">
                  <Badge cor={COR_SITUACAO[v.situacao]}>{NOME_SITUACAO[v.situacao]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && (
          <p className="py-12 text-center text-sm text-graphite-500">
            Nenhuma adesão com esses filtros.
          </p>
        )}
      </div>

      <ModalPainel
        titulo={detalhe?.clienteNome ?? ""}
        subtitulo={
          detalhe
            ? `${NOME_MODALIDADE[detalhe.modalidade]} · ${detalhe.administradora}`
            : undefined
        }
        aberto={!!detalhe}
        onFechar={() => setDetalhe(null)}
      >
        {detalhe && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Carta de crédito", moeda(detalhe.valorCredito)],
                ["Parcela", moeda(detalhe.parcela)],
                ["Prazo", `${detalhe.prazoMeses} meses`],
                ["Pagas", `${detalhe.parcelasPagas} parcelas`],
                ["Grupo / cota", `${detalhe.grupo} / ${detalhe.cota}`],
                ["Taxa de administração", percentual(detalhe.taxaAdministracao)],
              ].map(([rotulo, valor]) => (
                <div key={rotulo} className="rounded-xl border border-white/[0.07] px-3 py-2">
                  <p className="rotulo-painel">{rotulo}</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{valor}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/[0.07] p-4">
              <p className="rotulo-painel">Comissão</p>
              <p className="mt-1 font-display text-2xl font-bold text-emerald-400">
                {moeda(detalhe.comissaoValor)}
              </p>
              <p className="text-xs text-graphite-500">
                {percentual(detalhe.comissaoPercentual)} da carta, em{" "}
                {detalhe.comissaoParcelas} parcelas
              </p>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (detalhe.comissaoRecebida / detalhe.comissaoValor) * 100
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 flex justify-between text-xs">
                <span className="text-graphite-400">
                  Recebido {moeda(detalhe.comissaoRecebida)}
                </span>
                <span className="text-graphite-500">
                  Falta {moeda(detalhe.comissaoValor - detalhe.comissaoRecebida)}
                </span>
              </p>
            </div>

            {detalhe.contempladaEm && (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-3">
                <p className="text-sm text-emerald-300">
                  Contemplada em {data(detalhe.contempladaEm)} por{" "}
                  {detalhe.formaContemplacao === "lance" ? "lance" : "sorteio"}.
                </p>
              </div>
            )}

            <div>
              <label className="field-label" htmlFor="venda-situacao">
                Situação da cota
              </label>
              <select
                id="venda-situacao"
                value={detalhe.situacao}
                onChange={async (e) => {
                  const atualizada = {
                    ...detalhe,
                    situacao: e.target.value as SituacaoVenda,
                  };
                  await repositorio.salvarVenda(atualizada);
                  setDetalhe(atualizada);
                }}
                className="field-sm"
              >
                {Object.entries(NOME_SITUACAO).map(([chave, nome]) => (
                  <option key={chave} value={chave}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </ModalPainel>
    </>
  );
}

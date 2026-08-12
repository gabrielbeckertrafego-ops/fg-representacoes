import { useMemo, useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import Avatar from "../components/Avatar";
import Badge from "../components/Badge";
import Elo from "../components/Elo";
import ModalPainel from "../components/ModalPainel";
import CampoMoeda from "../components/CampoMoeda";
import {
  COR_ETAPA,
  COR_ORIGEM,
  ETAPAS,
  MODALIDADES,
  NOME_ETAPA,
  NOME_MODALIDADE,
  NOME_ORIGEM,
  ORIGENS,
} from "../data/constantes";
import { repositorio } from "../data/repositorio";
import { useDados } from "../data/useDados";
import { data, diasDesde, moedaCompacta, numero, telefone } from "../lib/formato";
import type { BaseDados, EtapaFunil, Modalidade, Origem } from "../data/tipos";

interface Props {
  busca: string;
}

export default function Leads({ busca }: Props) {
  const { dados: base } = useDados<BaseDados | null>("leads-base", () => repositorio.obterBase(), null);
  const [etapa, setEtapa] = useState<EtapaFunil | "">("");
  const [origem, setOrigem] = useState<Origem | "">("");
  const [consultorId, setConsultorId] = useState("");
  const [novo, setNovo] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    modalidade: "imoveis" as Modalidade,
    valor: 200_000,
    origem: "manual" as Origem,
    consultorId: "",
  });

  const lista = useMemo(() => {
    if (!base) return [];
    const termo = busca.trim().toLowerCase();
    const digitos = termo.replace(/\D/g, "");
    return base.leads
      .filter((l) => !etapa || l.etapa === etapa)
      .filter((l) => !origem || l.origem === origem)
      .filter((l) => !consultorId || l.consultorId === consultorId)
      .filter(
        (l) =>
          !termo ||
          l.nome.toLowerCase().includes(termo) ||
          (digitos.length >= 3 && l.telefone.includes(digitos))
      )
      .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
  }, [base, busca, etapa, origem, consultorId]);

  if (!base) return <div className="card-painel h-64 animate-pulse" />;

  function baixarCsv() {
    const cabecalho = [
      "Nome",
      "Telefone",
      "Cidade",
      "Modalidade",
      "Crédito",
      "Etapa",
      "Origem",
      "Campanha",
      "Consultor",
      "Entrou em",
    ];
    const linhas = lista.map((l) => [
      l.nome,
      telefone(l.telefone),
      `${l.cidade ?? ""}${l.uf ? `/${l.uf}` : ""}`,
      NOME_MODALIDADE[l.modalidade],
      String(l.valorCreditoDesejado),
      NOME_ETAPA[l.etapa],
      NOME_ORIGEM[l.origem],
      l.campanha ?? "",
      base!.consultores.find((c) => c.id === l.consultorId)?.nome ?? "",
      data(l.criadoEm),
    ]);
    const csv = [cabecalho, ...linhas]
      .map((linha) => linha.map((celula) => `"${String(celula).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-fg-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function criar() {
    await repositorio.criarLead({
      nome: form.nome.trim() || "Sem nome",
      telefone: `55${form.telefone.replace(/\D/g, "")}`,
      modalidade: form.modalidade,
      valorCreditoDesejado: form.valor,
      etapa: "novo",
      origem: form.origem,
      consultorId: form.consultorId || null,
      temperatura: "morno",
      etiquetas: [],
    });
    setNovo(false);
    setForm({ ...form, nome: "", telefone: "" });
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Leads"
        subtitulo={`${numero(lista.length)} de ${numero(base.leads.length)} contatos`}
        acoes={
          <>
            <button onClick={baixarCsv} className="btn-sm-ghost">
              Baixar planilha
            </button>
            <button onClick={() => setNovo(true)} className="btn-sm-gold">
              Novo lead
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={etapa}
          onChange={(e) => setEtapa(e.target.value as EtapaFunil | "")}
          className="field-sm w-auto"
          aria-label="Filtrar por etapa"
        >
          <option value="">Todas as etapas</option>
          {ETAPAS.map((e) => (
            <option key={e.chave} value={e.chave}>
              {e.nome}
            </option>
          ))}
        </select>
        <select
          value={origem}
          onChange={(e) => setOrigem(e.target.value as Origem | "")}
          className="field-sm w-auto"
          aria-label="Filtrar por origem"
        >
          <option value="">Todas as origens</option>
          {ORIGENS.map((o) => (
            <option key={o.chave} value={o.chave}>
              {o.nome}
            </option>
          ))}
        </select>
        <select
          value={consultorId}
          onChange={(e) => setConsultorId(e.target.value)}
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
      </div>

      <div className="card-painel overflow-x-auto p-0">
        <table className="w-full min-w-[56rem] text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-left">
              {["Nome", "Telefone", "Carta", "Etapa", "Origem", "Consultor", "Sem contato"].map(
                (h) => (
                  <th key={h} className="rotulo-painel px-4 py-3 font-semibold">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {lista.slice(0, 150).map((l) => {
              const parado = diasDesde(l.ultimoContatoEm ?? l.criadoEm);
              return (
                <tr key={l.id} className="linha-tabela">
                  <td className="px-4 py-2.5">
                    <Elo
                      para={`/admin/leads/${l.id}`}
                      className="font-semibold text-white hover:text-gold-300"
                    >
                      {l.nome}
                    </Elo>
                    <p className="text-[11px] text-graphite-600">
                      {NOME_MODALIDADE[l.modalidade]}
                      {l.cidade ? ` · ${l.cidade}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 text-graphite-300">{telefone(l.telefone)}</td>
                  <td className="px-4 py-2.5 font-semibold text-gold-400">
                    {moedaCompacta(l.valorCreditoDesejado)}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge cor={COR_ETAPA[l.etapa]}>{NOME_ETAPA[l.etapa]}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge cor={COR_ORIGEM[l.origem]}>{NOME_ORIGEM[l.origem]}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Avatar
                      consultor={base.consultores.find((c) => c.id === l.consultorId) ?? null}
                    />
                  </td>
                  <td
                    className={`px-4 py-2.5 ${
                      parado > base.config.diasParaEsfriar ? "text-red-400" : "text-graphite-400"
                    }`}
                  >
                    {parado === 0 ? "hoje" : `${parado}d`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {lista.length === 0 && (
          <p className="py-12 text-center text-sm text-graphite-500">
            Nenhum lead com esses filtros.
          </p>
        )}
        {lista.length > 150 && (
          <p className="border-t border-white/[0.06] py-3 text-center text-xs text-graphite-600">
            Mostrando os 150 mais recentes. Use os filtros ou baixe a planilha para ver
            todos.
          </p>
        )}
      </div>

      <ModalPainel titulo="Novo lead" aberto={novo} onFechar={() => setNovo(false)}>
        <div className="space-y-3">
          <div>
            <label className="field-label" htmlFor="nl-nome">
              Nome
            </label>
            <input
              id="nl-nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="field-sm"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="nl-tel">
                WhatsApp
              </label>
              <input
                id="nl-tel"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="(51) 99999-9999"
                className="field-sm"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="nl-valor">
                Crédito pretendido
              </label>
              <CampoMoeda
                id="nl-valor"
                valor={form.valor}
                onChange={(v) => setForm({ ...form, valor: v })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="nl-mod">
                Modalidade
              </label>
              <select
                id="nl-mod"
                value={form.modalidade}
                onChange={(e) => setForm({ ...form, modalidade: e.target.value as Modalidade })}
                className="field-sm"
              >
                {MODALIDADES.map((m) => (
                  <option key={m.chave} value={m.chave}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="nl-origem">
                Como chegou
              </label>
              <select
                id="nl-origem"
                value={form.origem}
                onChange={(e) => setForm({ ...form, origem: e.target.value as Origem })}
                className="field-sm"
              >
                {ORIGENS.map((o) => (
                  <option key={o.chave} value={o.chave}>
                    {o.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="nl-consultor">
              Quem vai atender
            </label>
            <select
              id="nl-consultor"
              value={form.consultorId}
              onChange={(e) => setForm({ ...form, consultorId: e.target.value })}
              className="field-sm"
            >
              <option value="">Decidir depois</option>
              {base.consultores
                .filter((c) => c.ativo)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
            </select>
          </div>
          <button onClick={() => void criar()} className="btn-sm-gold mt-2 w-full">
            Cadastrar lead
          </button>
        </div>
      </ModalPainel>
    </>
  );
}

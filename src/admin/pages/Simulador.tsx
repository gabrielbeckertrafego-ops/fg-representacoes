import { useMemo, useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import CampoMoeda from "../components/CampoMoeda";
import ModalPainel from "../components/ModalPainel";
import { CopiarIcon } from "../components/IconesAdmin";
import { WhatsAppIcon } from "../../components/Icons";
import {
  MODALIDADES,
  NOME_MODALIDADE,
  TAXA_FINANCIAMENTO_MES,
} from "../data/constantes";
import { repositorio } from "../data/repositorio";
import { useDados } from "../data/useDados";
import {
  LIMITE_LANCE_EMBUTIDO,
  jurosTotaisFinanciamento,
  parcelaFinanciamento,
  simular,
} from "../lib/consorcio";
import { mensagemSimulacao } from "../lib/mensagens";
import { moeda, moedaCompacta, numero, percentual } from "../lib/formato";
import type { Configuracao, Lead, Modalidade, TipoLance } from "../data/tipos";

interface Props {
  leadIdInicial?: string;
}

export default function Simulador({ leadIdInicial }: Props) {
  const { dados: config } = useDados<Configuracao | null>(
    "sim-config",
    () => repositorio.obterConfig(),
    null
  );
  const { dados: leads } = useDados<Lead[]>("sim-leads", () => repositorio.listarLeads(), []);

  const [modalidade, setModalidade] = useState<Modalidade>("imoveis");
  const [administradora, setAdministradora] = useState("Embracon");
  const [credito, setCredito] = useState(250_000);
  const [prazo, setPrazo] = useState(200);
  const [tipoLance, setTipoLance] = useState<TipoLance>("nenhum");
  const [percentualLance, setPercentualLance] = useState(25);
  const [efeitoLance, setEfeitoLance] = useState<"prazo" | "parcela">("prazo");
  const [avancado, setAvancado] = useState(false);
  const [taxaAdm, setTaxaAdm] = useState<number | null>(null);
  const [fundoReserva, setFundoReserva] = useState<number | null>(null);
  const [seguro, setSeguro] = useState<number | null>(null);
  const [leadId, setLeadId] = useState(leadIdInicial ?? "");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const padrao = config?.padroesPorModalidade[modalidade];

  const entrada = {
    valorCredito: credito,
    prazoMeses: prazo,
    taxaAdministracao: taxaAdm ?? padrao?.taxaAdministracao ?? 22,
    fundoReserva: fundoReserva ?? padrao?.fundoReserva ?? 2,
    seguroMensal: seguro ?? padrao?.seguroMensal ?? 0.035,
    tipoLance,
    percentualLance,
    efeitoLance,
  };

  const r = useMemo(() => simular(entrada), [
    credito,
    prazo,
    entrada.taxaAdministracao,
    entrada.fundoReserva,
    entrada.seguroMensal,
    tipoLance,
    percentualLance,
    efeitoLance,
  ]);

  const parcelaFin = parcelaFinanciamento(credito, prazo, TAXA_FINANCIAMENTO_MES);
  const jurosFin = jurosTotaisFinanciamento(credito, prazo, TAXA_FINANCIAMENTO_MES);
  const leadEscolhido = leads.find((l) => l.id === leadId);
  const embutidoAcimaDoLimite =
    tipoLance === "embutido" && percentualLance > LIMITE_LANCE_EMBUTIDO;

  function trocarModalidade(nova: Modalidade) {
    setModalidade(nova);
    setTaxaAdm(null);
    setFundoReserva(null);
    setSeguro(null);
    const prazos = config?.padroesPorModalidade[nova]?.prazos;
    if (prazos?.length) setPrazo(prazos[prazos.length - 1]);
  }

  function montarSimulacao() {
    return {
      id: "",
      leadId: leadId || null,
      consultorId: leadEscolhido?.consultorId ?? null,
      modalidade,
      administradora,
      valorCredito: credito,
      prazoMeses: prazo,
      taxaAdministracao: entrada.taxaAdministracao,
      fundoReserva: entrada.fundoReserva,
      seguroMensal: entrada.seguroMensal,
      tipoLance,
      percentualLance: tipoLance === "nenhum" ? 0 : percentualLance,
      parcela: r.parcelaAposLance,
      parcelaSemSeguro: r.parcelaSemSeguro,
      totalPlano: r.totalPlano,
      valorLance: r.valorLance,
      creditoLiquido: r.creditoLiquido,
      criadoEm: new Date().toISOString(),
    };
  }

  const prazos = padrao?.prazos ?? [60, 120, 180, 200];

  return (
    <>
      <CabecalhoPagina
        titulo="Simulador"
        subtitulo="Monte a proposta e mande pronta para o cliente"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* Entrada */}
        <div className="card-painel space-y-4">
          <div>
            <label className="field-label" htmlFor="sim-modalidade">
              O que o cliente quer
            </label>
            <select
              id="sim-modalidade"
              value={modalidade}
              onChange={(e) => trocarModalidade(e.target.value as Modalidade)}
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
            <label className="field-label" htmlFor="sim-adm">
              Administradora
            </label>
            <select
              id="sim-adm"
              value={administradora}
              onChange={(e) => setAdministradora(e.target.value)}
              className="field-sm"
            >
              {(config?.administradoras ?? []).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="sim-credito">
              Valor da carta
            </label>
            <CampoMoeda id="sim-credito" valor={credito} onChange={setCredito} />
            <input
              type="range"
              min={20_000}
              max={1_200_000}
              step={5_000}
              value={credito}
              onChange={(e) => setCredito(Number(e.target.value))}
              className="mt-2 w-full accent-gold-500"
              aria-label="Ajustar valor da carta"
            />
          </div>

          <div>
            <span className="field-label">Prazo</span>
            <div className="flex flex-wrap gap-2">
              {prazos.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrazo(p)}
                  className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors ${
                    prazo === p
                      ? "border-gold-500 bg-gold-500/15 text-gold-300"
                      : "border-white/10 text-graphite-400 hover:text-white"
                  }`}
                >
                  {p}x
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="field-label">Lance</span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["nenhum", "Sem lance"],
                  ["livre", "Lance livre"],
                  ["fixo", "Lance fixo"],
                  ["embutido", "Lance embutido"],
                ] as [TipoLance, string][]
              ).map(([chave, rotulo]) => (
                <button
                  key={chave}
                  onClick={() => setTipoLance(chave)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    tipoLance === chave
                      ? "border-gold-500 bg-gold-500/15 text-gold-300"
                      : "border-white/10 text-graphite-400 hover:text-white"
                  }`}
                >
                  {rotulo}
                </button>
              ))}
            </div>

            {tipoLance !== "nenhum" && (
              <div className="mt-3">
                <div className="flex items-baseline justify-between">
                  <label className="field-label mb-0" htmlFor="sim-lance">
                    Percentual ofertado
                  </label>
                  <span className="text-sm font-bold text-gold-400">{percentualLance}%</span>
                </div>
                <input
                  id="sim-lance"
                  type="range"
                  min={5}
                  max={60}
                  step={1}
                  value={percentualLance}
                  onChange={(e) => setPercentualLance(Number(e.target.value))}
                  className="mt-1 w-full accent-gold-500"
                />
                {embutidoAcimaDoLimite && (
                  <p className="mt-1 text-xs text-amber-400">
                    A maioria das administradoras aceita no máximo{" "}
                    {LIMITE_LANCE_EMBUTIDO}% embutido. Confirme antes de enviar.
                  </p>
                )}

                {(tipoLance === "livre" || tipoLance === "fixo") && (
                  <div className="mt-3 flex gap-2">
                    {(
                      [
                        ["prazo", "Reduzir prazo"],
                        ["parcela", "Reduzir parcela"],
                      ] as ["prazo" | "parcela", string][]
                    ).map(([chave, rotulo]) => (
                      <button
                        key={chave}
                        onClick={() => setEfeitoLance(chave)}
                        className={`flex-1 rounded-xl border px-2 py-1.5 text-xs font-semibold transition-colors ${
                          efeitoLance === chave
                            ? "border-gold-500 bg-gold-500/15 text-gold-300"
                            : "border-white/10 text-graphite-400 hover:text-white"
                        }`}
                      >
                        {rotulo}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setAvancado(!avancado)}
            className="text-xs font-semibold text-graphite-400 hover:text-gold-400"
          >
            {avancado ? "− Esconder taxas" : "+ Ajustar taxas desta proposta"}
          </button>

          {avancado && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="field-label text-[11px]" htmlFor="sim-taxa">
                  Taxa adm. %
                </label>
                <input
                  id="sim-taxa"
                  type="number"
                  step="0.5"
                  value={entrada.taxaAdministracao}
                  onChange={(e) => setTaxaAdm(Number(e.target.value))}
                  className="field-sm"
                />
              </div>
              <div>
                <label className="field-label text-[11px]" htmlFor="sim-fr">
                  Fundo res. %
                </label>
                <input
                  id="sim-fr"
                  type="number"
                  step="0.5"
                  value={entrada.fundoReserva}
                  onChange={(e) => setFundoReserva(Number(e.target.value))}
                  className="field-sm"
                />
              </div>
              <div>
                <label className="field-label text-[11px]" htmlFor="sim-seg">
                  Seguro %/mês
                </label>
                <input
                  id="sim-seg"
                  type="number"
                  step="0.005"
                  value={entrada.seguroMensal}
                  onChange={(e) => setSeguro(Number(e.target.value))}
                  className="field-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Resultado */}
        <div className="space-y-4">
          <div className="card-painel bg-gradient-to-br from-gold-500/[0.07] to-transparent">
            <p className="rotulo-painel">Parcela mensal</p>
            <p className="mt-1 font-display text-4xl font-bold text-gold-gradient sm:text-5xl">
              {moeda(r.parcelaAposLance)}
            </p>
            <p className="mt-1 text-sm text-graphite-400">
              {NOME_MODALIDADE[modalidade]} · {moedaCompacta(credito)} em{" "}
              {numero(r.prazoFinal)} meses · {administradora}
            </p>

            <div className="mt-5">
              <p className="rotulo-painel mb-2">Do que a parcela é feita</p>
              <div className="flex h-3 overflow-hidden rounded-full">
                {r.composicao.map((c) => (
                  <span
                    key={c.rotulo}
                    style={{
                      width: `${(c.valor / r.parcela) * 100}%`,
                      backgroundColor: c.cor,
                    }}
                    title={`${c.rotulo}: ${moeda(c.valor)}`}
                  />
                ))}
              </div>
              <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
                {r.composicao.map((c) => (
                  <li key={c.rotulo} className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: c.cor }}
                    />
                    <span className="truncate text-graphite-500">{c.rotulo}</span>
                    <span className="ml-auto text-graphite-300">{moeda(c.valor)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card-painel">
              <p className="rotulo-painel">Total do plano</p>
              <p className="mt-1 font-display text-xl font-bold text-white">
                {moedaCompacta(r.totalPlano)}
              </p>
              <p className="text-[11px] text-graphite-500">sem juros, taxa diluída</p>
            </div>
            <div className="card-painel">
              <p className="rotulo-painel">Por mês</p>
              <p className="mt-1 font-display text-xl font-bold text-white">
                {percentual(r.percentualMensal, 2)}
              </p>
              <p className="text-[11px] text-graphite-500">do valor do crédito</p>
            </div>
            <div className="card-painel">
              <p className="rotulo-painel">Crédito na mão</p>
              <p className="mt-1 font-display text-xl font-bold text-white">
                {moedaCompacta(r.creditoLiquido)}
              </p>
              <p className="text-[11px] text-graphite-500">
                {tipoLance === "embutido" ? "descontado o lance" : "carta cheia"}
              </p>
            </div>
          </div>

          {tipoLance === "embutido" && r.valorLance > 0 && (
            <div className="card-painel border-gold-500/25 bg-gold-500/[0.06]">
              <p className="text-sm text-graphite-200">
                Com o lance embutido, o cliente oferta{" "}
                <strong className="text-gold-300">{moeda(r.valorLance)}</strong> sem tirar do
                bolso e recebe{" "}
                <strong className="text-gold-300">{moeda(r.creditoLiquido)}</strong> de
                crédito. A parcela continua a mesma.
              </p>
            </div>
          )}

          <div className="card-painel">
            <p className="rotulo-painel">Se fosse financiamento</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <span>
                <span className="font-display text-2xl font-bold text-red-400">
                  {moeda(parcelaFin)}
                </span>{" "}
                <span className="text-xs text-graphite-500">por mês</span>
              </span>
              <span className="text-sm text-graphite-400">
                {moedaCompacta(jurosFin)} só de juros em {prazo} meses
              </span>
            </div>
            <p className="mt-1 text-[11px] text-graphite-600">
              Comparação ilustrativa a {percentual(TAXA_FINANCIAMENTO_MES, 2)} ao mês.
            </p>
          </div>

          <div className="card-painel">
            <label className="field-label" htmlFor="sim-lead">
              Vincular a um lead (opcional)
            </label>
            <select
              id="sim-lead"
              value={leadId}
              onChange={(e) => {
                setLeadId(e.target.value);
                setSalvo(false);
              }}
              className="field-sm"
            >
              <option value="">Não vincular</option>
              {leads
                .filter((l) => l.etapa !== "perdido")
                .slice(0, 80)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome}
                  </option>
                ))}
            </select>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setMensagem(mensagemSimulacao(montarSimulacao(), leadEscolhido?.nome));
                  setCopiado(false);
                }}
                className="btn-sm-gold"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Gerar mensagem
              </button>
              <button
                onClick={async () => {
                  await repositorio.salvarSimulacao(montarSimulacao());
                  setSalvo(true);
                }}
                disabled={!leadId}
                className="btn-sm-ghost disabled:opacity-40"
              >
                {salvo ? "Salva no lead" : "Salvar no lead"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModalPainel
        titulo="Mensagem pronta"
        subtitulo="Copie e cole na conversa do cliente"
        aberto={!!mensagem}
        onFechar={() => setMensagem(null)}
      >
        <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-graphite-800/60 p-4 text-sm text-graphite-200">
          {mensagem}
        </pre>
        <button
          onClick={() => {
            void navigator.clipboard?.writeText(mensagem ?? "");
            setCopiado(true);
          }}
          className="btn-sm-gold mt-3 w-full"
        >
          <CopiarIcon className="h-4 w-4" />
          {copiado ? "Copiado" : "Copiar mensagem"}
        </button>
      </ModalPainel>
    </>
  );
}

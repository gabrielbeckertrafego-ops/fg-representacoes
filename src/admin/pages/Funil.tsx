import { useMemo, useRef, useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import Avatar from "../components/Avatar";
import Badge from "../components/Badge";
import ModalPainel from "../components/ModalPainel";
import Elo from "../components/Elo";
import { AlertaIcon, MoverIcon, RelogioIcon } from "../components/IconesAdmin";
import {
  BuildingIcon,
  CarIcon,
  CashIcon,
  GrowthIcon,
  HomeIcon,
  TruckIcon,
} from "../../components/Icons";
import {
  COR_ORIGEM,
  ETAPAS,
  ETAPAS_ATIVAS,
  MOTIVOS_PERDA,
  NOME_ORIGEM,
} from "../data/constantes";
import { repositorio } from "../data/repositorio";
import { useDados } from "../data/useDados";
import { diasDesde, moedaCompacta } from "../lib/formato";
import type { Consultor, EtapaFunil, Lead, Modalidade } from "../data/tipos";

const ICONE_MODALIDADE: Record<Modalidade, (p: React.SVGProps<SVGSVGElement>) => JSX.Element> = {
  imoveis: HomeIcon,
  automoveis: CarIcon,
  pesados: TruckIcon,
  construcao: BuildingIcon,
  "capital-giro": CashIcon,
  alavancagem: GrowthIcon,
};

interface Props {
  busca: string;
  diasParaEsfriar: number;
}

export default function Funil({ busca, diasParaEsfriar }: Props) {
  const { dados: leads } = useDados<Lead[]>("funil-leads", () => repositorio.listarLeads(), []);
  const { dados: consultores } = useDados<Consultor[]>(
    "funil-consultores",
    () => repositorio.listarConsultores(),
    []
  );

  const [filtroConsultor, setFiltroConsultor] = useState<string>("");
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);
  const [colunaAlvo, setColunaAlvo] = useState<EtapaFunil | null>(null);
  const [perdendo, setPerdendo] = useState<Lead | null>(null);
  const [movendo, setMovendo] = useState<Lead | null>(null);

  // dragleave dispara ao entrar em elementos filhos; o contador evita o pisca-pisca.
  const contadorEntrada = useRef<Record<string, number>>({});
  const acabouDeArrastar = useRef(false);

  const porConsultor = useMemo(
    () => new Map(consultores.map((c) => [c.id, c])),
    [consultores]
  );

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return leads.filter((l) => {
      if (filtroConsultor === "sem-dono" && l.consultorId !== null) return false;
      if (filtroConsultor && filtroConsultor !== "sem-dono" && l.consultorId !== filtroConsultor)
        return false;
      if (!termo) return true;
      return (
        l.nome.toLowerCase().includes(termo) ||
        l.telefone.includes(termo.replace(/\D/g, ""))
      );
    });
  }, [leads, busca, filtroConsultor]);

  const colunas = useMemo(() => {
    const mapa = new Map<EtapaFunil, Lead[]>();
    ETAPAS.forEach((e) => mapa.set(e.chave, []));
    visiveis.forEach((l) => mapa.get(l.etapa)?.push(l));
    mapa.forEach((lista) => lista.sort((a, b) => a.ordem - b.ordem));
    return mapa;
  }, [visiveis]);

  async function soltar(leadId: string, etapa: EtapaFunil, ordem: number) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    if (etapa === "perdido" && lead.etapa !== "perdido") {
      setPerdendo(lead);
      return;
    }
    await repositorio.moverLead(leadId, etapa, ordem);
  }

  async function confirmarPerda(motivo: string) {
    if (!perdendo) return;
    await repositorio.atualizarLead(perdendo.id, { motivoPerda: motivo });
    await repositorio.moverLead(perdendo.id, "perdido", 0);
    await repositorio.registrarInteracao({
      leadId: perdendo.id,
      tipo: "etapa",
      texto: `Marcado como perdido: ${motivo.toLowerCase()}.`,
      consultorId: perdendo.consultorId,
      automatica: true,
    });
    setPerdendo(null);
  }

  const totalCredito = (lista: Lead[]) => lista.reduce((s, l) => s + l.valorCreditoDesejado, 0);

  return (
    <>
      <CabecalhoPagina
        titulo="Funil"
        subtitulo="Arraste o cartão para mudar a etapa. No celular, use o botão do cartão."
        acoes={
          <select
            value={filtroConsultor}
            onChange={(e) => setFiltroConsultor(e.target.value)}
            className="field-sm w-auto"
            aria-label="Filtrar por consultor"
          >
            <option value="">Todos os consultores</option>
            <option value="sem-dono">Sem consultor</option>
            {consultores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        }
      />

      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:snap-none sm:px-0">
        {ETAPAS_ATIVAS.map((etapa) => {
          const lista = colunas.get(etapa.chave) ?? [];
          const destacada = colunaAlvo === etapa.chave;
          return (
            <section
              key={etapa.chave}
              onDragEnter={() => {
                contadorEntrada.current[etapa.chave] =
                  (contadorEntrada.current[etapa.chave] ?? 0) + 1;
                setColunaAlvo(etapa.chave);
              }}
              onDragLeave={() => {
                contadorEntrada.current[etapa.chave] =
                  (contadorEntrada.current[etapa.chave] ?? 1) - 1;
                if (contadorEntrada.current[etapa.chave] <= 0) {
                  setColunaAlvo((atual) => (atual === etapa.chave ? null : atual));
                }
              }}
              onDragOver={(e) => {
                e.preventDefault(); // sem isto o onDrop nunca dispara
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                contadorEntrada.current[etapa.chave] = 0;
                setColunaAlvo(null);
                const id = e.dataTransfer.getData("text/plain");
                if (id) void soltar(id, etapa.chave, 0);
              }}
              className={`flex w-[80vw] shrink-0 snap-center flex-col rounded-2xl border bg-white/[0.02] transition-colors sm:w-auto sm:flex-1 sm:snap-align-none ${
                destacada ? "border-gold-500/50 bg-gold-500/[0.06]" : "border-white/[0.07]"
              }`}
            >
              <header className="border-b border-white/[0.07] px-3 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: etapa.cor }}
                  />
                  <h2 className="truncate text-sm font-bold text-white">{etapa.nome}</h2>
                  <span className="ml-auto rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-bold text-graphite-300">
                    {lista.length}
                  </span>
                </div>
                {/* É a soma da carta, não a contagem, que a diretora olha primeiro. */}
                <p className="mt-1 text-[11px] font-semibold text-gold-400/90">
                  {moedaCompacta(totalCredito(lista))}
                </p>
              </header>

              <div className="flex max-h-[calc(100vh-19rem)] flex-col gap-2 overflow-y-auto p-2">
                {lista.length === 0 && (
                  <p className="px-2 py-6 text-center text-xs text-graphite-600">Vazio</p>
                )}
                {lista.map((lead) => {
                  const consultor = lead.consultorId ? porConsultor.get(lead.consultorId) : null;
                  const parado = lead.ultimoContatoEm
                    ? diasDesde(lead.ultimoContatoEm)
                    : diasDesde(lead.criadoEm);
                  const esfriando = parado > diasParaEsfriar;
                  const Icone = ICONE_MODALIDADE[lead.modalidade];

                  return (
                    <article
                      key={lead.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", lead.id);
                        e.dataTransfer.effectAllowed = "move";
                        acabouDeArrastar.current = true;
                        setArrastandoId(lead.id);
                      }}
                      onDragEnd={() => {
                        setArrastandoId(null);
                        setColunaAlvo(null);
                        window.setTimeout(() => (acabouDeArrastar.current = false), 0);
                      }}
                      className={`group select-none rounded-xl border border-white/[0.08] bg-night p-3 transition-all ${
                        arrastandoId === lead.id ? "opacity-40" : "hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Elo
                          para={`/admin/leads/${lead.id}`}
                          className="min-w-0 flex-1"
                          titulo="Abrir ficha"
                        >
                          <p className="truncate text-sm font-semibold text-white hover:text-gold-300">
                            {lead.nome}
                          </p>
                          <p className="mt-0.5 font-display text-sm font-bold text-gold-400">
                            {moedaCompacta(lead.valorCreditoDesejado)}
                          </p>
                        </Elo>
                        <button
                          onClick={() => setMovendo(lead)}
                          aria-label="Mover para outra etapa"
                          title="Mover"
                          className="rounded-lg p-1 text-graphite-500 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <MoverIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="badge bg-white/[0.06] text-graphite-300">
                          <Icone className="h-3.5 w-3.5" />
                        </span>
                        <Badge cor={COR_ORIGEM[lead.origem]}>{NOME_ORIGEM[lead.origem]}</Badge>
                        <span className="ml-auto">
                          <Avatar consultor={consultor} />
                        </span>
                      </div>

                      <p
                        className={`mt-2 flex items-center gap-1 text-[11px] ${
                          esfriando ? "text-red-400" : "text-graphite-500"
                        }`}
                      >
                        {esfriando ? (
                          <AlertaIcon className="h-3.5 w-3.5" />
                        ) : (
                          <RelogioIcon className="h-3.5 w-3.5" />
                        )}
                        {parado === 0 ? "falado hoje" : `há ${parado} dia${parado > 1 ? "s" : ""} sem contato`}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Zona de descarte: soltar aqui pergunta o motivo, que alimenta o relatório. */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain");
          if (id) void soltar(id, "perdido", 0);
        }}
        className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-white/15 px-5 py-4 text-sm transition-colors hover:border-red-500/40"
      >
        <span className="text-graphite-400">
          Arraste aqui para marcar como <strong className="text-graphite-200">perdido</strong>
        </span>
        <span className="text-xs text-graphite-500">
          {(colunas.get("perdido") ?? []).length} perdidos ·{" "}
          {moedaCompacta(totalCredito(colunas.get("perdido") ?? []))} que deixaram de entrar
        </span>
      </div>

      <ModalPainel
        titulo="Por que este lead não seguiu?"
        subtitulo={perdendo?.nome}
        aberto={!!perdendo}
        onFechar={() => setPerdendo(null)}
      >
        <div className="grid gap-2">
          {MOTIVOS_PERDA.map((motivo) => (
            <button
              key={motivo}
              onClick={() => void confirmarPerda(motivo)}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-graphite-200 transition-colors hover:border-gold-500/40 hover:text-white"
            >
              {motivo}
            </button>
          ))}
        </div>
      </ModalPainel>

      {/* Caminho de mover sem arrastar: é o único que funciona no celular e o
          único acessível por teclado. */}
      <ModalPainel
        titulo="Mover para"
        subtitulo={movendo?.nome}
        aberto={!!movendo}
        onFechar={() => setMovendo(null)}
      >
        <div className="grid gap-2">
          {ETAPAS.map((etapa) => (
            <button
              key={etapa.chave}
              disabled={movendo?.etapa === etapa.chave}
              onClick={async () => {
                if (!movendo) return;
                const alvo = movendo;
                setMovendo(null);
                if (etapa.chave === "perdido") {
                  setPerdendo(alvo);
                  return;
                }
                await repositorio.moverLead(alvo.id, etapa.chave, 0);
              }}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-graphite-200 transition-colors hover:border-gold-500/40 hover:text-white disabled:opacity-40"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: etapa.cor }} />
              <span className="font-semibold">{etapa.nome}</span>
              <span className="ml-auto text-xs text-graphite-500">{etapa.ajuda}</span>
            </button>
          ))}
        </div>
      </ModalPainel>
    </>
  );
}

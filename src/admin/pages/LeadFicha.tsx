import { useMemo, useState } from "react";
import Avatar from "../components/Avatar";
import Badge from "../components/Badge";
import Elo from "../components/Elo";
import ModalPainel from "../components/ModalPainel";
import CabecalhoPagina from "../components/CabecalhoPagina";
import {
  AgendaIcon,
  CopiarIcon,
  EmailIcon,
  RelogioIcon,
  TelefoneIcon,
} from "../components/IconesAdmin";
import { WhatsAppIcon } from "../../components/Icons";
import {
  COR_ETAPA,
  COR_ORIGEM,
  ETAPAS,
  NOME_ETAPA,
  NOME_MODALIDADE,
  NOME_ORIGEM,
  TEMPERATURAS,
} from "../data/constantes";
import { repositorio } from "../data/repositorio";
import { useDados } from "../data/useDados";
import { dataHora, moeda, relativo, telefone as fmtTelefone } from "../lib/formato";
import { mensagemPrimeiroContato } from "../lib/mensagens";
import type { Consultor, Interacao, Lead, Tarefa, Temperatura } from "../data/tipos";

interface Props {
  leadId: string;
  modoDemo: boolean;
}

export default function LeadFicha({ leadId, modoDemo }: Props) {
  const { dados: lead, carregando } = useDados<Lead | null>(
    `lead-${leadId}`,
    () => repositorio.obterLead(leadId),
    null
  );
  const { dados: interacoes } = useDados<Interacao[]>(
    `interacoes-${leadId}`,
    () => repositorio.listarInteracoes(leadId),
    []
  );
  const { dados: consultores } = useDados<Consultor[]>(
    "ficha-consultores",
    () => repositorio.listarConsultores(),
    []
  );
  const { dados: tarefas } = useDados<Tarefa[]>(
    "ficha-tarefas",
    () => repositorio.listarTarefas({ concluida: false }),
    []
  );

  const [nota, setNota] = useState("");
  const [mensagemDemo, setMensagemDemo] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [agendando, setAgendando] = useState(false);
  const [tituloTarefa, setTituloTarefa] = useState("");
  const [quandoTarefa, setQuandoTarefa] = useState("1");

  const consultor = useMemo(
    () => consultores.find((c) => c.id === lead?.consultorId) ?? null,
    [consultores, lead]
  );

  const tarefasDoLead = tarefas.filter((t) => t.leadId === leadId);

  if (carregando) return <div className="card-painel h-64 animate-pulse" />;

  if (!lead) {
    return (
      <>
        <CabecalhoPagina titulo="Lead não encontrado" />
        <Elo para="/admin/funil" className="btn-sm-ghost">
          Voltar ao funil
        </Elo>
      </>
    );
  }

  async function salvarNota() {
    if (!nota.trim() || !lead) return;
    await repositorio.registrarInteracao({
      leadId: lead.id,
      tipo: "nota",
      texto: nota.trim(),
      consultorId: lead.consultorId,
      automatica: false,
    });
    setNota("");
  }

  function abrirWhats() {
    if (!lead) return;
    const texto = mensagemPrimeiroContato(lead);
    if (modoDemo) {
      // Trava da demonstração: os telefones do seed são fictícios e abrir o wa.me
      // ao vivo cairia na conversa de um desconhecido.
      setMensagemDemo(texto);
      return;
    }
    window.open(
      `https://wa.me/${lead.telefone}?text=${encodeURIComponent(texto)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function criarTarefa() {
    if (!lead) return;
    const dias = Number(quandoTarefa);
    const quando = new Date();
    quando.setDate(quando.getDate() + dias);
    quando.setHours(9, 0, 0, 0);
    await repositorio.salvarTarefa({
      id: "",
      leadId: lead.id,
      consultorId: lead.consultorId,
      titulo: tituloTarefa.trim() || `Falar com ${lead.nome.split(" ")[0]}`,
      tipo: "ligar",
      vencimentoEm: quando.toISOString(),
      concluida: false,
      criadoEm: new Date().toISOString(),
    });
    await repositorio.atualizarLead(lead.id, { proximoContatoEm: quando.toISOString() });
    setTituloTarefa("");
    setAgendando(false);
  }

  const diasParado = relativo(lead.ultimoContatoEm ?? lead.criadoEm);

  return (
    <>
      <Elo
        para="/admin/funil"
        className="mb-4 inline-flex items-center gap-1 text-sm text-graphite-400 hover:text-gold-400"
      >
        ← Voltar ao funil
      </Elo>

      <CabecalhoPagina
        titulo={lead.nome}
        subtitulo={`${NOME_MODALIDADE[lead.modalidade]} · ${lead.cidade ?? ""}${
          lead.uf ? `/${lead.uf}` : ""
        }`}
        acoes={
          <>
            <button onClick={abrirWhats} className="btn-sm-gold">
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </button>
            <button onClick={() => setAgendando(true)} className="btn-sm-ghost">
              <AgendaIcon className="h-4 w-4" />
              Agendar retorno
            </button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,340px)_1fr]">
        {/* Coluna de dados */}
        <div className="space-y-4">
          <div className="card-painel">
            <p className="rotulo-painel">Carta pretendida</p>
            <p className="mt-1 font-display text-3xl font-bold text-gold-gradient">
              {moeda(lead.valorCreditoDesejado)}
            </p>

            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-graphite-300">
                <TelefoneIcon className="h-4 w-4 text-graphite-500" />
                <span>{fmtTelefone(lead.telefone)}</span>
              </div>
              {lead.email && (
                <div className="flex items-center gap-2 text-graphite-300">
                  <EmailIcon className="h-4 w-4 text-graphite-500" />
                  <span className="truncate">{lead.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-graphite-300">
                <RelogioIcon className="h-4 w-4 text-graphite-500" />
                <span>Último contato {diasParado}</span>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-1.5">
              <Badge cor={COR_ETAPA[lead.etapa]}>{NOME_ETAPA[lead.etapa]}</Badge>
              <Badge cor={COR_ORIGEM[lead.origem]}>{NOME_ORIGEM[lead.origem]}</Badge>
              {lead.etiquetas.map((e) => (
                <Badge key={e} cor="#C9A24B">
                  {e}
                </Badge>
              ))}
            </div>
          </div>

          <div className="card-painel">
            <p className="rotulo-painel">Etapa</p>
            <select
              value={lead.etapa}
              onChange={(e) =>
                void repositorio.moverLead(lead.id, e.target.value as Lead["etapa"], 0)
              }
              className="field-sm mt-2"
            >
              {ETAPAS.map((e) => (
                <option key={e.chave} value={e.chave}>
                  {e.nome}
                </option>
              ))}
            </select>

            <p className="rotulo-painel mt-4">Consultor responsável</p>
            <div className="mt-2 flex items-center gap-2">
              <Avatar consultor={consultor} tamanho="md" />
              <select
                value={lead.consultorId ?? ""}
                onChange={(e) =>
                  void repositorio.atualizarLead(lead.id, {
                    consultorId: e.target.value || null,
                  })
                }
                className="field-sm"
              >
                <option value="">Sem consultor</option>
                {consultores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <p className="rotulo-painel mt-4">Temperatura</p>
            <div className="mt-2 flex gap-2">
              {TEMPERATURAS.map((t) => (
                <button
                  key={t.chave}
                  onClick={() =>
                    void repositorio.atualizarLead(lead.id, {
                      temperatura: t.chave as Temperatura,
                    })
                  }
                  className={`flex-1 rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                    lead.temperatura === t.chave
                      ? "border-transparent text-graphite-900"
                      : "border-white/10 text-graphite-400 hover:text-white"
                  }`}
                  style={
                    lead.temperatura === t.chave ? { backgroundColor: t.cor } : undefined
                  }
                >
                  {t.nome}
                </button>
              ))}
            </div>
          </div>

          <div className="card-painel">
            <p className="rotulo-painel">De onde veio</p>
            <dl className="mt-2 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-graphite-500">Origem</dt>
                <dd className="text-right text-graphite-200">{NOME_ORIGEM[lead.origem]}</dd>
              </div>
              {lead.campanha && (
                <div className="flex justify-between gap-3">
                  <dt className="text-graphite-500">Campanha</dt>
                  <dd className="text-right text-graphite-200">{lead.campanha}</dd>
                </div>
              )}
              {lead.conjunto && (
                <div className="flex justify-between gap-3">
                  <dt className="text-graphite-500">Conjunto</dt>
                  <dd className="text-right text-graphite-200">{lead.conjunto}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-graphite-500">Entrou em</dt>
                <dd className="text-right text-graphite-200">{dataHora(lead.criadoEm)}</dd>
              </div>
            </dl>
          </div>

          {tarefasDoLead.length > 0 && (
            <div className="card-painel">
              <p className="rotulo-painel">Combinado</p>
              <ul className="mt-2 space-y-2">
                {tarefasDoLead.map((t) => (
                  <li key={t.id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={t.concluida}
                      onChange={() => void repositorio.concluirTarefa(t.id, !t.concluida)}
                      className="mt-1 h-4 w-4 accent-gold-500"
                      aria-label="Concluir"
                    />
                    <span className="text-graphite-200">
                      {t.titulo}
                      <span className="ml-1 text-xs text-graphite-500">
                        ({relativo(t.vencimentoEm)})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="card-painel">
          <h2 className="font-display text-lg font-bold text-white">Histórico</h2>
          <p className="mt-0.5 text-sm text-graphite-500">
            Tudo que já foi falado com este cliente fica aqui.
          </p>

          <div className="mt-4">
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={2}
              placeholder="Escreva o que foi combinado nessa conversa…"
              className="field-sm resize-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => void salvarNota()}
                disabled={!nota.trim()}
                className="btn-sm-gold disabled:opacity-40"
              >
                Adicionar ao histórico
              </button>
            </div>
          </div>

          <ol className="mt-6 space-y-4 border-l border-white/[0.08] pl-5">
            {interacoes.map((i) => (
              <li key={i.id} className="relative">
                <span
                  className={`absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-ink ${
                    i.automatica ? "bg-graphite-600" : "bg-gold-500"
                  }`}
                />
                <p className="text-sm text-graphite-200">{i.texto}</p>
                <p className="mt-0.5 text-[11px] text-graphite-600">
                  {dataHora(i.criadoEm)}
                  {i.consultorId
                    ? ` · ${consultores.find((c) => c.id === i.consultorId)?.nome ?? ""}`
                    : ""}
                </p>
              </li>
            ))}
            {interacoes.length === 0 && (
              <li className="text-sm text-graphite-500">Nada registrado ainda.</li>
            )}
          </ol>
        </div>
      </div>

      <ModalPainel
        titulo="Mensagem pronta"
        subtitulo="Na demonstração o WhatsApp não abre: os telefones são fictícios."
        aberto={!!mensagemDemo}
        onFechar={() => {
          setMensagemDemo(null);
          setCopiado(false);
        }}
      >
        <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-graphite-800/60 p-4 text-sm text-graphite-200">
          {mensagemDemo}
        </pre>
        <button
          onClick={() => {
            void navigator.clipboard?.writeText(mensagemDemo ?? "");
            setCopiado(true);
          }}
          className="btn-sm-gold mt-3 w-full"
        >
          <CopiarIcon className="h-4 w-4" />
          {copiado ? "Copiado" : "Copiar mensagem"}
        </button>
      </ModalPainel>

      <ModalPainel
        titulo="Agendar retorno"
        subtitulo={lead.nome}
        aberto={agendando}
        onFechar={() => setAgendando(false)}
      >
        <label className="field-label" htmlFor="tarefa-titulo">
          O que precisa ser feito
        </label>
        <input
          id="tarefa-titulo"
          value={tituloTarefa}
          onChange={(e) => setTituloTarefa(e.target.value)}
          placeholder={`Falar com ${lead.nome.split(" ")[0]}`}
          className="field-sm"
        />

        <label className="field-label mt-4" htmlFor="tarefa-quando">
          Quando
        </label>
        <select
          id="tarefa-quando"
          value={quandoTarefa}
          onChange={(e) => setQuandoTarefa(e.target.value)}
          className="field-sm"
        >
          <option value="0">Hoje</option>
          <option value="1">Amanhã</option>
          <option value="2">Em 2 dias</option>
          <option value="3">Em 3 dias</option>
          <option value="7">Na semana que vem</option>
          <option value="15">Em 15 dias</option>
        </select>

        <button onClick={() => void criarTarefa()} className="btn-sm-gold mt-5 w-full">
          Agendar
        </button>
      </ModalPainel>
    </>
  );
}

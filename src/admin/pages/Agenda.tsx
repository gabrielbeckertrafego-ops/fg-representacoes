import CabecalhoPagina from "../components/CabecalhoPagina";
import Avatar from "../components/Avatar";
import Elo from "../components/Elo";
import { AlertaIcon } from "../components/IconesAdmin";
import { repositorio } from "../data/repositorio";
import { useDados } from "../data/useDados";
import { dataCurta, diasDesde, relativo } from "../lib/formato";
import type { BaseDados, Tarefa } from "../data/tipos";

const TIPO_ROTULO: Record<Tarefa["tipo"], string> = {
  ligar: "Ligar",
  whatsapp: "WhatsApp",
  "enviar-simulacao": "Enviar simulação",
  documentos: "Documentos",
  reuniao: "Reunião",
  outro: "Outro",
};

export default function Agenda() {
  const { dados: base } = useDados<BaseDados | null>("agenda-base", () => repositorio.obterBase(), null);

  if (!base) return <div className="card-painel h-64 animate-pulse" />;

  const pendentes = base.tarefas
    .filter((t) => !t.concluida)
    .sort((a, b) => (a.vencimentoEm < b.vencimentoEm ? -1 : 1));

  const atrasadas = pendentes.filter((t) => diasDesde(t.vencimentoEm) > 0);
  const hoje = pendentes.filter((t) => diasDesde(t.vencimentoEm) === 0);
  const proximas = pendentes.filter((t) => diasDesde(t.vencimentoEm) < 0);

  const feitas = base.tarefas
    .filter((t) => t.concluida)
    .sort((a, b) => ((a.concluidaEm ?? "") < (b.concluidaEm ?? "") ? 1 : -1))
    .slice(0, 10);

  const grupos = [
    { titulo: "Atrasados", lista: atrasadas, cor: "text-red-400", alerta: true },
    { titulo: "Para hoje", lista: hoje, cor: "text-gold-400", alerta: false },
    { titulo: "Próximos dias", lista: proximas, cor: "text-graphite-300", alerta: false },
  ];

  function Linha({ tarefa }: { tarefa: Tarefa }) {
    const lead = base!.leads.find((l) => l.id === tarefa.leadId);
    const consultor = base!.consultores.find((c) => c.id === tarefa.consultorId) ?? null;
    return (
      <li className="flex items-start gap-3 border-b border-white/[0.05] py-2.5 last:border-0">
        <input
          type="checkbox"
          checked={tarefa.concluida}
          onChange={() => void repositorio.concluirTarefa(tarefa.id, !tarefa.concluida)}
          className="mt-1 h-4 w-4 shrink-0 accent-gold-500"
          aria-label={`Concluir ${tarefa.titulo}`}
        />
        <div className="min-w-0 flex-1">
          {lead ? (
            <Elo
              para={`/admin/leads/${lead.id}`}
              className="block truncate text-sm text-graphite-100 hover:text-gold-300"
            >
              {tarefa.titulo}
            </Elo>
          ) : (
            <span className="block truncate text-sm text-graphite-100">{tarefa.titulo}</span>
          )}
          <span className="text-[11px] text-graphite-600">
            {TIPO_ROTULO[tarefa.tipo]} · {relativo(tarefa.vencimentoEm)} ·{" "}
            {dataCurta(tarefa.vencimentoEm)}
          </span>
        </div>
        <Avatar consultor={consultor} />
      </li>
    );
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Agenda"
        subtitulo="O que foi combinado com cada cliente, por data"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {grupos.map((g) => (
          <div key={g.titulo} className="card-painel">
            <div className="flex items-center gap-2">
              {g.alerta && g.lista.length > 0 && (
                <AlertaIcon className="h-4 w-4 text-red-400" />
              )}
              <h2 className={`font-display text-base font-bold ${g.cor}`}>{g.titulo}</h2>
              <span className="ml-auto rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-bold text-graphite-300">
                {g.lista.length}
              </span>
            </div>
            <ul className="mt-2">
              {g.lista.map((t) => (
                <Linha key={t.id} tarefa={t} />
              ))}
              {g.lista.length === 0 && (
                <li className="py-8 text-center text-sm text-graphite-600">
                  Nada por aqui.
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="card-painel mt-4">
        <h2 className="font-display text-base font-bold text-white">Já resolvidos</h2>
        <ul className="mt-2">
          {feitas.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-2 text-sm">
              <span className="text-emerald-400">✓</span>
              <span className="min-w-0 flex-1 truncate text-graphite-400 line-through">
                {t.titulo}
              </span>
              <span className="shrink-0 text-[11px] text-graphite-600">
                {relativo(t.concluidaEm)}
              </span>
            </li>
          ))}
          {feitas.length === 0 && (
            <li className="py-6 text-center text-sm text-graphite-600">
              Nada concluído ainda.
            </li>
          )}
        </ul>
      </div>
    </>
  );
}

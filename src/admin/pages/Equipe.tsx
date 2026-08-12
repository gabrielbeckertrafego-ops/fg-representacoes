import { useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import Avatar from "../components/Avatar";
import ModalPainel from "../components/ModalPainel";
import CampoMoeda from "../components/CampoMoeda";
import { LapisIcon, PessoasIcon } from "../components/IconesAdmin";
import { repositorio } from "../data/repositorio";
import { useDados } from "../data/useDados";
import { moeda, moedaCompacta, numero, percentual } from "../lib/formato";
import { periodoAtual, ranking } from "../lib/metricas";
import { novoId } from "../lib/id";
import type { BaseDados, Consultor, Permissao } from "../data/tipos";

const CORES = ["#C9A24B", "#5EA9E8", "#3FBF7F", "#B48EE0", "#E9C46A", "#E06A5A", "#4FB6A4"];

function consultorVazio(indice: number): Consultor {
  return {
    id: "",
    nome: "",
    email: "",
    telefone: "",
    foto: "",
    cor: CORES[indice % CORES.length],
    metaMensal: 400_000,
    comissaoPercentual: 1.8,
    permissao: "consultor",
    ativo: true,
    criadoEm: new Date().toISOString(),
  };
}

export default function Equipe() {
  const { dados: base } = useDados<BaseDados | null>("equipe-base", () => repositorio.obterBase(), null);
  const [editando, setEditando] = useState<Consultor | null>(null);
  const [novo, setNovo] = useState(false);

  if (!base) return <div className="card-painel h-64 animate-pulse" />;

  const linhas = ranking(base, periodoAtual());
  const semDono = base.leads.filter((l) => !l.consultorId && l.etapa !== "perdido").length;

  async function salvar() {
    if (!editando) return;
    const consultor: Consultor = {
      ...editando,
      id: editando.id || novoId("c"),
      nome: editando.nome.trim() || "Sem nome",
    };
    await repositorio.salvarConsultor(consultor);
    setEditando(null);
    setNovo(false);
  }

  /** Distribui quem está sem dono, em rodízio pelos consultores ativos. */
  async function redistribuir() {
    if (!base) return;
    const ativos = base.consultores.filter((c) => c.ativo);
    if (!ativos.length) return;
    const orfaos = base.leads.filter((l) => !l.consultorId && l.etapa !== "perdido");
    for (let i = 0; i < orfaos.length; i += 1) {
      await repositorio.atualizarLead(orfaos[i].id, {
        consultorId: ativos[i % ativos.length].id,
      });
    }
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Equipe"
        subtitulo="Cadastre quantos consultores quiser, com meta e comissão de cada um"
        acoes={
          <>
            {semDono > 0 && (
              <button onClick={() => void redistribuir()} className="btn-sm-ghost">
                <PessoasIcon className="h-4 w-4" />
                Distribuir {semDono} sem dono
              </button>
            )}
            <button
              onClick={() => {
                setEditando(consultorVazio(base.consultores.length));
                setNovo(true);
              }}
              className="btn-sm-gold"
            >
              Novo consultor
            </button>
          </>
        }
      />

      <div className="mb-4 card-painel flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Distribuição automática</p>
          <p className="text-xs text-graphite-500">
            Cada lead novo cai para o próximo consultor da fila, em rodízio.
          </p>
        </div>
        <button
          onClick={() =>
            void repositorio.salvarConfig({
              distribuicaoAutomatica: !base.config.distribuicaoAutomatica,
            })
          }
          role="switch"
          aria-checked={base.config.distribuicaoAutomatica}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
            base.config.distribuicaoAutomatica ? "bg-gold-500" : "bg-white/15"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
              base.config.distribuicaoAutomatica ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {linhas.map(({ consultor, volume, meta, percentual: pct, vendas, comissao, leadsAtivos }) => (
          <div key={consultor.id} className="card-painel">
            <div className="flex items-start gap-3">
              <Avatar consultor={consultor} tamanho="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-bold text-white">
                  {consultor.nome}
                </p>
                <p className="text-xs text-graphite-500">
                  {consultor.permissao === "diretora" ? "Diretora" : "Consultor"}
                  {!consultor.ativo && " · inativo"}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditando(consultor);
                  setNovo(false);
                }}
                aria-label={`Editar ${consultor.nome}`}
                className="rounded-lg p-1.5 text-graphite-500 hover:bg-white/5 hover:text-white"
              >
                <LapisIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold text-white">{moedaCompacta(volume)}</span>
                <span className="text-xs text-graphite-500">meta {moedaCompacta(meta)}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, pct)}%`,
                    backgroundColor: consultor.cor,
                  }}
                />
              </div>
              <p className="mt-1 text-[11px] text-graphite-500">
                {percentual(pct, 0)} da meta do mês
              </p>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-3 text-center">
              <div>
                <dt className="rotulo-painel">Adesões</dt>
                <dd className="mt-0.5 text-sm font-bold text-white">{numero(vendas)}</dd>
              </div>
              <div>
                <dt className="rotulo-painel">Em aberto</dt>
                <dd className="mt-0.5 text-sm font-bold text-white">{numero(leadsAtivos)}</dd>
              </div>
              <div>
                <dt className="rotulo-painel">Comissão</dt>
                <dd className="mt-0.5 text-sm font-bold text-emerald-400">
                  {moedaCompacta(comissao)}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <ModalPainel
        titulo={novo ? "Novo consultor" : "Editar consultor"}
        aberto={!!editando}
        onFechar={() => setEditando(null)}
      >
        {editando && (
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="eq-nome">
                Nome
              </label>
              <input
                id="eq-nome"
                value={editando.nome}
                onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                className="field-sm"
                placeholder="Nome do consultor"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label" htmlFor="eq-tel">
                  WhatsApp
                </label>
                <input
                  id="eq-tel"
                  value={editando.telefone ?? ""}
                  onChange={(e) => setEditando({ ...editando, telefone: e.target.value })}
                  className="field-sm"
                  placeholder="(51) 99999-9999"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="eq-email">
                  E-mail
                </label>
                <input
                  id="eq-email"
                  value={editando.email ?? ""}
                  onChange={(e) => setEditando({ ...editando, email: e.target.value })}
                  className="field-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label" htmlFor="eq-meta">
                  Meta mensal (crédito)
                </label>
                <CampoMoeda
                  id="eq-meta"
                  valor={editando.metaMensal}
                  onChange={(v) => setEditando({ ...editando, metaMensal: v })}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="eq-com">
                  Comissão %
                </label>
                <input
                  id="eq-com"
                  type="number"
                  step="0.1"
                  value={editando.comissaoPercentual}
                  onChange={(e) =>
                    setEditando({ ...editando, comissaoPercentual: Number(e.target.value) })
                  }
                  className="field-sm"
                />
                <p className="mt-1 text-[11px] text-graphite-600">
                  Em uma carta de {moedaCompacta(300_000)} dá{" "}
                  {moeda(300_000 * (editando.comissaoPercentual / 100))}
                </p>
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="eq-perm">
                O que essa pessoa enxerga
              </label>
              <select
                id="eq-perm"
                value={editando.permissao}
                onChange={(e) =>
                  setEditando({ ...editando, permissao: e.target.value as Permissao })
                }
                className="field-sm"
              >
                <option value="consultor">Consultor — só a carteira dele</option>
                <option value="diretora">Diretora — tudo, inclusive relatórios</option>
              </select>
            </div>

            <div>
              <span className="field-label">Cor no painel</span>
              <div className="flex flex-wrap gap-2">
                {CORES.map((cor) => (
                  <button
                    key={cor}
                    onClick={() => setEditando({ ...editando, cor })}
                    aria-label={`Cor ${cor}`}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      editando.cor === cor ? "scale-110 ring-2 ring-white" : ""
                    }`}
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-graphite-300">
              <input
                type="checkbox"
                checked={editando.ativo}
                onChange={(e) => setEditando({ ...editando, ativo: e.target.checked })}
                className="h-4 w-4 accent-gold-500"
              />
              Está atendendo (recebe leads novos)
            </label>

            <div className="flex gap-2 pt-2">
              <button onClick={() => void salvar()} className="btn-sm-gold flex-1">
                Salvar
              </button>
              {!novo && (
                <button
                  onClick={async () => {
                    await repositorio.removerConsultor(editando.id);
                    setEditando(null);
                  }}
                  className="btn-sm-perigo"
                >
                  Remover
                </button>
              )}
            </div>
          </div>
        )}
      </ModalPainel>
    </>
  );
}

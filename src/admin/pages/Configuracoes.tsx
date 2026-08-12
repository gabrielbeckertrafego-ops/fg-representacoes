import { useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import CampoMoeda from "../components/CampoMoeda";
import Toast from "../components/Toast";
import { MODALIDADES } from "../data/constantes";
import { repositorio } from "../data/repositorio";
import { useDados } from "../data/useDados";
import { data } from "../lib/formato";
import type { BaseDados, Modalidade } from "../data/tipos";

export default function Configuracoes() {
  const { dados: base } = useDados<BaseDados | null>("cfg-base", () => repositorio.obterBase(), null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  if (!base) return <div className="card-painel h-64 animate-pulse" />;
  const c = base.config;

  async function ajustar(mudancas: Parameters<typeof repositorio.salvarConfig>[0]) {
    await repositorio.salvarConfig(mudancas);
  }

  async function ajustarPadrao(modalidade: Modalidade, campo: string, valor: number) {
    if (!base) return;
    await repositorio.salvarConfig({
      padroesPorModalidade: {
        ...base.config.padroesPorModalidade,
        [modalidade]: { ...base.config.padroesPorModalidade[modalidade], [campo]: valor },
      },
    });
  }

  function exportar() {
    const blob = new Blob([JSON.stringify(base, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crm-fg-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("Cópia baixada.");
  }

  async function importar(arquivo: File) {
    try {
      const texto = await arquivo.text();
      await repositorio.importarBase(JSON.parse(texto) as BaseDados);
      setToast("Dados restaurados.");
    } catch {
      setToast("Não consegui ler esse arquivo.");
    }
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Configurações"
        subtitulo="Ajuste as taxas, a senha e o comportamento da demonstração"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-painel space-y-4">
          <h2 className="font-display text-lg font-bold text-white">Empresa</h2>

          <div>
            <label className="field-label" htmlFor="cfg-nome">
              Nome que aparece no painel
            </label>
            <input
              id="cfg-nome"
              defaultValue={c.nomeEmpresa}
              onBlur={(e) => void ajustar({ nomeEmpresa: e.target.value })}
              className="field-sm"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="cfg-senha">
              Senha de acesso
            </label>
            <input
              id="cfg-senha"
              defaultValue={c.senhaPainel}
              onBlur={(e) => void ajustar({ senhaPainel: e.target.value })}
              className="field-sm"
            />
            <p className="mt-1 text-[11px] text-amber-400/80">
              Enquanto for demonstração, essa senha protege pouco: ela viaja dentro da
              página. Quando o CRM passar a guardar cliente de verdade, cada consultor
              terá o próprio acesso.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="cfg-esfriar">
                Lead esfria depois de
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="cfg-esfriar"
                  type="number"
                  min={1}
                  defaultValue={c.diasParaEsfriar}
                  onBlur={(e) => void ajustar({ diasParaEsfriar: Number(e.target.value) })}
                  className="field-sm"
                />
                <span className="shrink-0 text-sm text-graphite-400">dias</span>
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="cfg-meta">
                Meta da equipe
              </label>
              <CampoMoeda
                id="cfg-meta"
                valor={c.metaEquipeMensal}
                onChange={(v) => void ajustar({ metaEquipeMensal: v })}
              />
            </div>
          </div>
        </div>

        <div className="card-painel space-y-4">
          <h2 className="font-display text-lg font-bold text-white">Demonstração</h2>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={c.modoDemo}
              onChange={(e) => void ajustar({ modoDemo: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-gold-500"
            />
            <span>
              <span className="font-semibold text-white">Modo demonstração</span>
              <span className="block text-xs text-graphite-500">
                Os telefones desta base são inventados. Com isso ligado, o botão de
                WhatsApp mostra a mensagem pronta em vez de abrir a conversa — evita
                cair no celular de um desconhecido durante a apresentação.
              </span>
            </span>
          </label>

          <div className="rounded-xl border border-white/[0.07] p-3">
            <p className="text-sm font-semibold text-white">Datas da demonstração</p>
            <p className="mt-0.5 text-xs text-graphite-500">
              Base montada em {data(base.geradaEm)}. Se fizer tempo, os leads aparecem
              parados há semanas.
            </p>
            <button
              onClick={async () => {
                await repositorio.atualizarDatasDemo();
                setToast("Datas trazidas para hoje.");
              }}
              className="btn-sm-ghost mt-2"
            >
              Trazer tudo para hoje
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={exportar} className="btn-sm-ghost">
              Baixar cópia
            </button>
            <label className="btn-sm-ghost cursor-pointer">
              Restaurar cópia
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0];
                  if (arquivo) void importar(arquivo);
                }}
              />
            </label>
            <button onClick={() => setConfirmando(true)} className="btn-sm-perigo">
              Recomeçar do zero
            </button>
          </div>

          {confirmando && (
            <div className="rounded-xl border border-red-500/25 bg-red-500/[0.07] p-3">
              <p className="text-sm text-graphite-200">
                Isso apaga tudo que foi mexido e recria a base de exemplo. Serve para
                deixar limpo entre uma reunião e outra.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={async () => {
                    await repositorio.reiniciarDemo();
                    setConfirmando(false);
                    setToast("Demonstração recomeçada.");
                  }}
                  className="btn-sm-perigo"
                >
                  Sim, recomeçar
                </button>
                <button onClick={() => setConfirmando(false)} className="btn-sm-ghost">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card-painel lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-white">
            Taxas padrão por modalidade
          </h2>
          <p className="mt-0.5 text-sm text-graphite-500">
            É daqui que o simulador tira os números. Confira com a proposta de cada
            administradora antes de usar com cliente.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[38rem] text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-left">
                  {["Modalidade", "Taxa adm. (%)", "Fundo reserva (%)", "Seguro (% ao mês)"].map(
                    (h) => (
                      <th key={h} className="rotulo-painel px-3 py-2 font-semibold">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {MODALIDADES.map((m) => {
                  const p = c.padroesPorModalidade[m.chave];
                  return (
                    <tr key={m.chave} className="linha-tabela">
                      <td className="px-3 py-2 font-semibold text-white">{m.nome}</td>
                      {(
                        [
                          ["taxaAdministracao", p.taxaAdministracao, "0.5"],
                          ["fundoReserva", p.fundoReserva, "0.5"],
                          ["seguroMensal", p.seguroMensal, "0.005"],
                        ] as [string, number, string][]
                      ).map(([campo, valor, passo]) => (
                        <td key={campo} className="px-3 py-2">
                          <input
                            type="number"
                            step={passo}
                            defaultValue={valor}
                            onBlur={(e) =>
                              void ajustarPadrao(m.chave, campo, Number(e.target.value))
                            }
                            className="field-sm w-24"
                            aria-label={`${campo} de ${m.nome}`}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Toast mensagem={toast} onFechar={() => setToast(null)} />
    </>
  );
}

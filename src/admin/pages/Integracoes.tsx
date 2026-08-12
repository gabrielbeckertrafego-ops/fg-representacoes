import { useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import ModalPainel from "../components/ModalPainel";
import Toast from "../components/Toast";
import { CopiarIcon, PlugIcon, RaioIcon } from "../components/IconesAdmin";
import { WhatsAppIcon } from "../../components/Icons";
import { navegar } from "../../lib/rota";
import { repositorio } from "../data/repositorio";
import { useDados } from "../data/useDados";
import {
  CAMPOS_POR_CANAL,
  conectar,
  dadosWebhook,
  desconectar,
  receberLeadDeTeste,
} from "../data/canaisSimulados";
import { relativo } from "../lib/formato";
import type { Integracao } from "../data/tipos";

const COR_STATUS: Record<Integracao["status"], { cor: string; texto: string }> = {
  conectado: { cor: "#3FBF7F", texto: "Conectado" },
  desconectado: { cor: "#71717A", texto: "Não conectado" },
  sincronizando: { cor: "#E9C46A", texto: "Conectando…" },
  erro: { cor: "#E06A5A", texto: "Com problema" },
};

export default function Integracoes() {
  const { dados: integracoes } = useDados<Integracao[]>(
    "integracoes",
    () => repositorio.listarIntegracoes(),
    []
  );

  const [editando, setEditando] = useState<Integracao | null>(null);
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [conectando, setConectando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [leadNovoId, setLeadNovoId] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  function abrir(integracao: Integracao) {
    const base =
      integracao.chave === "webhook" && !integracao.configuracao.url
        ? dadosWebhook()
        : integracao.configuracao;
    setCampos({ ...base });
    setEditando(integracao);
  }

  async function confirmarConexao() {
    if (!editando) return;
    setConectando(true);
    await conectar(editando, campos);
    setConectando(false);
    setToast(`${editando.nome} conectado.`);
    setEditando(null);
  }

  async function leadDeTeste(integracao: Integracao) {
    const lead = await receberLeadDeTeste(integracao);
    setLeadNovoId(lead.id);
    setToast(`Novo lead de ${integracao.nome}: ${lead.nome}`);
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Integrações"
        subtitulo="Ligue aqui tudo que traz cliente: WhatsApp, anúncios, site e planilhas"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integracoes.map((integracao) => {
          const status = COR_STATUS[integracao.status];
          const conectado = integracao.status === "conectado";
          return (
            <div key={integracao.id} className="card-painel flex flex-col">
              <div className="flex items-start gap-3">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{ backgroundColor: `${status.cor}1f`, color: status.cor }}
                >
                  {integracao.chave === "whatsapp" ? (
                    <WhatsAppIcon className="h-5 w-5" />
                  ) : (
                    <PlugIcon className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{integracao.nome}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: status.cor }}
                    />
                    <span style={{ color: status.cor }}>{status.texto}</span>
                  </p>
                </div>
              </div>

              <p className="mt-3 flex-1 text-sm text-graphite-400">{integracao.descricao}</p>

              {conectado && (
                <dl className="mt-3 space-y-1 border-t border-white/[0.07] pt-3 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-graphite-500">Leads recebidos</dt>
                    <dd className="font-semibold text-graphite-200">
                      {integracao.leadsRecebidos}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-graphite-500">Última entrada</dt>
                    <dd className="text-graphite-300">
                      {relativo(integracao.ultimaSincronizacao)}
                    </dd>
                  </div>
                </dl>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {conectado ? (
                  <>
                    <button
                      onClick={() => void leadDeTeste(integracao)}
                      className="btn-sm-gold"
                      title="Cria um lead como se tivesse acabado de chegar"
                    >
                      <RaioIcon className="h-4 w-4" />
                      Receber lead de teste
                    </button>
                    <button onClick={() => abrir(integracao)} className="btn-sm-ghost">
                      Ajustar
                    </button>
                  </>
                ) : (
                  <button onClick={() => abrir(integracao)} className="btn-sm-gold">
                    Conectar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-graphite-600">
        Está faltando alguma ferramenta? O webhook conecta qualquer sistema que saiba
        enviar leads.
      </p>

      <ModalPainel
        titulo={editando ? `Conectar ${editando.nome}` : ""}
        subtitulo={editando?.descricao}
        aberto={!!editando}
        onFechar={() => setEditando(null)}
      >
        {editando && (
          <div className="space-y-4">
            {(CAMPOS_POR_CANAL[editando.chave] ?? []).map((campo) => (
              <div key={campo.chave}>
                <label className="field-label" htmlFor={`campo-${campo.chave}`}>
                  {campo.rotulo}
                </label>
                <div className="flex gap-2">
                  <input
                    id={`campo-${campo.chave}`}
                    value={campos[campo.chave] ?? ""}
                    readOnly={campo.somenteLeitura}
                    placeholder={campo.exemplo}
                    onChange={(e) =>
                      setCampos({ ...campos, [campo.chave]: e.target.value })
                    }
                    className={`field-sm ${campo.somenteLeitura ? "text-graphite-400" : ""}`}
                  />
                  {campo.somenteLeitura && (
                    <button
                      onClick={() => {
                        void navigator.clipboard?.writeText(campos[campo.chave] ?? "");
                        setCopiado(campo.chave);
                      }}
                      className="btn-sm-ghost shrink-0"
                      aria-label="Copiar"
                    >
                      <CopiarIcon className="h-4 w-4" />
                      {copiado === campo.chave ? "Copiado" : "Copiar"}
                    </button>
                  )}
                </div>
                {campo.ajuda && (
                  <p className="mt-1 text-[11px] text-graphite-600">{campo.ajuda}</p>
                )}
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => void confirmarConexao()}
                disabled={conectando}
                className="btn-sm-gold flex-1"
              >
                {conectando ? "Conectando…" : "Conectar"}
              </button>
              {editando.status === "conectado" && (
                <button
                  onClick={async () => {
                    await desconectar(editando);
                    setEditando(null);
                    setToast(`${editando.nome} desconectado.`);
                  }}
                  className="btn-sm-perigo"
                >
                  Desconectar
                </button>
              )}
            </div>
          </div>
        )}
      </ModalPainel>

      <Toast
        mensagem={toast}
        onFechar={() => setToast(null)}
        acao={
          leadNovoId
            ? {
                rotulo: "Ver no funil",
                onClick: () => {
                  setToast(null);
                  navegar(`/admin/leads/${leadNovoId}`);
                },
              }
            : undefined
        }
      />
    </>
  );
}

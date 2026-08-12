import { useEffect, useState } from "react";
import { useRota } from "../hooks/useRota";
import Layout from "./components/Layout";
import Login from "./components/Login";
import EmBreve from "./components/EmBreve";
import Dashboard from "./pages/Dashboard";
import Funil from "./pages/Funil";
import LeadFicha from "./pages/LeadFicha";
import Simulador from "./pages/Simulador";
import { CHAVE_SESSAO, SENHA_PADRAO } from "./data/constantes";
import { repositorio } from "./data/repositorio";
import { useDados } from "./data/useDados";
import type { Configuracao } from "./data/tipos";

// Roteador interno do painel. As rotas são planas (/admin/<tela>) com um único
// parâmetro possível (/admin/leads/:id), então um split de string basta.

function lerSessao(): boolean {
  try {
    return sessionStorage.getItem(CHAVE_SESSAO) === "1";
  } catch {
    return false;
  }
}

export default function AdminApp() {
  const caminho = useRota();
  const [autenticado, setAutenticado] = useState(lerSessao);
  const [busca, setBusca] = useState("");

  // Desliga a rolagem suave da landing e tira o painel dos buscadores.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("admin-ativo");

    const metaRobots = document.querySelector('meta[name="robots"]');
    const robotsAntes = metaRobots?.getAttribute("content") ?? null;
    metaRobots?.setAttribute("content", "noindex, nofollow");

    const tituloAntes = document.title;
    document.title = "Painel FG";

    return () => {
      html.classList.remove("admin-ativo");
      if (metaRobots && robotsAntes) metaRobots.setAttribute("content", robotsAntes);
      document.title = tituloAntes;
    };
  }, []);

  function entrar(senha: string): boolean {
    if (senha !== SENHA_PADRAO) return false;
    try {
      sessionStorage.setItem(CHAVE_SESSAO, "1");
    } catch {
      /* modo privado: segue só em memória */
    }
    setAutenticado(true);
    return true;
  }

  function sair() {
    try {
      sessionStorage.removeItem(CHAVE_SESSAO);
    } catch {
      /* ignora */
    }
    setAutenticado(false);
  }

  if (!autenticado) return <Login onEntrar={entrar} />;

  return (
    <Layout caminho={caminho} onSair={sair} busca={busca} onBusca={setBusca}>
      <Telas caminho={caminho} busca={busca} />
    </Layout>
  );
}

function Telas({ caminho, busca }: { caminho: string; busca: string }) {
  const { dados: config } = useDados<Configuracao | null>(
    "config",
    () => repositorio.obterConfig(),
    null
  );

  const partes = caminho.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  const tela = partes[0] ?? "";
  const parametro = partes[1];

  if (!config) return <div className="card-painel h-40 animate-pulse" />;

  switch (tela) {
    case "":
      return <Dashboard />;
    case "funil":
      return <Funil busca={busca} diasParaEsfriar={config.diasParaEsfriar} />;
    case "leads":
      return parametro ? (
        <LeadFicha leadId={parametro} modoDemo={config.modoDemo} />
      ) : (
        <EmBreve titulo="Leads" subtitulo="Lista completa" />
      );
    case "agenda":
      return <EmBreve titulo="Agenda" subtitulo="Follow-ups combinados" />;
    case "simulador":
      return <Simulador leadIdInicial={parametro} />;
    case "vendas":
      return <EmBreve titulo="Vendas" subtitulo="Adesões fechadas e comissão" />;
    case "equipe":
      return <EmBreve titulo="Equipe" subtitulo="Consultores, metas e permissões" />;
    case "relatorios":
      return <EmBreve titulo="Relatórios" subtitulo="Origem, custo por lead e retorno" />;
    case "integracoes":
      return <EmBreve titulo="Integrações" subtitulo="WhatsApp, anúncios e formulários" />;
    case "config":
      return <EmBreve titulo="Configurações" subtitulo="Taxas, senha e demonstração" />;
    default:
      return <EmBreve titulo="Tela não encontrada" subtitulo={`Nada em /admin/${tela}`} />;
  }
}

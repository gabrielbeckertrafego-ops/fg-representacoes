import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Elo from "./Elo";
import {
  AgendaIcon,
  BuscaIcon,
  CalculadoraIcon,
  EngrenagemIcon,
  FecharIcon,
  FunilIcon,
  MenuIcon,
  PainelIcon,
  PessoaIcon,
  PessoasIcon,
  PlugIcon,
  RelatorioIcon,
  SairIcon,
  VendasIcon,
} from "./IconesAdmin";

// Escala de z-index do painel (a landing usa 40/50/70, mas as duas árvores nunca
// coexistem): sidebar 30, topbar 40, drawer 50, modal 60, toast 70.

interface ItemNav {
  href: string;
  label: string;
  desc: string;
  Icone: (p: React.SVGProps<SVGSVGElement>) => JSX.Element;
}

const NAV: ItemNav[] = [
  { href: "/admin", label: "Painel", desc: "Visão do mês", Icone: PainelIcon },
  { href: "/admin/funil", label: "Funil", desc: "Leads por etapa", Icone: FunilIcon },
  { href: "/admin/leads", label: "Leads", desc: "Lista completa", Icone: PessoaIcon },
  { href: "/admin/agenda", label: "Agenda", desc: "Follow-ups do dia", Icone: AgendaIcon },
  { href: "/admin/simulador", label: "Simulador", desc: "Calcular parcela", Icone: CalculadoraIcon },
  { href: "/admin/vendas", label: "Vendas", desc: "Adesões e comissão", Icone: VendasIcon },
  { href: "/admin/equipe", label: "Equipe", desc: "Consultores e metas", Icone: PessoasIcon },
  { href: "/admin/relatorios", label: "Relatórios", desc: "Origem e custo", Icone: RelatorioIcon },
  { href: "/admin/integracoes", label: "Integrações", desc: "WhatsApp e anúncios", Icone: PlugIcon },
  { href: "/admin/config", label: "Configurações", desc: "Taxas e preferências", Icone: EngrenagemIcon },
];

interface Props {
  caminho: string;
  onSair: () => void;
  busca: string;
  onBusca: (v: string) => void;
  children: ReactNode;
}

function ativo(href: string, caminho: string): boolean {
  return href === "/admin" ? caminho === "/admin" : caminho.startsWith(href);
}

export default function Layout({ caminho, onSair, busca, onBusca, children }: Props) {
  const [menuAberto, setMenuAberto] = useState(false);

  // Fecha o menu ao trocar de tela — senão ele fica aberto por cima do conteúdo.
  useEffect(() => {
    setMenuAberto(false);
  }, [caminho]);

  const navegacao = (
    <nav className="flex flex-1 flex-col gap-0.5 px-3">
      {NAV.map(({ href, label, desc, Icone }) => {
        const atual = ativo(href, caminho);
        return (
          <Elo
            key={href}
            para={href}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
              atual
                ? "bg-gold-500/10 text-white ring-1 ring-inset ring-gold-500/25"
                : "text-graphite-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            {atual && (
              <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-gold-gradient" />
            )}
            <Icone className={`h-5 w-5 shrink-0 ${atual ? "text-gold-400" : ""}`} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold leading-tight">{label}</span>
              <span className="block truncate text-[11px] leading-tight text-graphite-500">
                {desc}
              </span>
            </span>
          </Elo>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink">
      {/* Sidebar fixa (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.06] bg-graphite-900/60 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <img src="/logo-fg.png" alt="" className="h-9 w-auto" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">FG Representações</p>
            <p className="rotulo-painel">Painel interno</p>
          </div>
        </div>
        {navegacao}
        <button
          onClick={onSair}
          className="m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-graphite-400 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <SairIcon className="h-5 w-5" />
          Sair
        </button>
      </aside>

      {/* Drawer (mobile) */}
      {menuAberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fechar menu"
            onClick={() => setMenuAberto(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-white/10 bg-graphite-900">
            <div className="flex items-center justify-between px-5 py-5">
              <img src="/logo-fg.png" alt="" className="h-9 w-auto" />
              <button
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
                className="rounded-lg p-2 text-graphite-400 hover:bg-white/5 hover:text-white"
              >
                <FecharIcon className="h-5 w-5" />
              </button>
            </div>
            {navegacao}
            <button
              onClick={onSair}
              className="m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-graphite-400 hover:bg-white/[0.04] hover:text-white"
            >
              <SairIcon className="h-5 w-5" />
              Sair
            </button>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink/85 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu"
              className="rounded-lg p-2 text-graphite-300 hover:bg-white/5 lg:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            <div className="relative min-w-0 flex-1 sm:max-w-md">
              <BuscaIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-500" />
              <input
                value={busca}
                onChange={(e) => onBusca(e.target.value)}
                placeholder="Buscar lead por nome ou telefone…"
                className="field-sm pl-9"
                aria-label="Buscar lead"
              />
            </div>

            <span className="ml-auto hidden items-center gap-2 rounded-full border border-gold-500/25 bg-gold-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold-300 sm:inline-flex">
              Demonstração
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-[88rem] px-4 pb-20 pt-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

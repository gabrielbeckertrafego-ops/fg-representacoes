import { useEffect, useState } from "react";
import { abrirFormulario } from "../lib/modal";
import { WhatsAppIcon } from "./Icons";

const LINKS = [
  { href: "#segmentos", label: "Modalidades" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#estrutura", label: "A FG" },
  { href: "#equipe", label: "Equipe" },
  { href: "#parceiros", label: "Parceiros" },
  { href: "#faq", label: "Dúvidas" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-ink/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="container-fg flex h-16 items-center justify-between sm:h-20">
        <a href="#topo" className="flex items-center gap-3" aria-label="FG Representações — início">
          <img
            src="/logo-fg.png"
            alt="FG Representações"
            className="h-9 w-auto sm:h-11"
            width={516}
            height={360}
          />
          <span className="hidden text-sm font-semibold leading-tight text-white sm:block">
            FG Representações
            <span className="block font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-gold-400">
              Consórcios
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-graphite-300 transition-colors hover:text-gold-400"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => abrirFormulario()}
            className="btn-whats hidden px-5 py-2.5 text-sm sm:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Fazer simulação
          </button>

          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur lg:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            <span className="relative block h-4 w-5">
              <span className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition-all duration-300 ${open ? "top-1.5 rotate-45" : ""}`} />
              <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-3 h-0.5 w-5 rounded bg-current transition-all duration-300 ${open ? "top-1.5 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        className={`overflow-hidden border-t border-white/10 bg-ink/95 backdrop-blur-md transition-[max-height,opacity] duration-300 lg:hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="container-fg flex flex-col gap-1 py-4">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-medium text-graphite-200 transition-colors hover:bg-white/5 hover:text-gold-400"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              abrirFormulario();
            }}
            className="btn-whats mt-2 w-full"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Fazer simulação no WhatsApp
          </button>
        </nav>
      </div>
    </header>
  );
}

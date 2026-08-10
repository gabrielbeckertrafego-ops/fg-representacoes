import { useEffect, useState } from "react";
import SimForm from "./SimForm";
import { WhatsAppIcon, ShieldIcon } from "./Icons";
import { EVENTO_ABRIR_FORM } from "../lib/modal";
import type { DadosSimulacao } from "../lib/whatsapp";

export default function WhatsAppModal() {
  const [aberto, setAberto] = useState(false);
  const [prefill, setPrefill] = useState<Partial<DadosSimulacao>>({});
  const [render, setRender] = useState(false);

  useEffect(() => {
    const onAbrir = (e: Event) => {
      const detail = (e as CustomEvent).detail as Partial<DadosSimulacao>;
      setPrefill(detail || {});
      setRender(true);
      // aguarda o próximo frame para animar a entrada
      requestAnimationFrame(() => setAberto(true));
    };
    window.addEventListener(EVENTO_ABRIR_FORM, onAbrir);
    return () => window.removeEventListener(EVENTO_ABRIR_FORM, onAbrir);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
    };
    if (render) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [render]);

  function fechar() {
    setAberto(false);
    window.setTimeout(() => setRender(false), 250);
  }

  if (!render) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Formulário de simulação de consórcio"
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
    >
      {/* Overlay */}
      <button
        aria-label="Fechar"
        onClick={fechar}
        className={`absolute inset-0 bg-ink/80 backdrop-blur-sm transition-opacity duration-300 ${
          aberto ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Painel */}
      <div
        className={`relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-night shadow-2xl transition-all duration-300 sm:m-4 sm:max-h-[90dvh] sm:rounded-3xl ${
          aberto ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold-500/20 blur-2xl" />

        {/* Header do modal */}
        <div className="relative flex flex-none items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
          <div>
            <span className="eyebrow mb-2.5">
              <ShieldIcon className="h-4 w-4" /> Simulação gratuita
            </span>
            <h3 className="text-lg font-bold text-white sm:text-xl">
              Fale com a <span className="text-gold-gradient">FG</span>
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-graphite-400 sm:text-sm">
              <WhatsAppIcon className="h-4 w-4 flex-none text-[#25D366]" />
              Sua mensagem vai pronta para o WhatsApp
            </p>
          </div>
          <button
            onClick={fechar}
            aria-label="Fechar formulário"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-white/10 bg-white/5 text-graphite-300 transition hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Corpo */}
        <div className="relative min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <SimForm prefill={prefill} onEnviar={fechar} />
        </div>
      </div>
    </div>
  );
}

import { useGsapReveal } from "../hooks/useGsapReveal";
import { abrirFormulario } from "../lib/modal";
import { WhatsAppIcon, CheckIcon } from "./Icons";

const VANTAGENS = [
  "Resposta rápida no seu WhatsApp",
  "Simulação gratuita e sem compromisso",
  "Atendimento humano de verdade",
];

export default function FormWhatsApp() {
  const scope = useGsapReveal<HTMLElement>();

  return (
    <section id="contato" ref={scope} className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-fg">
        <div
          data-reveal
          className="grain relative overflow-hidden rounded-3xl border border-gold-500/20 bg-gradient-to-br from-night to-graphite-900 p-8 text-center shadow-soft sm:p-14"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold-500/20 blur-2xl" />

          <div className="relative mx-auto max-w-2xl">
            <span className="eyebrow">Comece agora</span>
            <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Pronto para realizar seu{" "}
              <span className="text-gold-gradient">próximo objetivo?</span>
            </h2>
            <p className="mt-4 text-graphite-300">
              Faça sua simulação em menos de um minuto. Você preenche, a gente
              responde no WhatsApp com a melhor opção para o seu momento.
            </p>

            <div className="mt-8 flex justify-center">
              <button onClick={() => abrirFormulario()} className="btn-whats px-8 py-4 text-base">
                <WhatsAppIcon className="h-5 w-5" />
                Fazer minha simulação
              </button>
            </div>

            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {VANTAGENS.map((v) => (
                <li key={v} className="flex items-center gap-2 text-sm text-graphite-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-gradient text-graphite-900">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

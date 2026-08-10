import { useGsapReveal } from "../hooks/useGsapReveal";

const PARCEIROS = [
  { nome: "Banco do Brasil", src: "/parceiros/banco-do-brasil.png", cls: "h-14 sm:h-16" },
  { nome: "Itaú", src: "/parceiros/itau.png", cls: "h-9 sm:h-11" },
  { nome: "Porto Seguro", src: "/parceiros/porto-seguro.png", cls: "h-14 sm:h-16" },
  { nome: "Embracon", src: "/parceiros/embracon.png", cls: "h-14 sm:h-16" },
];

export default function Parceiros() {
  const scope = useGsapReveal<HTMLElement>();

  return (
    <section id="parceiros" ref={scope} className="scroll-mt-24 py-20 sm:py-24">
      <div className="container-fg">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <span className="eyebrow">Parceiros</span>
          <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            Segurança de quem trabalha com os{" "}
            <span className="text-gold-gradient">maiores</span>
          </h2>
          <p className="mt-4 text-graphite-400">
            Trabalhamos ao lado de administradoras sólidas e reguladas pelo Banco
            Central, garantindo tranquilidade em todo o seu plano.
          </p>
        </div>

        <div
          data-reveal
          className="mt-12 grid grid-cols-2 divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] sm:divide-x lg:grid-cols-4"
        >
          {PARCEIROS.map((p) => (
            <div
              key={p.nome}
              className="group flex items-center justify-center px-6 py-10 transition-colors duration-300 hover:bg-white/[0.04]"
            >
              <img
                src={p.src}
                alt={`Logo ${p.nome}`}
                loading="lazy"
                className={`${p.cls} w-auto object-contain opacity-70 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

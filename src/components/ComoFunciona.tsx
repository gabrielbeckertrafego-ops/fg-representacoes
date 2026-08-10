import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PASSOS = [
  {
    n: "01",
    titulo: "Escolha seu plano",
    texto:
      "A gente entende seu objetivo e monta a simulação ideal: valor da carta, prazo e parcela que cabem no seu orçamento.",
  },
  {
    n: "02",
    titulo: "Adesão ao grupo",
    texto:
      "Você entra em um grupo de pessoas com o mesmo objetivo, junto a administradoras sólidas e reguladas pelo Banco Central.",
  },
  {
    n: "03",
    titulo: "Contemplação",
    texto:
      "Todo mês há contemplações por sorteio e por lance. Quer antecipar? A gente te orienta na melhor estratégia de lance.",
  },
  {
    n: "04",
    titulo: "Use seu crédito",
    texto:
      "Contemplado, você recebe a carta e realiza a compra do seu bem ou usa o crédito da forma que planejou.",
  },
];

export default function ComoFunciona() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".passo",
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".passos-grid", start: "top 80%" },
        }
      );
      gsap.fromTo(
        ".linha-progresso",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.1,
          ease: "power2.out",
          transformOrigin: "left center",
          scrollTrigger: { trigger: ".passos-grid", start: "top 78%", once: true },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="como-funciona"
      ref={root}
      className="scroll-mt-24 bg-graphite-900 py-20 text-white sm:py-28"
    >
      <div className="container-fg">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow border-gold-700/40 bg-white/5 text-gold-300">
            Como funciona
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
            Simples do <span className="text-gold-gradient">começo ao fim</span>
          </h2>
          <p className="mt-4 text-graphite-300">
            Sem burocracia e com acompanhamento de verdade. Você cuida do sonho,
            a FG cuida do processo.
          </p>
        </div>

        <div className="passos-grid relative mt-16">
          {/* Linha base + progresso (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden lg:block">
            <div className="h-px w-full bg-white/10" />
            <div className="linha-progresso h-px w-full -translate-y-px bg-gold-gradient" />
          </div>

          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {PASSOS.map((p) => (
              <li key={p.n} className="passo relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-gold-500/40 bg-graphite-800 font-display text-lg font-bold text-gold-gradient">
                  {p.n}
                </div>
                <h3 className="text-lg font-bold text-white">{p.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite-300">
                  {p.texto}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { abrirFormulario } from "../lib/modal";
import { WhatsAppIcon, ShieldIcon, CheckIcon } from "./Icons";

const DESTAQUES = ["Sem juros", "Parcelas que cabem no bolso", "Crédito planejado"];

export default function Hero() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".hero-eyebrow", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
        .fromTo(
          ".hero-line",
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.12 },
          "-=0.2"
        )
        .fromTo(".hero-sub", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.4")
        .fromTo(".hero-cta", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, "-=0.3")
        .fromTo(".hero-chip", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 }, "-=0.3")
        .fromTo(".hero-card", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, "-=0.7")
        .fromTo(
          ".hero-badge",
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.8)" },
          "-=0.4"
        );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="topo"
      ref={root}
      className="grain relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24"
    >
      {/* Fundo decorativo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-[-10%] h-[38rem] w-[38rem] rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] h-[30rem] w-[30rem] rounded-full bg-gold-600/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/0 via-ink/0 to-ink" />
      </div>

      <div className="container-fg grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="hero-eyebrow eyebrow">
            <ShieldIcon className="h-4 w-4" /> Consórcios para todo o Brasil
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.03] text-white sm:text-5xl lg:text-[3.9rem]">
            <span className="block overflow-hidden">
              <span className="hero-line block">Conquiste seu bem</span>
            </span>
            <span className="block overflow-hidden">
              <span className="hero-line block">
                com <span className="text-gold-gradient">crédito planejado</span>
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="hero-line block">e sem juros.</span>
            </span>
          </h1>

          <p className="hero-sub mt-6 max-w-xl text-base leading-relaxed text-graphite-400 sm:text-lg">
            Imóveis, veículos, pesados, construção, capital de giro e alavancagem
            patrimonial. A FG Representações conecta você às maiores administradoras
            do país e cuida de tudo, do primeiro contato à contemplação.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button onClick={() => abrirFormulario()} className="hero-cta btn-whats w-full sm:w-auto">
              <WhatsAppIcon className="h-5 w-5" />
              Simular no WhatsApp
            </button>
            <a href="#segmentos" className="hero-cta btn-outline w-full sm:w-auto">
              Ver modalidades
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {DESTAQUES.map((d) => (
              <li key={d} className="hero-chip flex items-center gap-2 text-sm font-medium text-graphite-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
                  <CheckIcon className="h-3 w-3" />
                </span>
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Cartão visual */}
        <div className="relative">
          <div className="hero-card card relative overflow-hidden p-2">
            <img
              src="/escritorio/escritorio-1.jpg"
              alt="Escritório da FG Representações"
              className="aspect-[4/3] w-full rounded-xl object-cover"
              loading="eager"
              width={1600}
              height={1200}
            />
            <div className="absolute inset-2 rounded-xl bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          </div>

          {/* Selo flutuante */}
          <div className="hero-badge absolute -left-3 bottom-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-night/90 px-4 py-3 shadow-gold backdrop-blur sm:-left-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-gradient text-graphite-900">
              <ShieldIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none text-white">Parceiros oficiais</p>
              <p className="mt-1 text-xs text-graphite-400">BB · Itaú · Porto Seguro · Embracon</p>
            </div>
          </div>

          <div className="hero-badge absolute -right-2 -top-4 rotate-2 rounded-2xl border border-white/10 bg-night px-4 py-3 shadow-soft sm:-right-6">
            <p className="text-2xl font-bold leading-none text-gold-gradient">100%</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-graphite-400">
              atendimento humano
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

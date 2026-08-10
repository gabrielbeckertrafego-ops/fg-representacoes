import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckIcon } from "./Icons";

gsap.registerPlugin(ScrollTrigger);

const FOTOS = [
  { src: "/escritorio/escritorio-2.jpg", alt: "Recepção da FG Representações com logo em destaque", span: "sm:col-span-2 sm:row-span-2" },
  { src: "/escritorio/escritorio-5.jpg", alt: "Ambiente de atendimento da FG", span: "" },
  { src: "/escritorio/escritorio-3.jpg", alt: "Sala de reuniões da FG Representações", span: "" },
  { src: "/escritorio/escritorio-7.jpg", alt: "Espaço de trabalho da equipe FG", span: "sm:col-span-2" },
];

const PILARES = [
  "Estrutura física para receber você com conforto",
  "Consultores dedicados do início à contemplação",
  "Transparência total em cada etapa do seu plano",
];

export default function Estrutura() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gal-item",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ".galeria", start: "top 82%" },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="estrutura" ref={root} className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-fg grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <span className="eyebrow">A FG Representações</span>
          <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            Gente de verdade, <span className="text-gold-gradient">perto de você</span>
          </h2>
          <p className="mt-4 text-graphite-400">
            Mais do que vender cotas, a FG Representações constrói relações de
            confiança. Nossa estrutura foi pensada para atender cada cliente com
            atenção e cuidado, orientando a melhor decisão para o seu momento.
          </p>
          <ul className="mt-8 space-y-4">
            {PILARES.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gold-gradient text-graphite-900">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span className="text-graphite-200">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="galeria grid auto-rows-[150px] grid-cols-2 gap-4 sm:auto-rows-[180px]">
          {FOTOS.map((f) => (
            <figure
              key={f.src}
              className={`gal-item group relative overflow-hidden rounded-2xl shadow-soft ${f.span}`}
            >
              <img
                src={f.src}
                alt={f.alt}
                loading="lazy"
                className="gal-img h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-graphite-900/25 to-transparent" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

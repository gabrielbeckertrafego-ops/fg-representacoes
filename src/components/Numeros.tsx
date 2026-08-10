import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// NOTA (FG): ajuste estes números para os dados reais da empresa.
const METRICAS = [
  { valor: 8, sufixo: "+", label: "Anos de experiência no mercado" },
  { valor: 500, sufixo: "+", label: "Famílias e empresas atendidas" },
  { valor: 4, sufixo: "", label: "Administradoras parceiras" },
  { valor: 100, sufixo: "%", label: "Atendimento humano e próximo" },
];

export default function Numeros() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const nums = gsap.utils.toArray<HTMLElement>(".metrica-num");

      nums.forEach((el) => {
        const alvo = Number(el.dataset.valor || "0");
        if (reduce) {
          el.textContent = String(alvo);
          return;
        }
        const obj = { v: 0 };
        gsap.to(obj, {
          v: alvo,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(obj.v).toString();
          },
        });
      });

      if (!reduce) {
        gsap.from(".metrica", {
          opacity: 0,
          y: 30,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: root.current, start: "top 80%" },
        });
      }
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="py-16 sm:py-20">
      <div className="container-fg">
        <div className="card grid gap-8 rounded-3xl p-8 sm:grid-cols-2 sm:p-12 lg:grid-cols-4">
          {METRICAS.map((m) => (
            <div key={m.label} className="metrica text-center">
              <div className="font-display text-4xl font-bold sm:text-5xl">
                <span className="metrica-num text-gold-gradient" data-valor={m.valor}>
                  0
                </span>
                <span className="text-gold-gradient">{m.sufixo}</span>
              </div>
              <p className="mx-auto mt-3 max-w-[12rem] text-sm text-graphite-400">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

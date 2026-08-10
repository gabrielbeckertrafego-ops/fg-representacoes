import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Revela os filhos com [data-reveal] em cascata quando a seção entra na viewport.
 * Respeita prefers-reduced-motion automaticamente (via gsap.matchMedia).
 */
export function useGsapReveal<T extends HTMLElement = HTMLElement>() {
  const scope = useRef<T | null>(null);

  useEffect(() => {
    const el = scope.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        reduced: "(prefers-reduced-motion: reduce)",
        normal: "(prefers-reduced-motion: no-preference)",
      },
      (ctx) => {
        const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
        if (targets.length === 0) return;

        if (ctx.conditions?.reduced) {
          gsap.set(targets, { opacity: 1, y: 0, clearProps: "all" });
          return;
        }

        gsap.set(targets, { opacity: 0, y: 20 });
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
          },
        });
      }
    );

    return () => mm.revert();
  }, []);

  return scope;
}

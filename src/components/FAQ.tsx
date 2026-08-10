import { useRef, useState } from "react";
import { useGsapReveal } from "../hooks/useGsapReveal";
import { abrirFormulario } from "../lib/modal";
import { PlusIcon, WhatsAppIcon } from "./Icons";

const PERGUNTAS = [
  {
    q: "O que é consórcio, afinal?",
    a: "Consórcio é uma compra planejada e em grupo. Um conjunto de pessoas com o mesmo objetivo se une, e todos contribuem mensalmente para formar um fundo comum. A cada período, integrantes são contemplados e recebem uma carta de crédito para adquirir o bem ou serviço desejado.",
  },
  {
    q: "Consórcio tem juros?",
    a: "Não. Diferente do financiamento, o consórcio não cobra juros. Você paga apenas uma taxa de administração diluída nas parcelas, o que torna o custo total muito menor. É a forma mais econômica de planejar uma compra de valor alto.",
  },
  {
    q: "Quando eu sou contemplado?",
    a: "As contemplações acontecem mensalmente, por sorteio e por lance. No sorteio, todos concorrem em igualdade. No lance, quem oferece antecipar parcelas pode ser contemplado mais cedo. A FG te orienta na melhor estratégia para acelerar sua contemplação.",
  },
  {
    q: "Posso dar um lance para antecipar?",
    a: "Sim! O lance é uma oferta de antecipação de parcelas para aumentar suas chances de ser contemplado antes. Existem diferentes tipos de lance, e nós ajudamos você a montar a estratégia ideal de acordo com o seu orçamento.",
  },
  {
    q: "Qual a diferença entre consórcio e financiamento?",
    a: "No financiamento você leva o bem na hora, mas paga juros altos. No consórcio você planeja a compra sem juros, com parcelas menores, e é contemplado por sorteio ou lance. É ideal para quem não tem pressa imediata e quer economizar bastante no longo prazo.",
  },
  {
    q: "Preciso de entrada?",
    a: "Não é necessário dar entrada para aderir a um consórcio. Você começa a pagar as parcelas mensais e, ao ser contemplado, recebe o crédito integral para realizar sua compra.",
  },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <div data-reveal className="card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-white">{q}</span>
        <span
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gold-500/10 text-gold-400 transition-transform duration-300 ${
            open ? "rotate-45 bg-gold-gradient text-graphite-900" : ""
          }`}
        >
          <PlusIcon className="h-4 w-4" />
        </span>
      </button>
      <div
        style={{ maxHeight: open ? `${ref.current?.scrollHeight ?? 0}px` : "0px" }}
        className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
      >
        <div ref={ref} className="px-6 pb-5 text-sm leading-relaxed text-graphite-400">
          {a}
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const scope = useGsapReveal<HTMLElement>();

  return (
    <section id="faq" ref={scope} className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-fg grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div data-reveal className="lg:sticky lg:top-28 lg:self-start">
          <span className="eyebrow">Dúvidas frequentes</span>
          <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            Tudo o que você <span className="text-gold-gradient">precisa saber</span>
          </h2>
          <p className="mt-4 text-graphite-400">
            Ainda com dúvidas? Fale com um consultor da FG — respondemos tudo pelo
            WhatsApp, sem compromisso.
          </p>
          <button onClick={() => abrirFormulario()} className="btn-whats mt-6">
            <WhatsAppIcon className="h-5 w-5" />
            Tirar minhas dúvidas
          </button>
        </div>

        <div className="space-y-4">
          {PERGUNTAS.map((p) => (
            <Item key={p.q} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}

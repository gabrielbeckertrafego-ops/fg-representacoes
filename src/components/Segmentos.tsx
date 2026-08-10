import { useGsapReveal } from "../hooks/useGsapReveal";
import { abrirFormulario } from "../lib/modal";
import {
  HomeIcon,
  CarIcon,
  TruckIcon,
  BuildingIcon,
  CashIcon,
  GrowthIcon,
  ArrowIcon,
} from "./Icons";
import type { ComponentType, SVGProps } from "react";

interface Seg {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  titulo: string;
  texto: string;
  destaque?: boolean;
}

const SEGMENTOS: Seg[] = [
  {
    icon: HomeIcon,
    titulo: "Imóveis",
    texto:
      "Casa, apartamento, terreno ou sala comercial. Use a carta para comprar, quitar ou reformar — sem entrada e sem juros.",
    destaque: true,
  },
  {
    icon: CarIcon,
    titulo: "Automóveis",
    texto:
      "Carros, motos e utilitários, zero ou seminovos. Planeje a troca do seu veículo com parcelas leves.",
  },
  {
    icon: TruckIcon,
    titulo: "Pesados & Máquinas",
    texto:
      "Caminhões, tratores, implementos e máquinas agrícolas para fazer sua operação crescer.",
  },
  {
    icon: BuildingIcon,
    titulo: "Construção",
    texto:
      "Construa ou amplie do jeito certo. Crédito para material, mão de obra e obra completa.",
  },
  {
    icon: CashIcon,
    titulo: "Capital de Giro",
    texto:
      "Fôlego financeiro para o seu negócio com custo muito menor que o do crédito bancário tradicional.",
  },
  {
    icon: GrowthIcon,
    titulo: "Alavancagem Patrimonial",
    texto:
      "Multiplique seu patrimônio de forma inteligente, usando o consórcio como estratégia de investimento.",
  },
];

export default function Segmentos() {
  const scope = useGsapReveal<HTMLElement>();

  return (
    <section id="segmentos" ref={scope} className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-fg">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <span className="eyebrow">Modalidades</span>
          <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            Um plano para cada <span className="text-gold-gradient">objetivo</span>
          </h2>
          <p className="mt-4 text-graphite-400">
            Seja para realizar um sonho ou impulsionar o seu negócio, existe um
            consórcio ideal. Escolha o que faz sentido para você.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SEGMENTOS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.titulo}
                onClick={() => abrirFormulario({ modalidade: s.titulo })}
                data-reveal
                className="group card relative flex flex-col items-start p-7 text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-500/40 hover:bg-white/[0.06] hover:shadow-gold"
              >
                <span
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                    s.destaque
                      ? "bg-gold-gradient text-graphite-900"
                      : "bg-gold-500/10 text-gold-400 group-hover:bg-gold-gradient group-hover:text-graphite-900"
                  }`}
                >
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="text-lg font-bold text-white">{s.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite-400">
                  {s.texto}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400">
                  Simular
                  <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

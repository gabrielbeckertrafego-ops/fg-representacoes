import { useGsapReveal } from "../hooks/useGsapReveal";
import { abrirFormulario } from "../lib/modal";
import { WhatsAppIcon } from "./Icons";

// NOTA (FG): assim que tiver os nomes, basta preencher o campo `nome`.
// Deixando "" o card mostra apenas o cargo — nada quebra.
const ESPECIALISTAS = [
  { foto: "/equipe/especialista-1.jpg", nome: "", cargo: "Especialista em Consórcio" },
  { foto: "/equipe/especialista-2.jpg", nome: "", cargo: "Especialista em Consórcio" },
  { foto: "/equipe/especialista-3.jpg", nome: "", cargo: "Especialista em Consórcio" },
  { foto: "/equipe/especialista-4.jpg", nome: "", cargo: "Especialista em Consórcio" },
  { foto: "/equipe/especialista-5.jpg", nome: "", cargo: "Especialista em Consórcio" },
  { foto: "/equipe/especialista-6.jpg", nome: "", cargo: "Especialista em Consórcio" },
];

const MARCOS = [
  { valor: "15 anos", label: "dedicados ao consórcio" },
  { valor: "3 anos", label: "à frente da FG" },
  { valor: "Equipes", label: "formadas e lideradas" },
];

export default function Equipe() {
  const scope = useGsapReveal<HTMLElement>();

  return (
    <section id="equipe" ref={scope} className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-fg">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <span className="eyebrow">Especialistas</span>
          <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            Quem vai cuidar do{" "}
            <span className="text-gold-gradient">seu plano</span>
          </h2>
          <p className="mt-4 text-graphite-400">
            Aqui você não fala com um robô nem com um número de protocolo. Você é
            atendido por especialistas que acompanham cada etapa, da simulação à
            contemplação.
          </p>
        </div>

        {/* Diretora */}
        <div
          data-reveal
          className="card mt-14 overflow-hidden rounded-3xl p-5 sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-12">
            <figure className="relative mx-auto w-full max-w-sm">
              <div className="absolute -inset-3 -z-10 rounded-[28px] bg-gold-gradient opacity-20 blur-2xl" />
              <img
                src="/equipe/priscila-correa.jpg"
                alt="Priscila Correa, diretora da FG Representações"
                width={900}
                height={1200}
                loading="lazy"
                className="w-full rounded-3xl border border-gold-500/20 object-cover shadow-soft"
              />
              <figcaption className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-ink/75 px-4 py-3 backdrop-blur-md">
                <p className="font-display text-base font-bold text-white">
                  Priscila Correa
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
                  Diretora
                </p>
              </figcaption>
            </figure>

            <div>
              <span className="eyebrow">A história por trás da FG</span>
              <h3 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
                Prazer, eu sou a{" "}
                <span className="text-gold-gradient">Priscila</span>
              </h3>

              <div className="mt-5 space-y-4 text-graphite-300">
                <p>
                  Há 15 anos escolhi o consórcio como profissão e, desde então,
                  construí minha trajetória com trabalho, dedicação e propósito.
                </p>
                <p>
                  Passei por diferentes administradoras, ganhei experiência,
                  enfrentei desafios e tive a oportunidade de liderar equipes como
                  supervisora. Foi nesse caminho que aprendi o que realmente
                  sustenta um resultado:{" "}
                  <strong className="font-semibold text-graphite-100">
                    confiança e compromisso
                  </strong>
                  .
                </p>
                <p>
                  Há 3 anos vivo um dos momentos mais importantes da minha
                  carreira: estar à frente da minha própria representação, a FG.
                  Cada cliente atendido, cada conquista e cada sonho realizado
                  confirmam que fiz a escolha certa.
                </p>
                <p>
                  Sucesso não acontece por acaso. Ele vem da constância, da ética e
                  da vontade de fazer diferença na vida das pessoas. Essa é a minha
                  história — e o melhor dela ainda está sendo escrito.
                </p>
              </div>

              <dl className="mt-8 grid gap-4 sm:grid-cols-3">
                {MARCOS.map((m) => (
                  <div
                    key={m.valor}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                  >
                    <dt className="font-display text-xl font-bold text-gold-gradient">
                      {m.valor}
                    </dt>
                    <dd className="mt-1 text-sm text-graphite-400">{m.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Time */}
        <div className="mt-16" data-reveal>
          <h3 className="text-center font-display text-xl font-bold text-white sm:text-2xl">
            O time que atende você
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-center text-graphite-400">
            Consultores treinados para entender o seu objetivo e montar o plano que
            cabe no seu bolso.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
            {ESPECIALISTAS.map((e) => (
              <figure
                key={e.foto}
                className="group relative overflow-hidden rounded-2xl border border-white/10 shadow-soft"
              >
                <img
                  src={e.foto}
                  alt={
                    e.nome
                      ? `${e.nome}, ${e.cargo.toLowerCase()} na FG Representações`
                      : "Especialista em consórcio da FG Representações"
                  }
                  width={900}
                  height={1200}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent opacity-90" />
                <figcaption className="absolute inset-x-0 bottom-0 p-4">
                  {e.nome && (
                    <p className="font-display text-sm font-bold text-white sm:text-base">
                      {e.nome}
                    </p>
                  )}
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-400 sm:text-xs">
                    {e.cargo}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Foto do time completo */}
        <figure
          data-reveal
          className="relative mt-10 overflow-hidden rounded-3xl border border-white/10 shadow-soft"
        >
          <img
            src="/equipe/equipe-fg.jpg"
            alt="Equipe completa da FG Representações reunida no escritório"
            width={1800}
            height={1205}
            loading="lazy"
            className="aspect-[3/2] w-full object-cover object-top sm:aspect-[16/9]"
          />
          {/* No mobile a legenda fica abaixo da foto; no desktop, sobreposta. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-3/5 bg-gradient-to-t from-ink via-ink/60 to-transparent sm:block" />
          <figcaption className="bg-graphite-900 p-5 sm:absolute sm:inset-x-0 sm:bottom-0 sm:bg-transparent sm:p-8">
            <p className="font-display text-lg font-bold text-white sm:text-2xl">
              Uma equipe inteira à disposição do{" "}
              <span className="text-gold-gradient">seu objetivo</span>
            </p>
            <p className="mt-1 text-sm text-graphite-300 sm:text-base">
              FG Representações — atendimento humano, do primeiro contato à carta
              de crédito.
            </p>
          </figcaption>
        </figure>

        <div className="mt-10 text-center" data-reveal>
          <button onClick={() => abrirFormulario()} className="btn-whats">
            <WhatsAppIcon className="h-5 w-5" />
            Falar com um especialista
          </button>
        </div>
      </div>
    </section>
  );
}

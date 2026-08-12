import { abrirFormulario } from "../lib/modal";
import { WhatsAppIcon } from "./Icons";

const LINKS = [
  { href: "#segmentos", label: "Modalidades" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#estrutura", label: "A FG" },
  { href: "#equipe", label: "Equipe" },
  { href: "#parceiros", label: "Parceiros" },
  { href: "#faq", label: "Dúvidas" },
  { href: "#contato", label: "Simular" },
];

export default function Footer() {

  return (
    <footer className="border-t border-graphite-800 bg-graphite-900 text-graphite-300">
      <div className="container-fg py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <img
              src="/logo-fg.png"
              alt="FG Representações"
              className="h-12 w-auto"
              width={516}
              height={360}
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-graphite-400">
              FG Representações — consórcios para imóveis, veículos, pesados,
              construção e crédito. Realizando planos com segurança e atendimento
              humano em todo o Brasil.
            </p>
            <p className="mt-4 text-sm text-graphite-500">
              CNPJ 50.002.597/0001-81
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Navegação
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="transition-colors hover:text-gold-400">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Contato
            </h3>
            <p className="mt-4 text-sm text-graphite-400">
              Atendimento em todo o Brasil, de segunda a sábado.
            </p>
            <button onClick={() => abrirFormulario()} className="btn-whats mt-5">
              <WhatsAppIcon className="h-5 w-5" />
              Falar agora
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-graphite-800 pt-6 text-xs text-graphite-500 sm:flex-row">
          <p>© {new Date().getFullYear()} FG Representações. Todos os direitos reservados.</p>
          <p>
            Consórcio é regulamentado e fiscalizado pelo Banco Central do Brasil.
          </p>
        </div>
      </div>
    </footer>
  );
}

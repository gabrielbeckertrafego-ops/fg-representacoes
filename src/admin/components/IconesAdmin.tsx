import type { SVGProps } from "react";

// Mesma assinatura dos ícones do site (src/components/Icons.tsx): traço de 1.6,
// viewBox 24, currentColor. Os 6 ícones de modalidade (Home, Car, Truck, Building,
// Cash, Growth) já existem lá e são reaproveitados — não redesenhar.

type P = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const PainelIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const FunilIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />
  </svg>
);

export const PessoasIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />
    <circle cx="9.5" cy="7" r="3.2" />
    <path d="M21 20v-1.5a4 4 0 0 0-3-3.87" />
    <path d="M16.5 4.2a3.2 3.2 0 0 1 0 5.6" />
  </svg>
);

export const PessoaIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M19 20v-1.5a5 5 0 0 0-5-5h-4a5 5 0 0 0-5 5V20" />
    <circle cx="12" cy="7" r="3.5" />
  </svg>
);

export const VendasIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 19V9m5 10V5m5 14v-7m5 7V8" />
    <path d="M3 21h18" />
  </svg>
);

export const CalculadoraIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
    <path d="M8 7h8" />
    <path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01" />
  </svg>
);

export const PlugIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 3v6M15 3v6" />
    <path d="M6 9h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6V9Z" />
    <path d="M12 18v3" />
  </svg>
);

export const RelatorioIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M14 2.5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5L14 2.5Z" />
    <path d="M14 2.5v5h5" />
    <path d="M9 13h6M9 17h4" />
  </svg>
);

export const AgendaIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

export const EngrenagemIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
  </svg>
);

export const BuscaIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const FiltroIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 5h16M7 12h10M10 19h4" />
  </svg>
);

export const SairIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M15 17v1.5a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 4 18.5v-13A2.5 2.5 0 0 1 6.5 3h6A2.5 2.5 0 0 1 15 5.5V7" />
    <path d="M10 12h11m0 0-3-3m3 3-3 3" />
  </svg>
);

export const MenuIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const FecharIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const ChevronIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export const TelefoneIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6.5 3h2l1.5 4-2 1.3a12 12 0 0 0 5.7 5.7l1.3-2 4 1.5v2a2.5 2.5 0 0 1-2.7 2.5A16.5 16.5 0 0 1 4 6.7 2.5 2.5 0 0 1 6.5 3Z" />
  </svg>
);

export const EmailIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
);

export const RelogioIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.2 1.9" />
  </svg>
);

export const AlertaIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3.5 2.5 20h19L12 3.5Z" />
    <path d="M12 10v4M12 17.2h.01" />
  </svg>
);

export const LapisIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16v4Z" />
    <path d="m14.5 5.5 4 4" />
  </svg>
);

export const LixeiraIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 6.5h16M9.5 6.5V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
    <path d="M6.5 6.5 7.4 20a1.5 1.5 0 0 0 1.5 1.4h6.2A1.5 1.5 0 0 0 16.6 20l.9-13.5" />
  </svg>
);

export const RaioIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M13 2 4.5 13.5H11L9.5 22 19 10.5h-6.5L13 2Z" />
  </svg>
);

export const AlvoIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

export const CopiarIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2.5" />
    <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
  </svg>
);

export const MoverIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="6" r="1.1" fill="currentColor" />
    <circle cx="9" cy="12" r="1.1" fill="currentColor" />
    <circle cx="9" cy="18" r="1.1" fill="currentColor" />
    <circle cx="15" cy="6" r="1.1" fill="currentColor" />
    <circle cx="15" cy="12" r="1.1" fill="currentColor" />
    <circle cx="15" cy="18" r="1.1" fill="currentColor" />
  </svg>
);

export const CadeadoIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="4.5" y="10" width="15" height="11" rx="2.5" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
  </svg>
);

import type { ReactNode } from "react";

interface Props {
  cor: string;
  children: ReactNode;
  className?: string;
}

/** Etiqueta colorida (etapa, origem, situação). A cor vem dos dados, então é
 *  aplicada inline — Tailwind não gera classe para valor dinâmico. */
export default function Badge({ cor, children, className = "" }: Props) {
  return (
    <span
      className={`badge ${className}`}
      style={{ backgroundColor: `${cor}1f`, color: cor, border: `1px solid ${cor}33` }}
    >
      {children}
    </span>
  );
}

import type { MouseEvent, ReactNode } from "react";
import { navegar } from "../../lib/rota";

interface Props {
  para: string;
  className?: string;
  titulo?: string;
  children: ReactNode;
}

/** Link interno do painel. É <a> de verdade: cmd+clique e botão do meio continuam
 *  abrindo em nova aba, o que um <button onClick={navegar}> quebraria. */
export default function Elo({ para, className, titulo, children }: Props) {
  function aoClicar(e: MouseEvent<HTMLAnchorElement>) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navegar(para);
  }

  return (
    <a href={para} onClick={aoClicar} className={className} title={titulo}>
      {children}
    </a>
  );
}

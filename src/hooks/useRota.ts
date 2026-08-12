import { useEffect, useState } from "react";
import { EVENTO_ROTA, caminhoAtual } from "../lib/rota";

/** Devolve o caminho atual e re-renderiza quando ele muda (botão voltar incluso). */
export function useRota(): string {
  const [caminho, setCaminho] = useState(caminhoAtual);

  useEffect(() => {
    const atualizar = () => setCaminho(caminhoAtual());
    window.addEventListener("popstate", atualizar);
    window.addEventListener(EVENTO_ROTA, atualizar);
    return () => {
      window.removeEventListener("popstate", atualizar);
      window.removeEventListener(EVENTO_ROTA, atualizar);
    };
  }, []);

  return caminho;
}

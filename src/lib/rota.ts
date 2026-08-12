// Roteador mínimo do projeto.
//
// Por que caseiro e não react-router: a decisão de rota mora no chunk de entrada,
// o mesmo que a landing baixa. Um router pronto custaria ~15 KB gzip no caminho
// crítico do tráfego pago para servir uma rota que quase nenhum visitante abre.
// São 11 telas planas e um /:id — history.pushState + popstate dão conta.
//
// Mesmo padrão de barramento por evento que lib/modal.ts já usa.

export const EVENTO_ROTA = "fg:rota";

/** Caminho atual sem barra no fim ("/admin/leads/" vira "/admin/leads"). */
export function caminhoAtual(): string {
  const caminho = window.location.pathname;
  return caminho.length > 1 ? caminho.replace(/\/+$/, "") : caminho;
}

export function navegar(destino: string, substituir = false): void {
  if (destino === caminhoAtual()) return;
  if (substituir) window.history.replaceState({}, "", destino);
  else window.history.pushState({}, "", destino);
  window.dispatchEvent(new Event(EVENTO_ROTA));
  window.scrollTo(0, 0);
}

import type { DadosSimulacao } from "./whatsapp";

export const EVENTO_ABRIR_FORM = "fg:abrir-form";

/**
 * Abre o pop-up de simulação em qualquer lugar do site.
 * Opcionalmente pré-preenche a modalidade escolhida.
 */
export function abrirFormulario(prefill: Partial<DadosSimulacao> = {}): void {
  window.dispatchEvent(new CustomEvent(EVENTO_ABRIR_FORM, { detail: prefill }));
}

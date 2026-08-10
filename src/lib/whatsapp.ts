// Número oficial da FG Representações (formato internacional, sem símbolos).
export const WHATSAPP_NUMERO = "5551995336879";

export interface DadosSimulacao {
  nome?: string;
  modalidade?: string;
  valor?: string;
  mensagem?: string;
}

/**
 * Monta a mensagem pré-formatada e devolve o link wa.me.
 * Ao abrir, o WhatsApp já vem com o texto pronto para o cliente enviar.
 */
export function montarLinkWhatsApp(dados: DadosSimulacao = {}): string {
  const linhas: string[] = ["Olá! Vim pelo site da FG Representações."];

  if (dados.nome) linhas.push(`\n*Nome:* ${dados.nome}`);
  if (dados.modalidade) linhas.push(`*Tenho interesse em:* ${dados.modalidade}`);
  if (dados.valor) linhas.push(`*Valor de crédito desejado:* ${dados.valor}`);
  if (dados.mensagem) linhas.push(`\n${dados.mensagem}`);

  if (!dados.nome && !dados.modalidade && !dados.valor && !dados.mensagem) {
    linhas.push("\nGostaria de fazer uma simulação de consórcio.");
  } else {
    linhas.push("\nAguardo o contato para fazer minha simulação. Obrigado(a)!");
  }

  const texto = encodeURIComponent(linhas.join("\n"));
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${texto}`;
}

/** Abre o WhatsApp numa nova aba. */
export function abrirWhatsApp(dados: DadosSimulacao = {}): void {
  window.open(montarLinkWhatsApp(dados), "_blank", "noopener,noreferrer");
}

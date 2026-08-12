import { NOME_MODALIDADE } from "../data/constantes";
import { moeda } from "./formato";
import type { Lead, Simulacao } from "../data/tipos";

// Textos prontos para o WhatsApp. O formato segue o que o site já usa em
// src/lib/whatsapp.ts: asteriscos do WhatsApp para negrito e linhas curtas.

export function mensagemPrimeiroContato(lead: Lead): string {
  const primeiro = lead.nome.split(" ")[0];
  return [
    `Olá, ${primeiro}! Aqui é da *FG Representações*.`,
    "",
    `Vi seu interesse em consórcio de *${NOME_MODALIDADE[lead.modalidade].toLowerCase()}*` +
      (lead.valorCreditoDesejado
        ? ` na faixa de *${moeda(lead.valorCreditoDesejado)}*.`
        : "."),
    "",
    "Posso te mandar uma simulação sem compromisso, com o valor da parcela e o prazo que couber no seu orçamento?",
  ].join("\n");
}

export function mensagemSimulacao(s: Simulacao, nomeLead?: string): string {
  const linhas = [
    "*Simulação FG Representações*",
    "",
    `Modalidade: ${NOME_MODALIDADE[s.modalidade]} · ${s.administradora}`,
    `Crédito: *${moeda(s.valorCredito)}*`,
    `Prazo: ${s.prazoMeses} meses`,
    `Parcela: *${moeda(s.parcela)}*`,
  ];

  if (s.tipoLance === "embutido" && s.valorLance > 0) {
    linhas.push(
      "",
      `Com lance embutido de ${s.percentualLance}%, você oferta *${moeda(s.valorLance)}* sem tirar do bolso`,
      `e recebe *${moeda(s.creditoLiquido)}* de crédito.`
    );
  } else if (s.valorLance > 0) {
    linhas.push("", `Lance de *${moeda(s.valorLance)}* (${s.percentualLance}% da carta).`);
  }

  linhas.push(
    "",
    "Sem juros — a taxa de administração já está diluída em todas as parcelas.",
    "Qualquer dúvida é só chamar."
  );

  return (nomeLead ? `Olá, ${nomeLead.split(" ")[0]}!\n\n` : "") + linhas.join("\n");
}

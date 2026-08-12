import { CHAVE_BASE } from "./constantes";
import type { BaseDados } from "./tipos";

// O painel nunca pode dar tela branca por causa de storage. Safari privado,
// iframe e cota estourada caem todos no fallback em memória.

let memoria: BaseDados | null = null;
let storageOk = true;

export function lerBase(): BaseDados | null {
  if (memoria) return memoria;
  if (!storageOk) return null;
  try {
    const bruto = localStorage.getItem(CHAVE_BASE);
    if (!bruto) return null;
    memoria = JSON.parse(bruto) as BaseDados;
    return memoria;
  } catch {
    storageOk = false;
    return null;
  }
}

let pendente: number | null = null;

/** Grava com debounce: serializar centenas de KB a cada tecla trava a digitação. */
export function gravarBase(base: BaseDados): void {
  memoria = base;
  if (!storageOk) return;
  if (pendente !== null) window.clearTimeout(pendente);
  pendente = window.setTimeout(() => {
    pendente = null;
    try {
      localStorage.setItem(CHAVE_BASE, JSON.stringify(base));
    } catch {
      storageOk = false; // cota estourada: segue em memória, sem quebrar a tela
    }
  }, 120);
}

export function gravarAgora(base: BaseDados): void {
  memoria = base;
  if (!storageOk) return;
  try {
    localStorage.setItem(CHAVE_BASE, JSON.stringify(base));
  } catch {
    storageOk = false;
  }
}

export function limparBase(): void {
  memoria = null;
  try {
    localStorage.removeItem(CHAVE_BASE);
  } catch {
    /* ignora */
  }
}

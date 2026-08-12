let contador = 0;

/** Id curto e legível: "lead-3f8a12". Suficiente para uma base local. */
export function novoId(prefixo: string): string {
  contador += 1;
  const aleatorio = Math.random().toString(36).slice(2, 8);
  return `${prefixo}-${aleatorio}${contador.toString(36)}`;
}

export function agora(): string {
  return new Date().toISOString();
}

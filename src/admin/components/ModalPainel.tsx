import { useEffect } from "react";
import type { ReactNode } from "react";
import { FecharIcon } from "./IconesAdmin";

interface Props {
  titulo: string;
  subtitulo?: string;
  aberto: boolean;
  onFechar: () => void;
  children: ReactNode;
  largura?: string;
}

export default function ModalPainel({
  titulo,
  subtitulo,
  aberto,
  onFechar,
  children,
  largura = "max-w-lg",
}: Props) {
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", aoTeclar);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = antes;
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        aria-label="Fechar"
        onClick={onFechar}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${largura} max-h-[92vh] overflow-y-auto rounded-t-3xl border border-white/10 bg-night p-5 shadow-soft sm:rounded-3xl sm:p-6`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-white">{titulo}</h2>
            {subtitulo && <p className="mt-0.5 text-sm text-graphite-400">{subtitulo}</p>}
          </div>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-graphite-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <FecharIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

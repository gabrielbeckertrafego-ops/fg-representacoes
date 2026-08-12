import { useEffect } from "react";

interface Props {
  mensagem: string | null;
  onFechar: () => void;
  acao?: { rotulo: string; onClick: () => void };
}

export default function Toast({ mensagem, onFechar, acao }: Props) {
  useEffect(() => {
    if (!mensagem) return;
    const t = window.setTimeout(onFechar, 6000);
    return () => window.clearTimeout(t);
  }, [mensagem, onFechar]);

  if (!mensagem) return null;

  return (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-gold-500/25 bg-night/95 px-5 py-3 shadow-soft backdrop-blur"
    >
      <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400" />
      <span className="text-sm text-graphite-100">{mensagem}</span>
      {acao && (
        <button
          onClick={acao.onClick}
          className="shrink-0 text-sm font-semibold text-gold-400 hover:text-gold-300"
        >
          {acao.rotulo}
        </button>
      )}
    </div>
  );
}

import { useState } from "react";
import { CadeadoIcon } from "./IconesAdmin";

interface Props {
  onEntrar: (senha: string) => boolean;
}

export default function Login({ onEntrar }: Props) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!onEntrar(senha.trim())) {
      setErro(true);
      setSenha("");
    }
  }

  return (
    <div className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold-500/10 blur-[100px]" />

      <form onSubmit={enviar} className="card relative w-full max-w-sm p-8">
        <img src="/logo-fg.png" alt="FG Representações" className="mx-auto h-12 w-auto" />

        <div className="mt-6 text-center">
          <h1 className="font-display text-xl font-bold text-white">Painel FG</h1>
          <p className="mt-1 text-sm text-graphite-400">
            Área restrita da equipe. Informe a senha para continuar.
          </p>
        </div>

        <div className="mt-6">
          <label htmlFor="senha-painel" className="field-label">
            Senha
          </label>
          <div className="relative">
            <CadeadoIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-graphite-500" />
            <input
              id="senha-painel"
              type="password"
              value={senha}
              autoFocus
              autoComplete="current-password"
              onChange={(e) => {
                setSenha(e.target.value);
                setErro(false);
              }}
              className={`field pl-12 ${erro ? "border-red-500/70" : ""}`}
              placeholder="••••••"
            />
          </div>
          {erro && (
            <p className="mt-2 text-sm text-red-400">Senha incorreta. Tente novamente.</p>
          )}
        </div>

        <button type="submit" className="btn-gold mt-6 w-full">
          Entrar
        </button>

        <a href="/" className="mt-4 block text-center text-xs text-graphite-500 hover:text-gold-400">
          Voltar ao site
        </a>
      </form>
    </div>
  );
}

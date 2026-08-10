import { useState, type FormEvent } from "react";
import { abrirWhatsApp, type DadosSimulacao } from "../lib/whatsapp";
import { WhatsAppIcon } from "./Icons";

const MODALIDADES = [
  "Imóveis",
  "Automóveis",
  "Pesados & Máquinas",
  "Construção",
  "Capital de Giro",
  "Alavancagem Patrimonial",
  "Ainda não sei / quero orientação",
];

interface Props {
  prefill?: Partial<DadosSimulacao>;
  onEnviar?: () => void;
}

export default function SimForm({ prefill, onEnviar }: Props) {
  const [nome, setNome] = useState(prefill?.nome ?? "");
  const [modalidade, setModalidade] = useState(prefill?.modalidade ?? "");
  const [valor, setValor] = useState(prefill?.valor ?? "");
  const [mensagem, setMensagem] = useState(prefill?.mensagem ?? "");
  const [erro, setErro] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      setErro(true);
      return;
    }
    setErro(false);
    abrirWhatsApp({
      nome: nome.trim(),
      modalidade: modalidade || undefined,
      valor: valor.trim() || undefined,
      mensagem: mensagem.trim() || undefined,
    });
    onEnviar?.();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="sf-nome" className="field-label">
          Seu nome *
        </label>
        <input
          id="sf-nome"
          type="text"
          autoComplete="name"
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            if (erro) setErro(false);
          }}
          placeholder="Como podemos te chamar?"
          className={`field ${erro ? "border-red-400 ring-2 ring-red-500/30" : ""}`}
        />
        {erro && (
          <p className="mt-1.5 text-xs font-medium text-red-400">
            Por favor, informe seu nome para continuar.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="sf-mod" className="field-label">
          Tenho interesse em
        </label>
        <select
          id="sf-mod"
          value={modalidade}
          onChange={(e) => setModalidade(e.target.value)}
          className="field appearance-none"
        >
          <option value="">Selecione uma modalidade</option>
          {MODALIDADES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sf-valor" className="field-label">
          Valor de crédito desejado
        </label>
        <input
          id="sf-valor"
          type="text"
          inputMode="numeric"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Ex: R$ 150.000"
          className="field"
        />
      </div>

      <div>
        <label htmlFor="sf-msg" className="field-label">
          Mensagem (opcional)
        </label>
        <textarea
          id="sf-msg"
          rows={3}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Conte um pouco sobre seu objetivo..."
          className="field resize-none"
        />
      </div>

      <button type="submit" className="btn-whats w-full text-base">
        <WhatsAppIcon className="h-5 w-5" />
        Enviar no WhatsApp
      </button>
      <p className="text-center text-xs text-graphite-500">
        Ao enviar, abrimos o WhatsApp com sua mensagem já preenchida.
      </p>
    </form>
  );
}

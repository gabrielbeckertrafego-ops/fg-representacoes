import { useEffect, useState } from "react";

interface Props {
  id?: string;
  valor: number;
  onChange: (valor: number) => void;
  className?: string;
}

const formatar = (n: number) =>
  n ? n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "";

/** Input de dinheiro com máscara. Guarda o texto enquanto digita e devolve
 *  número para quem chamou — sem isso, apagar o último dígito vira 0 e o campo
 *  "briga" com quem está digitando. */
export default function CampoMoeda({ id, valor, onChange, className = "field-sm" }: Props) {
  const [texto, setTexto] = useState(() => formatar(valor));

  useEffect(() => {
    const numeroAtual = Number(texto.replace(/\D/g, ""));
    if (numeroAtual !== valor) setTexto(formatar(valor));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-graphite-500">
        R$
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={texto}
        onChange={(e) => {
          const digitos = e.target.value.replace(/\D/g, "");
          const numero = Number(digitos);
          setTexto(formatar(numero));
          onChange(numero);
        }}
        className={`${className} pl-9`}
      />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { EVENTO_DADOS } from "./constantes";

/**
 * Lê do repositório e recarrega sozinho quando algo muda.
 *
 * ATENÇÃO à `chave`: ela é uma string montada à mão (`leads:${etapa}`) porque a
 * função `carregar` NÃO pode entrar no array de dependências — uma arrow nova a
 * cada render dispararia o efeito em loop infinito. Se precisar reagir a um novo
 * filtro, inclua o filtro na chave.
 */
export function useDados<T>(chave: string, carregar: () => Promise<T>, inicial: T) {
  const [dados, setDados] = useState<T>(inicial);
  const [carregando, setCarregando] = useState(true);
  const ref = useRef(carregar);
  ref.current = carregar;

  useEffect(() => {
    let ativo = true;
    const executar = () => {
      ref.current().then((resultado) => {
        if (!ativo) return;
        setDados(resultado);
        setCarregando(false);
      });
    };
    executar();
    window.addEventListener(EVENTO_DADOS, executar);
    return () => {
      ativo = false;
      window.removeEventListener(EVENTO_DADOS, executar);
    };
  }, [chave]);

  return { dados, carregando };
}

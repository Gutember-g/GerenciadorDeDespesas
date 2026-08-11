/**
 * useCurrencyInput — Hook de input monetário no padrão Real brasileiro.
 *
 * Funciona em modo "digitação por centavos" (igual a apps bancários):
 * o usuário digita os números e eles se posicionam da direita para esquerda,
 * preenchendo centavos primeiro.
 *
 * Exemplo de uso:
 *   const { displayValue, numericValue, handleChange, setValue } = useCurrencyInput(0);
 *   <input value={displayValue} onChange={handleChange} />
 *   // Para salvar no backend, use numericValue (float puro)
 */

import { useState, useCallback } from 'react';

export function useCurrencyInput(initialValue: number = 0) {
  // Armazena centavos como inteiro para evitar erros de ponto flutuante
  const [cents, setCents] = useState<number>(() => Math.round(initialValue * 100));

  /**
   * Formata centavos para string exibível no padrão pt-BR: R$ 1.234,56
   */
  const formatCents = useCallback((c: number): string => {
    const abs = Math.abs(c);
    const reais = Math.floor(abs / 100);
    const centavos = abs % 100;
    const formattedReais = reais.toLocaleString('pt-BR');
    return `R$ ${formattedReais},${centavos.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Handler para o evento onChange do input.
   * Extrai apenas dígitos e acumula da direita para a esquerda (centavos primeiro).
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Remove tudo que não for dígito
    const digits = raw.replace(/\D/g, '');
    if (digits === '') {
      setCents(0);
      return;
    }
    // Limita a 13 dígitos (R$ 99.999.999.999,99 — máximo razoável)
    const trimmed = digits.slice(-13);
    const newCents = parseInt(trimmed, 10);
    setCents(isNaN(newCents) ? 0 : newCents);
  }, []);

  /**
   * Define o valor programaticamente (ex: ao editar uma transação existente).
   * @param value — valor em reais (float, ex: 1234.56)
   */
  const setValue = useCallback((value: number) => {
    setCents(Math.round((value ?? 0) * 100));
  }, []);

  /** Valor exibido no input: "R$ 1.234,56" */
  const displayValue = formatCents(cents);

  /** Valor numérico puro para enviar ao backend: 1234.56 */
  const numericValue = cents / 100;

  return { displayValue, numericValue, handleChange, setValue, cents };
}

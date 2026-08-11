/**
 * CurrencyInput — Componente de input monetário reutilizável.
 *
 * Formata automaticamente no padrão R$ 1.234,56 enquanto o usuário digita,
 * em modo "digitação por centavos" (da direita para esquerda).
 *
 * O valor numérico puro (float) é retornado via `onChange` para o backend.
 *
 * Exemplo de uso:
 *   <CurrencyInput
 *     value={amount}
 *     onChange={(numericValue) => setAmount(numericValue)}
 *     placeholder="R$ 0,00"
 *     className="..."
 *   />
 */

import React, { useEffect, useRef } from 'react';
import { useCurrencyInput } from '../utils/useCurrencyInput';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  /** Valor numérico atual em reais (ex: 1234.56) */
  value: number;
  /** Callback chamado com o novo valor numérico puro (float) */
  onChange: (value: number) => void;
  /** Classes CSS extras */
  className?: string;
}

export const CurrencyInput = ({ value, onChange, className = '', ...rest }: CurrencyInputProps) => {
  const { displayValue, numericValue, handleChange, setValue } = useCurrencyInput(value);
  const prevValueRef = useRef<number>(value);

  // Sincroniza quando o valor externo muda (ex: ao abrir modal com valor existente)
  useEffect(() => {
    if (Math.abs(prevValueRef.current - value) > 0.001) {
      setValue(value);
      prevValueRef.current = value;
    }
  }, [value, setValue]);

  // Notifica o pai quando o valor interno muda
  useEffect(() => {
    if (Math.abs(numericValue - prevValueRef.current) > 0.001) {
      prevValueRef.current = numericValue;
      onChange(numericValue);
    }
  }, [numericValue, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
  };

  return (
    <input
      {...rest}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleInputChange}
      className={className}
      autoComplete="off"
    />
  );
};

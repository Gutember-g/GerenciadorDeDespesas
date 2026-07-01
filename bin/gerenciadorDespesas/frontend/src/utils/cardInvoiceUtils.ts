/**
 * Utilitário para cálculo automático de fatura de cartão de crédito.
 *
 * A fatura é calculada com base nas transações vinculadas ao cartão
 * no período de fatura vigente (do dia seguinte ao fechamento anterior
 * até o dia de fechamento atual).
 */

export interface FaturaInfo {
  total: number;
  count: number;
  inicioPeriodo: Date;
  fimPeriodo: Date;
}

/**
 * Calcula o período de fatura vigente com base no dia de fechamento.
 *
 * Regra:
 *   O período vai do dia seguinte ao fechamento do mês anterior
 *   até o dia de fechamento do mês atual.
 *
 *   Exemplo: fechamento no dia 5, hoje = 10/junho
 *     → período: 06/maio até 05/junho
 *
 *   Exemplo: fechamento no dia 5, hoje = 03/junho
 *     → período: 06/abril até 05/maio (ainda não fechou junho)
 */
export function calcularPeriodoFatura(closingDay: number, referenceDate?: Date): { inicio: Date; fim: Date } {
  const hoje = referenceDate || new Date();

  // Fim do período = dia de fechamento do mês corrente
  const fimPeriodo = new Date(hoje.getFullYear(), hoje.getMonth(), closingDay);

  // Se ainda não chegamos no dia de fechamento, voltamos um mês
  if (hoje <= fimPeriodo) {
    fimPeriodo.setMonth(fimPeriodo.getMonth() - 1);
  }

  // Início do período = dia seguinte ao fechamento do mês anterior
  const inicioPeriodo = new Date(fimPeriodo.getFullYear(), fimPeriodo.getMonth() - 1, fimPeriodo.getDate() + 1);

  return { inicio: inicioPeriodo, fim: fimPeriodo };
}

/**
 * Calcula a fatura atual de um cartão específico.
 *
 * Filtra transações com:
 *   - cardId correspondente
 *   - type === 'EXPENSE'
 *   - data dentro do período de fatura vigente
 *
 * Retorna o total, a contagem e as datas do período.
 */
export function calcularFaturaAtual(
  cardId: number,
  transactions: any[],
  closingDay: number
): FaturaInfo {
  const { inicio, fim } = calcularPeriodoFatura(closingDay);

  const faturaTransactions = transactions.filter((t) => {
    if (t.cardId !== cardId) return false;
    if (t.type?.toUpperCase() !== 'EXPENSE') return false;

    const txDate = new Date(t.date);
    return txDate >= inicio && txDate <= fim;
  });

  const total = faturaTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    total,
    count: faturaTransactions.length,
    inicioPeriodo: inicio,
    fimPeriodo: fim,
  };
}

/**
 * Calcula a fatura de todos os cartões de uma vez.
 * Retorna um Map<cardId, FaturaInfo>.
 */
export function calcularFaturaPorCartao(
  cards: Array<{ id: number; closingDay: number }>,
  transactions: any[]
): Map<number, FaturaInfo> {
  const result = new Map<number, FaturaInfo>();

  for (const card of cards) {
    result.set(card.id, calcularFaturaAtual(card.id, transactions, card.closingDay));
  }

  return result;
}

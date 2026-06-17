import { Order, Payment, InventoryTransaction } from './schemas';

export function calculateCashBalance(payments: Payment[]): number {
  return payments.reduce((total, payment) => total + payment.amount, 0);
}

export function calculateTotalReceivables(orders: Order[], payments: Payment[]): number {
  const totalOrderAmount = orders.reduce((total, order) => total + order.total_amount, 0);
  const totalPaidAmount = payments.reduce((total, payment) => total + payment.amount, 0);
  return Math.max(0, totalOrderAmount - totalPaidAmount);
}

export function calculateRemainingStock(transactions: InventoryTransaction[]): number {
  return transactions.reduce((stock, trx) => {
    if (trx.type === 'IN') {
      return stock + trx.qty;
    } else if (trx.type === 'OUT') {
      return stock - trx.qty;
    }
    return stock;
  }, 0);
}

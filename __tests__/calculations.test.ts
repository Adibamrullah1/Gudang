import { describe, it, expect } from 'vitest';
import { calculateCashBalance, calculateTotalReceivables, calculateRemainingStock } from '../lib/calculations';
import { Payment, Order, InventoryTransaction } from '../lib/schemas';
import { v4 as uuidv4 } from 'uuid';

describe('Calculations', () => {
  it('should calculate cash balance correctly', () => {
    const payments: Payment[] = [
      { id: uuidv4(), order_id: 'ORD-01', payment_date: '2023-01-01', amount: 100000, payment_method: 'Cash' },
      { id: uuidv4(), order_id: 'ORD-02', payment_date: '2023-01-02', amount: 50000, payment_method: 'Transfer' }
    ];
    
    expect(calculateCashBalance(payments)).toBe(150000);
  });

  it('should calculate total receivables correctly', () => {
    const orders: Order[] = [
      { id: 'ORD-01', customer_id: uuidv4(), order_date: '2023-01-01', status: 'Pending', total_amount: 500000, paid_amount: 0 },
      { id: 'ORD-02', customer_id: uuidv4(), order_date: '2023-01-02', status: 'Cicilan', total_amount: 300000, paid_amount: 0 }
    ];
    const payments: Payment[] = [
      { id: uuidv4(), order_id: 'ORD-02', payment_date: '2023-01-02', amount: 100000, payment_method: 'Cash' }
    ];

    // Total orders: 800000
    // Total payments: 100000
    // Receivables: 700000
    expect(calculateTotalReceivables(orders, payments)).toBe(700000);
  });

  it('should not return negative receivables', () => {
    const orders: Order[] = [
      { id: 'ORD-01', customer_id: uuidv4(), order_date: '2023-01-01', status: 'Lunas', total_amount: 100000, paid_amount: 0 }
    ];
    const payments: Payment[] = [
      { id: uuidv4(), order_id: 'ORD-01', payment_date: '2023-01-01', amount: 150000, payment_method: 'Cash' }
    ];
    
    expect(calculateTotalReceivables(orders, payments)).toBe(0);
  });

  it('should calculate remaining stock correctly', () => {
    const productId = uuidv4();
    const transactions: InventoryTransaction[] = [
      { id: uuidv4(), product_id: productId, type: 'IN', qty: 100, transaction_date: '2023-01-01' },
      { id: uuidv4(), product_id: productId, type: 'OUT', qty: 30, transaction_date: '2023-01-02' },
      { id: uuidv4(), product_id: productId, type: 'IN', qty: 20, transaction_date: '2023-01-03' }
    ];

    expect(calculateRemainingStock(transactions)).toBe(90);
  });
});

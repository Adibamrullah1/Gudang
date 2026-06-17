import { describe, it, expect } from 'vitest';
import { ProductSchema, OrderSchema } from '../lib/schemas';
import { v4 as uuidv4 } from 'uuid';

describe('Zod Schemas', () => {
  it('ProductSchema should validate correct data', () => {
    const validData = {
      id: uuidv4(),
      title: 'Buku Matematika',
      production_cost: 10000,
      selling_price: 15000,
      stock: 50
    };

    const result = ProductSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('ProductSchema should reject negative selling_price', () => {
    const invalidData = {
      id: uuidv4(),
      title: 'Buku Fiksi',
      production_cost: 10000,
      selling_price: -5000, // Invalid!
      stock: 50
    };

    const result = ProductSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('selling_price');
    }
  });

  it('OrderSchema should reject invalid status', () => {
    const invalidData = {
      id: 'ORD-001',
      customer_id: uuidv4(),
      order_date: '2023-10-10',
      status: 'Cancelled', // Invalid! (Only Pending, Cicilan, Lunas)
      total_amount: 100000,
      paid_amount: 0
    };

    const result = OrderSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('status');
    }
  });
});

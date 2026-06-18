import { z } from 'zod';

// Skema untuk Validasi Pelanggan (Customer)
export const CustomerSchema = z.object({
  id: z.string().uuid(),
  phone_number: z.string().min(5),
  name: z.string().min(2),
  institution_name: z.string().optional(),
});

export type Customer = z.infer<typeof CustomerSchema>;

// Skema untuk Validasi Produk (Buku)
export const ProductSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(2),
  production_cost: z.number().nonnegative(),
  selling_price: z.number().nonnegative(),
  stock: z.number().nonnegative().default(0), // Virtual/calculated
});

export type Product = z.infer<typeof ProductSchema>;

// Skema untuk Validasi Order (Pesanan)
export const OrderSchema = z.object({
  id: z.string(), // misal: ORD-001
  customer_id: z.string().uuid().optional(),
  customer_name: z.string(),
  institution: z.string().optional(),
  phone_number: z.string(),
  ekspedisi: z.string().optional(),
  alamat: z.string().optional(),
  items: z.array(z.object({
    title: z.string(),
    qty: z.number().positive(),
    price: z.number().nonnegative(),
  })).min(1),
  order_date: z.string(), // YYYY-MM-DD
  status: z.enum(['Pending', 'Cicilan', 'Lunas']),
  total_amount: z.number().nonnegative(),
  paid_amount: z.number().nonnegative(),
  payment_method: z.string().optional(),
});

export type Order = z.infer<typeof OrderSchema>;

// Skema untuk Item Order
export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string(),
  product_id: z.string().uuid(),
  qty: z.number().positive(),
  unit_price: z.number().nonnegative(),
  total_price: z.number().nonnegative(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

// Skema untuk Pembayaran
export const PaymentSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string(),
  payment_date: z.string(), // YYYY-MM-DD
  amount: z.number().positive(),
  payment_method: z.string(),
  note: z.string().optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;

// Skema untuk Inventori Log
export const InventoryTransactionSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  type: z.enum(['IN', 'OUT']),
  qty: z.number().positive(),
  transaction_date: z.string(), // YYYY-MM-DD
  note: z.string().optional(),
});

export type InventoryTransaction = z.infer<typeof InventoryTransactionSchema>;

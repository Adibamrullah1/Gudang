"use client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewOrderPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [createdStatus, setCreatedStatus] = useState<string>('Pending');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const orderId = `ORD-${Math.floor(Math.random() * 10000)}`;
    const status = formData.get("status") as string;
    const orderData = {
      id: orderId,
      customer_id: uuidv4(),
      order_date: new Date().toISOString().split("T")[0],
      status: status,
      total_amount: Number(formData.get("total_amount")),
      paid_amount: Number(formData.get("paid_amount")),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menyimpan pesanan");
      }

      setSuccess(true);
      setCreatedOrderId(orderId);
      setCreatedStatus(status);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 max-w-xl mx-auto bg-white min-h-screen"
    >
      <Link href="/orders" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Pesanan
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-emerald-900 mb-2">Buat Pesanan Baru</h1>
        <p className="text-slate-500">Masukkan detail pesanan untuk dicatat ke dalam sistem dan Google Sheets.</p>
      </div>
      
      <AnimatePresence mode="wait">
        {success && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl mb-6 shadow-sm" 
            data-testid="success-message"
          >
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-emerald-900">Berhasil!</h4>
                <p className="text-sm">Pesanan <strong>{createdOrderId}</strong> berhasil disimpan ke dalam sistem.</p>
              </div>
            </div>
            
            {/* Invoice Button */}
            <div className="mt-3 pt-3 border-t border-emerald-200 flex gap-2">
              <Link href={`/invoices/${encodeURIComponent(createdOrderId || '')}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 text-sm"
                >
                  <FileText className="h-4 w-4" />
                  {createdStatus === 'Cicilan' ? 'Cetak Invoice Tagihan Cicilan' : 'Cetak Invoice'}
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            key="error"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6 flex items-start gap-3 shadow-sm" 
            data-testid="error-message"
          >
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900">Terjadi Kesalahan</h4>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit} 
        className="space-y-6 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm shadow-slate-200/50"
      >
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">Status Pembayaran</label>
          <select 
            name="status" 
            className="w-full border border-slate-200 bg-slate-50 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
            data-testid="input-status"
          >
            <option value="Pending">Pending</option>
            <option value="Cicilan">Cicilan</option>
            <option value="Lunas">Lunas</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">Total Harga (Rp)</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-slate-400 font-medium">Rp</span>
            <input 
              type="number" 
              name="total_amount" 
              required 
              placeholder="0"
              className="w-full border border-slate-200 bg-slate-50 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" 
              data-testid="input-total" 
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">Jumlah Dibayar (Rp)</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-slate-400 font-medium">Rp</span>
            <input 
              type="number" 
              name="paid_amount" 
              required 
              placeholder="0"
              className="w-full border border-slate-200 bg-slate-50 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" 
              data-testid="input-paid" 
            />
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-3 rounded-lg disabled:bg-slate-300 disabled:text-slate-500 transition-colors shadow-md shadow-emerald-600/20 flex justify-center items-center gap-2"
          data-testid="submit-button"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? "Menyimpan Data..." : "Simpan Pesanan"}
        </motion.button>
      </motion.form>
    </motion.div>
  );
}

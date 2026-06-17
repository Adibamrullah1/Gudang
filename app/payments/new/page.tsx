"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";

export default function NewPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const paymentData = {
      'Tanggal': formData.get("tanggal") as string,
      'ID Order': formData.get("id_order") as string,
      'Metode': formData.get("metode") as string,
      'Jumlah Bayar ': Number(formData.get("jumlah")),
      'Keterangan': formData.get("keterangan") as string || '',
    };

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menyimpan pembayaran");
      }

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 pt-6 bg-slate-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl mx-auto"
      >
        <Link href="/payments" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-6 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Pembayaran
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900 mb-2 flex items-center gap-3">
            <Wallet className="h-8 w-8 text-emerald-600" />
            Tambah Log Pembayaran
          </h1>
          <p className="text-slate-500">Catat pembayaran baru ke dalam Log Pembayaran di Google Sheets.</p>
        </div>

        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl mb-6 flex items-start gap-3 shadow-sm"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-emerald-900">Berhasil!</h4>
                <p className="text-sm">Pembayaran berhasil dicatat ke dalam sistem.</p>
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
            <label className="block text-sm font-semibold text-slate-700">Tanggal Pembayaran</label>
            <input
              type="date"
              name="tanggal"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full border border-slate-200 bg-slate-50 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">ID Order</label>
            <input
              type="text"
              name="id_order"
              required
              placeholder="Contoh: ORD-001"
              className="w-full border border-slate-200 bg-slate-50 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Metode Pembayaran</label>
            <select
              name="metode"
              className="w-full border border-slate-200 bg-slate-50 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            >
              <option value="Transfer">Transfer Bank</option>
              <option value="Cash">Cash / Tunai</option>
              <option value="QRIS">QRIS</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Jumlah Bayar (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 font-medium">Rp</span>
              <input
                type="number"
                name="jumlah"
                required
                placeholder="0"
                min="1"
                className="w-full border border-slate-200 bg-slate-50 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Keterangan <span className="text-slate-400 font-normal">(opsional)</span></label>
            <textarea
              name="keterangan"
              placeholder="Catatan tambahan..."
              rows={2}
              className="w-full border border-slate-200 bg-slate-50 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-3 rounded-lg disabled:bg-slate-300 disabled:text-slate-500 transition-colors shadow-md shadow-emerald-600/20 flex justify-center items-center gap-2"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "Menyimpan..." : "Simpan Pembayaran"}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}

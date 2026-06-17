"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft, PackagePlus } from "lucide-react";
import Link from "next/link";

export default function NewInventoryPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<'IN' | 'OUT'>('IN');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const inventoryData = {
      type: type,
      'Tanggal': formData.get("tanggal") as string,
      'Judul Buku': formData.get("judul_buku") as string,
      'Jumlah': Number(formData.get("jumlah")),
      'Keterangan': formData.get("keterangan") as string || '',
    };

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inventoryData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menyimpan data inventory");
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
        <Link href="/inventory" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-6 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Inventory
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900 mb-2 flex items-center gap-3">
            <PackagePlus className="h-8 w-8 text-emerald-600" />
            Tambah Log Barang
          </h1>
          <p className="text-slate-500">Catat barang masuk atau keluar ke dalam Log Barang di Google Sheets.</p>
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
                <p className="text-sm">Data barang {type === 'IN' ? 'masuk' : 'keluar'} berhasil dicatat ke dalam sistem.</p>
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
          {/* Type Toggle */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Transaksi</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('IN')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all border-2 ${
                  type === 'IN'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm shadow-emerald-500/10'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                📦 Barang Masuk
              </button>
              <button
                type="button"
                onClick={() => setType('OUT')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all border-2 ${
                  type === 'OUT'
                    ? 'bg-orange-50 border-orange-500 text-orange-800 shadow-sm shadow-orange-500/10'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                📤 Barang Keluar
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Tanggal</label>
            <input
              type="date"
              name="tanggal"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full border border-slate-200 bg-slate-50 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Judul Buku</label>
            <input
              type="text"
              name="judul_buku"
              required
              placeholder="Contoh: Fiqih Ibadah"
              className="w-full border border-slate-200 bg-slate-50 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Jumlah</label>
            <input
              type="number"
              name="jumlah"
              required
              placeholder="0"
              min="1"
              className="w-full border border-slate-200 bg-slate-50 p-3 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
            />
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
            className={`w-full font-medium px-4 py-3 rounded-lg disabled:bg-slate-300 disabled:text-slate-500 transition-colors shadow-md flex justify-center items-center gap-2 text-white ${
              type === 'IN'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
            }`}
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "Menyimpan..." : `Simpan Barang ${type === 'IN' ? 'Masuk' : 'Keluar'}`}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}

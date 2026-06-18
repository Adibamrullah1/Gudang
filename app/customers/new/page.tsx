"use client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

export default function NewCustomerPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const customerData = {
      id: uuidv4(),
      institution_name: formData.get("institution_name") as string,
      name: formData.get("name") as string,
      phone_number: formData.get("phone_number") as string,
    };

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menyimpan data pelanggan");
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
        <Link href="/customers" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-6 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Data Pelanggan
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900 mb-2 flex items-center gap-3">
            <Users className="h-8 w-8 text-emerald-600" />
            Tambah Pelanggan Baru
          </h1>
          <p className="text-slate-500">Masukkan data pemesan atau institusi untuk dicatat ke dalam sistem.</p>
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
                <p className="text-sm">Data pelanggan berhasil dicatat ke dalam sistem.</p>
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
            <label className="block text-sm font-semibold text-slate-700">Nama Instansi / Sekolah <span className="text-slate-400 font-normal">(opsional)</span></label>
            <input
              type="text"
              name="institution_name"
              placeholder="Contoh: SD Tahfidz Assaadah"
              className="w-full border border-slate-200 bg-slate-50 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Nama Pemesan</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Contoh: Bpk. Ahmad"
              className="w-full border border-slate-200 bg-slate-50 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">No. Telepon / WhatsApp</label>
            <input
              type="text"
              name="phone_number"
              required
              placeholder="Contoh: 081234567890"
              className="w-full border border-slate-200 bg-slate-50 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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
            {loading ? "Menyimpan..." : "Simpan Pelanggan"}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}

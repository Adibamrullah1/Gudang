"use client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, FileText, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { fetchSheetData } from "@/lib/google-sheets";
import Image from "next/image";

type ProductItem = {
  title: string;
  price: number;
  qty: number;
};

export default function NewOrderPage() {
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [createdStatus, setCreatedStatus] = useState<string>('Pending');

  const [products, setProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const result = await fetchSheetData("Products");
        const rData = Array.isArray(result) ? result : [];
        const initialProducts = rData
          .filter((item: any) => item['Nama Buku'])
          .map((item: any) => ({
            title: item['Nama Buku'],
            price: Number(item['Harga Jual']) || 0,
            qty: 0
          }));
        setProducts(initialProducts);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Gagal memuat daftar buku dari spreadsheet.");
      } finally {
        setFetchingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const handleQtyChange = (index: number, newQty: number) => {
    const updated = [...products];
    updated[index].qty = Math.max(0, newQty);
    setProducts(updated);
  };

  const selectedItems = products.filter(p => p.qty > 0);
  const totalAmount = selectedItems.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      setError("Silakan isi kuantitas untuk minimal 1 buku.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const orderId = `ORD-${Math.floor(Math.random() * 10000)}`;
    
    // In this form we assume status is Pending by default
    const status = "Pending";
    
    const orderData = {
      id: orderId,
      customer_id: uuidv4(),
      customer_name: formData.get("customer_name") as string,
      institution: formData.get("institution") as string,
      phone_number: formData.get("phone_number") as string,
      ekspedisi: formData.get("ekspedisi") as string,
      alamat: formData.get("alamat") as string,
      items: selectedItems,
      order_date: new Date().toISOString().split("T")[0],
      status: status,
      total_amount: totalAmount,
      paid_amount: 0, // Belum dibayar pada form ini
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
      
      // Reset quantities
      setProducts(products.map(p => ({ ...p, qty: 0 })));
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EBF8] py-8 px-4 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto mb-6">
        <Link href="/orders" className="inline-flex items-center gap-2 text-[#673AB7] hover:text-[#512da8] font-medium transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Pesanan
        </Link>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {/* Banner Image */}
        <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-sm relative bg-white">
          <Image 
            src="/images/form-header.png" 
            alt="Banner Literasi" 
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>

        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {success && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-xl shadow-sm" 
            >
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold text-emerald-900 mb-1">Pesanan Berhasil Disimpan!</h4>
                  <p className="text-sm">Pesanan dengan ID <strong>{createdOrderId}</strong> telah tercatat.</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-emerald-200 flex gap-3">
                <Link href={`/invoices/${encodeURIComponent(createdOrderId || '')}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 text-sm"
                  >
                    <FileText className="h-4 w-4" />
                    Cetak Invoice Pesanan Ini
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
              className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl flex items-start gap-3 shadow-sm" 
            >
              <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-red-900 text-lg mb-1">Gagal Menyimpan</h4>
                <p className="text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Header Title Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="h-2 w-full bg-[#673AB7] absolute top-0 left-0"></div>
            <div className="p-8 pt-10">
              <h1 className="text-3xl font-normal text-slate-800 mb-3">Form Pemesanan Buku Literasi & Numerasi</h1>
              <p className="text-slate-600 text-sm border-t border-slate-100 pt-4 mt-4">
                Silakan isi data diri Anda dan daftar buku yang ingin dipesan di bawah ini.
              </p>
              <p className="text-red-500 text-xs mt-4">* Menunjukkan pertanyaan yang wajib diisi</p>
            </div>
          </div>

          {/* Identitas Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all focus-within:border-[#673AB7] focus-within:shadow-md">
            <label className="block text-base text-slate-800 mb-4">
              Nama Pemesan <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="customer_name" 
              required 
              placeholder="Jawaban Anda"
              className="w-full md:w-1/2 border-0 border-b border-slate-300 bg-transparent py-2 focus:ring-0 focus:border-[#673AB7] outline-none transition-colors text-slate-800" 
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all focus-within:border-[#673AB7] focus-within:shadow-md">
            <label className="block text-base text-slate-800 mb-4">
              Nama Lembaga <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="institution" 
              required
              placeholder="Jawaban Anda"
              className="w-full md:w-1/2 border-0 border-b border-slate-300 bg-transparent py-2 focus:ring-0 focus:border-[#673AB7] outline-none transition-colors text-slate-800" 
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all focus-within:border-[#673AB7] focus-within:shadow-md">
            <label className="block text-base text-slate-800 mb-4">
              No. Handphone (WA) <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="phone_number" 
              required 
              placeholder="Jawaban Anda"
              className="w-full md:w-1/2 border-0 border-b border-slate-300 bg-transparent py-2 focus:ring-0 focus:border-[#673AB7] outline-none transition-colors text-slate-800" 
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all focus-within:border-[#673AB7] focus-within:shadow-md">
            <label className="block text-base text-slate-800 mb-4">
              Ekspedisi <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="ekspedisi" 
              required 
              placeholder="Jawaban Anda"
              className="w-full md:w-1/2 border-0 border-b border-slate-300 bg-transparent py-2 focus:ring-0 focus:border-[#673AB7] outline-none transition-colors text-slate-800" 
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all focus-within:border-[#673AB7] focus-within:shadow-md">
            <label className="block text-base text-slate-800 mb-4">
              Alamat Lengkap <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="alamat" 
              required 
              placeholder="Jawaban Anda"
              className="w-full border-0 border-b border-slate-300 bg-transparent py-2 focus:ring-0 focus:border-[#673AB7] outline-none transition-colors text-slate-800" 
            />
          </div>

          {/* Buku Section */}
          {fetchingProducts ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#673AB7]" />
              <p>Memuat daftar buku...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
              Belum ada data buku.
            </div>
          ) : (
            products.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all focus-within:border-[#673AB7] focus-within:shadow-md">
                <label className="block text-base text-slate-800 mb-2 font-medium">
                  {item.title} <span className="text-xs font-normal text-slate-500 ml-2">(Rp {item.price.toLocaleString('id-ID')})</span>
                </label>
                
                {/* Image Placeholder */}
                <div className="mb-6 w-full max-w-xs aspect-[3/4] bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-slate-300 overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 text-center">
                     <ImageIcon className="w-12 h-12 mb-2 text-[#673AB7]/30" />
                     <span className="text-sm font-semibold text-slate-600 line-clamp-3">{item.title}</span>
                   </div>
                </div>

                <div className="mt-4">
                   <p className="text-sm text-slate-500 mb-2">Jumlah Buku yang dipesan:</p>
                  <input 
                    type="number" 
                    min="0"
                    value={item.qty === 0 ? '' : item.qty}
                    onChange={(e) => handleQtyChange(index, parseInt(e.target.value) || 0)}
                    placeholder="Jawaban Anda"
                    className="w-full md:w-1/3 border-0 border-b border-slate-300 bg-transparent py-2 focus:ring-0 focus:border-[#673AB7] outline-none transition-colors text-slate-800" 
                  />
                </div>
              </div>
            ))
          )}

          {/* Submit Button & Total Summary */}
          {products.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
              <div className="mb-4 sm:mb-0 text-center sm:text-left">
                <p className="text-sm text-slate-500 mb-1">Total Harga:</p>
                <p className="text-2xl font-bold text-[#673AB7]">Rp {totalAmount.toLocaleString('id-ID')}</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading || fetchingProducts || selectedItems.length === 0}
                className="bg-[#673AB7] hover:bg-[#512da8] text-white font-medium px-8 py-2.5 rounded-md disabled:bg-slate-300 disabled:text-slate-500 transition-colors shadow-sm flex items-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Kirim Pesanan"
                )}
              </motion.button>
            </div>
          )}
          
        </form>

        <div className="text-center text-xs text-slate-400 mt-8 mb-4">
          Form ini dibuat secara otomatis melalui sistem Kaffah Warehouse.
        </div>
      </div>
    </div>
  );
}

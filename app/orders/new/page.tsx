"use client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, FileText, ArrowLeft, BookOpen, ShoppingCart, User, Truck, MapPin } from "lucide-react";
import Link from "next/link";
import { fetchSheetData } from "@/lib/google-sheets";

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
        // DAFTAR BUKU TETAP (Fixed list sesuai permintaan)
        const fixedProducts: ProductItem[] = [
          { title: "Baca A", price: 25000, qty: 0 },
          { title: "Baca B", price: 28000, qty: 0 },
          { title: "Baca C", price: 28000, qty: 0 },
          { title: "Menulis", price: 20000, qty: 0 },
          { title: "Hitung A", price: 25000, qty: 0 },
          { title: "Hitung B", price: 20000, qty: 0 },
          { title: "Hitung C", price: 25000, qty: 0 },
          { title: "Hitung D", price: 20000, qty: 0 },
          { title: "Literasi", price: 29000, qty: 0 },
          { title: "Numerasi", price: 23000, qty: 0 },
          { title: "Imlak 1", price: 17000, qty: 0 },
          { title: "Imlak 2", price: 17000, qty: 0 },
          { title: "Peraga Pembaca", price: 85000, qty: 0 },
        ];

        setProducts(fixedProducts);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Gagal memuat daftar buku.");
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
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto mb-6">
        <Link href="/orders" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-medium transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Pesanan
        </Link>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Buat Pesanan Baru</h1>
            <p className="text-slate-500 text-sm mt-1">Sistem pencatatan terpadu Kaffah Warehouse</p>
          </div>
        </div>

        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {success && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-xl shadow-sm" 
            >
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-emerald-900 mb-1">Pesanan Berhasil Disimpan!</h4>
                  <p className="text-sm">Pesanan dengan ID <strong>{createdOrderId}</strong> telah tercatat di sistem.</p>
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
              className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-xl flex items-start gap-3 shadow-sm" 
            >
              <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-red-900 text-lg mb-1">Gagal Menyimpan</h4>
                <p className="text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KIRI: INFORMASI PELANGGAN */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-500" />
                  <h2 className="font-bold text-slate-800">Informasi Pelanggan</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Nama Pemesan <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="customer_name" 
                      required 
                      placeholder="Masukkan nama"
                      className="w-full border border-slate-300 rounded-lg bg-white p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">No. WhatsApp <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="phone_number" 
                      required 
                      placeholder="Contoh: 0812345678"
                      className="w-full border border-slate-300 rounded-lg bg-white p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Nama Lembaga <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="institution" 
                      required
                      placeholder="Nama Sekolah / Institusi"
                      className="w-full border border-slate-300 rounded-lg bg-white p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-slate-500" />
                  <h2 className="font-bold text-slate-800">Pengiriman</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Ekspedisi <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="ekspedisi" 
                      required 
                      placeholder="JNE, J&T, Sicepat, dll"
                      className="w-full border border-slate-300 rounded-lg bg-white p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Alamat Lengkap <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      name="alamat" 
                      required 
                      rows={3}
                      placeholder="Alamat pengiriman lengkap..."
                      className="w-full border border-slate-300 rounded-lg bg-white p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* KANAN: DAFTAR BUKU */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-slate-500" />
                    <h2 className="font-bold text-slate-800">Daftar Buku & Produk</h2>
                  </div>
                  <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                    {products.length} Produk Tersedia
                  </div>
                </div>

                <div className="p-0 flex-1">
                  {fetchingProducts ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                      <Loader2 className="h-8 w-8 animate-spin mb-3 text-emerald-500" />
                      <p className="text-sm font-medium">Memuat data produk...</p>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">
                      Belum ada data buku.
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                          <tr>
                            <th className="px-5 py-3 font-bold w-1/2">Nama Produk</th>
                            <th className="px-5 py-3 font-bold text-right">Harga Satuan</th>
                            <th className="px-5 py-3 font-bold text-center w-32">Kuantitas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {products.map((item, index) => (
                            <tr key={index} className={`hover:bg-slate-50 transition-colors ${item.qty > 0 ? 'bg-emerald-50/40 hover:bg-emerald-50/60' : ''}`}>
                              <td className="px-5 py-3 font-medium text-slate-800">{item.title}</td>
                              <td className="px-5 py-3 text-right text-slate-600 font-medium">Rp {item.price.toLocaleString('id-ID')}</td>
                              <td className="px-5 py-3 text-center">
                                <input 
                                  type="number" 
                                  min="0"
                                  value={item.qty === 0 ? '' : item.qty}
                                  onChange={(e) => handleQtyChange(index, parseInt(e.target.value) || 0)}
                                  placeholder="0"
                                  className={`w-20 border rounded-lg p-2 text-center text-sm font-bold transition-all outline-none ${item.qty > 0 ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20' : 'border-slate-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-700'}`} 
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                {/* RINGKASAN TOTAL BAWAH */}
                <div className="bg-slate-800 text-white p-5 sticky bottom-0">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Total Harga Pesanan</p>
                      <p className="text-3xl font-bold text-emerald-400">Rp {totalAmount.toLocaleString('id-ID')}</p>
                      {selectedItems.length > 0 && (
                        <p className="text-xs text-slate-400 mt-1">{selectedItems.length} jenis buku dipilih</p>
                      )}
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      disabled={loading || fetchingProducts || selectedItems.length === 0}
                      className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl disabled:bg-slate-700 disabled:text-slate-500 transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        "Simpan Pesanan"
                      )}
                    </motion.button>
                  </div>
                </div>
                
              </div>
            </div>
            
          </div>
          
        </form>

      </div>
    </div>
  );
}

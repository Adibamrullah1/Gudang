"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, Loader2, Plus, TrendingUp, DollarSign, Package, ExternalLink } from "lucide-react";
import { fetchSheetData } from "@/lib/google-sheets";
import Link from "next/link";

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<'stok' | 'rancangan' | 'penjualan'>('stok');
  const [rancanganData, setRancanganData] = useState<any[]>([]);
  const [penjualanData, setPenjualanData] = useState<any[]>([]);
  const [stokData, setStokData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Karena Google Apps Script (GAS) sangat ketat dengan request berbarengan (concurrency),
        // kita ubah Promise.all menjadi sequential (satu-satu) agar tidak kena blokir / CORS error "Failed to fetch"
        const rancanganResult = await fetchSheetData("Products").catch(() => []);
        const penjualanResult = await fetchSheetData("Products_Sales").catch(() => []);
        const inData = await fetchSheetData("Inventory_In").catch(() => []);
        const outData = await fetchSheetData("Inventory_Out").catch(() => []);

        const rData = Array.isArray(rancanganResult) ? rancanganResult : [];
        setRancanganData(rData);
        
        // Products_Sales mungkin belum ada jika user belum deploy script baru
        setPenjualanData(Array.isArray(penjualanResult) ? penjualanResult : []);

        // Kalkulasi Sisa Stok
        const formattedIn = (Array.isArray(inData) ? inData : []).map((item: any) => ({
          type: 'IN',
          product_id: item['Judul Buku'] || item.product_id,
          quantity: Number(item.Jumlah || item.quantity || 0)
        })).filter(item => item.product_id);

        const formattedOut = (Array.isArray(outData) ? outData : []).map((item: any) => ({
          type: 'OUT',
          product_id: item['Judul Buku'] || item.product_id,
          quantity: Number(item.Jumlah || item.quantity || 0)
        })).filter(item => item.product_id);

        const combined = [...formattedIn, ...formattedOut];
        const summaryMap: Record<string, { in: number, out: number }> = {};
        
        // Inisialisasi semua buku dari Rancangan
        rData.forEach((item: any) => {
          const productName = item['Nama Buku'];
          if (productName && !summaryMap[productName]) {
            summaryMap[productName] = { in: 0, out: 0 };
          }
        });

        combined.forEach(item => {
          const product = item.product_id;
          if (!summaryMap[product]) summaryMap[product] = { in: 0, out: 0 };
          if (item.type === 'IN') summaryMap[product].in += item.quantity;
          else if (item.type === 'OUT') summaryMap[product].out += item.quantity;
        });

        const summaryArray = Object.keys(summaryMap).map(product => ({
          product_id: product,
          total_in: summaryMap[product].in,
          total_out: summaryMap[product].out,
          remaining: summaryMap[product].in - summaryMap[product].out
        }));

        setStokData(summaryArray);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const formatRp = (num: any) => {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  };

  return (
    <div className="flex-1 p-8 pt-6 bg-slate-50 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-emerald-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-emerald-600" />
            Buku & Keuangan
          </h2>
          <p className="text-slate-500 mt-1">Pantau stok buku, rancangan keuangan, dan performa penjualan.</p>
        </div>
      </motion.div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-2 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('stok')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'stok' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Package className="w-4 h-4" />
            Sisa Stok Buku
          </button>
          <button 
            onClick={() => setActiveTab('rancangan')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'rancangan' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <DollarSign className="w-4 h-4" />
            Rancangan Keuangan
          </button>
          <button 
            onClick={() => setActiveTab('penjualan')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'penjualan' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <TrendingUp className="w-4 h-4" />
            Hasil Penjualan
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
            <p>Menyelaraskan data dengan Spreadsheet...</p>
          </div>
        ) : (
          <div className="p-0">
            <AnimatePresence mode="wait">
              {/* TAB: STOK */}
              {activeTab === 'stok' && (
                <motion.div key="stok" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Judul Buku</th>
                        <th className="px-6 py-4 font-semibold text-center text-emerald-600">Total Masuk (Inventory)</th>
                        <th className="px-6 py-4 font-semibold text-center text-orange-500">Total Keluar (Inventory)</th>
                        <th className="px-6 py-4 font-semibold text-center">Sisa Stok Akhir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stokData.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-slate-500">Belum ada data stok.</td></tr>}
                      {stokData.map((item, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-emerald-50/30">
                          <td className="px-6 py-4 font-medium text-slate-900">{item.product_id}</td>
                          <td className="px-6 py-4 text-center font-bold text-emerald-600">+{item.total_in}</td>
                          <td className="px-6 py-4 text-center font-bold text-orange-500">-{item.total_out}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.remaining > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                              {item.remaining} Unit
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                    <Link href="/inventory">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Lihat Detail Log Barang di Inventory
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* TAB: RANCANGAN KEUANGAN */}
              {activeTab === 'rancangan' && (
                <motion.div key="rancangan" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="overflow-x-auto p-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {rancanganData.length === 0 && <div className="text-slate-500 p-4">Belum ada data rancangan keuangan.</div>}
                    {rancanganData.map((item, i) => (
                      <div key={i} className="bg-white border border-indigo-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-indigo-900 mb-4 pb-2 border-b border-indigo-50">{item['Nama Buku']}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2 text-sm">
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Harga Produksi</p>
                            <p className="font-semibold text-slate-700">{formatRp(item['Harga Produksi'])}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Harga Jual</p>
                            <p className="font-bold text-emerald-600">{formatRp(item['Harga Jual'])}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Margin</p>
                            <p className="font-bold text-indigo-600">{formatRp(item['Margin'])}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Disc 15%</p>
                            <p className="font-medium text-slate-600">{formatRp(item['Disc 15%'])}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Royalti 10%</p>
                            <p className="font-medium text-slate-600">{formatRp(item['Royalti 10%'])}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Deviden 20%</p>
                            <p className="font-medium text-slate-600">{formatRp(item['Deviden 20%'])}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Layanan 10%</p>
                            <p className="font-medium text-slate-600">{formatRp(item['Layanan 10%'])}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Fee Maarif</p>
                            <p className="font-medium text-slate-600">{formatRp(item['Fee Maarif'])}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Investasi</p>
                            <p className="font-medium text-slate-600">{formatRp(item['Investasi'])}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB: HASIL PENJUALAN */}
              {activeTab === 'penjualan' && (
                <motion.div key="penjualan" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="overflow-x-auto">
                  {penjualanData.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="bg-orange-50 text-orange-800 p-4 rounded-lg inline-block border border-orange-200">
                        <p className="font-semibold mb-1">Data Hasil Penjualan Belum Tersedia</p>
                        <p className="text-sm">Anda harus menekan <strong>Deploy</strong> ulang pada Google Apps Script Anda setelah menyalin script terbaru.</p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-orange-800 uppercase bg-orange-50 border-b border-orange-100">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Nama Buku</th>
                          <th className="px-6 py-4 font-semibold text-center">Jml Terjual</th>
                          <th className="px-6 py-4 font-semibold">Margin (Hasil)</th>
                          <th className="px-6 py-4 font-semibold hidden md:table-cell">Royalti 10%</th>
                          <th className="px-6 py-4 font-semibold hidden lg:table-cell">Deviden 20%</th>
                          <th className="px-6 py-4 font-semibold text-emerald-700">Investasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {penjualanData.map((item, i) => {
                          const isTotal = item['Nama Buku'] === 'TOTAL' || !item['Nama Buku'];
                          return (
                            <tr key={i} className={`border-b border-slate-50 hover:bg-orange-50/30 ${isTotal ? 'bg-orange-100 font-bold' : ''}`}>
                              <td className="px-6 py-4 font-medium text-slate-900">{item['Nama Buku'] || 'TOTAL'}</td>
                              <td className="px-6 py-4 text-center font-bold text-orange-600">{item['Jumlah Terjual'] || '-'}</td>
                              <td className="px-6 py-4 text-slate-800">{formatRp(item['Margin'])}</td>
                              <td className="px-6 py-4 text-slate-600 hidden md:table-cell">{formatRp(item['Royalti 10%'])}</td>
                              <td className="px-6 py-4 text-slate-600 hidden lg:table-cell">{formatRp(item['Deviden 20%'])}</td>
                              <td className="px-6 py-4 text-emerald-700 font-semibold">{formatRp(item['Investasi'])}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

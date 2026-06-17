"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PackageSearch, Search, Loader2, Plus } from "lucide-react";
import { fetchSheetData } from "@/lib/google-sheets";
import Link from "next/link";

export default function InventoryPage() {
  const [inDataList, setInDataList] = useState<any[]>([]);
  const [outDataList, setOutDataList] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'in' | 'out'>('summary');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [inData, outData] = await Promise.all([
          fetchSheetData("Inventory_In"),
          fetchSheetData("Inventory_Out")
        ]);
        
        const formattedIn = (Array.isArray(inData) ? inData : []).map((item: any) => ({
          ...item,
          type: 'IN',
          transaction_date: item.Tanggal || item.transaction_date,
          product_id: item['Judul Buku'] || item.product_id,
          quantity: Number(item.Jumlah || item.quantity || 0)
        })).filter(item => item.product_id);

        const formattedOut = (Array.isArray(outData) ? outData : []).map((item: any) => ({
          ...item,
          type: 'OUT',
          transaction_date: item.Tanggal || item.transaction_date,
          product_id: item['Judul Buku'] || item.product_id,
          quantity: Number(item.Jumlah || item.quantity || 0)
        })).filter(item => item.product_id);

        setInDataList(formattedIn);
        setOutDataList(formattedOut);

        const combined = [...formattedIn, ...formattedOut];
        
        // Calculate summary
        const summaryMap: Record<string, { in: number, out: number }> = {};
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

        setSummaryData(summaryArray);
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
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
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
            <PackageSearch className="h-8 w-8 text-emerald-600" />
            Inventory & Stok
          </h2>
          <p className="text-slate-500 mt-1">Pantau sisa stok buku, barang masuk, dan barang keluar.</p>
        </div>
        <Link href="/inventory/new">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Tambah Log Barang
          </motion.button>
        </Link>
      </motion.div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-2">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'summary' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Sisa Stok Buku
          </button>
          <button 
            onClick={() => setActiveTab('in')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'in' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Log Barang Masuk
          </button>
          <button 
            onClick={() => setActiveTab('out')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'out' ? 'bg-orange-100 text-orange-800' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Log Barang Keluar
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
            <p>Memuat data dari Google Sheets...</p>
          </div>
        ) : (
          <div className="overflow-x-auto p-4">
            
            {/* TAB SUMMARY */}
            {activeTab === 'summary' && (
              <motion.table variants={containerVariants} initial="hidden" animate="show" className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Produk / Buku</th>
                    <th className="px-6 py-4 font-semibold text-center text-emerald-600">Total Masuk</th>
                    <th className="px-6 py-4 font-semibold text-center text-orange-500">Total Keluar</th>
                    <th className="px-6 py-4 font-semibold text-center">Sisa Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-slate-500">Belum ada data stok.</td></tr>}
                  {summaryData.map((item, i) => (
                    <motion.tr variants={itemVariants} key={i} className="border-b border-slate-50 hover:bg-emerald-50/30">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.product_id}</td>
                      <td className="px-6 py-4 text-center font-bold text-emerald-600">+{item.total_in}</td>
                      <td className="px-6 py-4 text-center font-bold text-orange-500">-{item.total_out}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.remaining > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {item.remaining} Unit
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            )}

            {/* TAB IN */}
            {activeTab === 'in' && (
              <motion.table variants={containerVariants} initial="hidden" animate="show" className="w-full text-sm text-left">
                <thead className="text-xs text-emerald-600 uppercase bg-emerald-50/50 border-b border-emerald-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Tanggal</th>
                    <th className="px-6 py-4 font-semibold">Produk / Buku</th>
                    <th className="px-6 py-4 font-semibold text-center">Kuantitas Masuk</th>
                  </tr>
                </thead>
                <tbody>
                  {inDataList.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-slate-500">Belum ada barang masuk.</td></tr>}
                  {inDataList.map((item, i) => (
                    <motion.tr variants={itemVariants} key={i} className="border-b border-slate-50 hover:bg-emerald-50/30">
                      <td className="px-6 py-4 text-slate-600">{item.transaction_date}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{item.product_id}</td>
                      <td className="px-6 py-4 text-center font-bold text-emerald-600">+{item.quantity}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            )}

            {/* TAB OUT */}
            {activeTab === 'out' && (
              <motion.table variants={containerVariants} initial="hidden" animate="show" className="w-full text-sm text-left">
                <thead className="text-xs text-orange-600 uppercase bg-orange-50/50 border-b border-orange-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Tanggal</th>
                    <th className="px-6 py-4 font-semibold">Produk / Buku</th>
                    <th className="px-6 py-4 font-semibold text-center">Kuantitas Keluar</th>
                  </tr>
                </thead>
                <tbody>
                  {outDataList.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-slate-500">Belum ada barang keluar.</td></tr>}
                  {outDataList.map((item, i) => (
                    <motion.tr variants={itemVariants} key={i} className="border-b border-slate-50 hover:bg-orange-50/30">
                      <td className="px-6 py-4 text-slate-600">{item.transaction_date}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{item.product_id}</td>
                      <td className="px-6 py-4 text-center font-bold text-orange-500">-{item.quantity}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

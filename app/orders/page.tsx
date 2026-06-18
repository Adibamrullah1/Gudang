"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Search, Loader2, Plus, Filter } from "lucide-react";
import { fetchSheetData } from "@/lib/google-sheets";
import Link from "next/link";

export default function OrdersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'semua' | 'lunas' | 'cicilan' | 'pending'>('semua');

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchSheetData("Orders");
        setData(Array.isArray(result) ? result : []);
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
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === 'lunas') return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Lunas</span>;
    if (s === 'cicilan') return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Cicilan</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Pending</span>;
  };

  const formatRp = (num: any) => {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  };

  // Filter by search query
  const filteredBySearch = data.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item['ID Order'] || item.id || '').toLowerCase().includes(q) ||
      (item['Nama'] || '').toLowerCase().includes(q) ||
      (item['Judul Buku'] || '').toLowerCase().includes(q)
    );
  });

  // Filter by status
  const filteredData = filteredBySearch.filter(item => {
    if (statusFilter === 'semua') return true;
    const s = (item['Status'] || item.status || '').toLowerCase();
    return s === statusFilter;
  });

  // Count per status for badges
  const countLunas = data.filter(item => (item['Status'] || item.status || '').toLowerCase() === 'lunas').length;
  const countCicilan = data.filter(item => (item['Status'] || item.status || '').toLowerCase() === 'cicilan').length;
  const countPending = data.filter(item => {
    const s = (item['Status'] || item.status || '').toLowerCase();
    return s !== 'lunas' && s !== 'cicilan';
  }).length;

  return (
    <div className="flex-1 p-8 pt-6 bg-slate-50 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-emerald-900 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-emerald-600" />
            Daftar Pesanan
          </h2>
          <p className="text-slate-500 mt-1">Pantau seluruh order yang masuk dan status pembayarannya.</p>
        </div>
        <Link href="/orders/new">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md shadow-orange-500/20 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Buat Pesanan Baru
          </motion.button>
        </Link>
      </motion.div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Search + Status Filter */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3">
          <div className="flex justify-between items-center">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari ID order, nama, atau buku..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Filter className="w-4 h-4 text-slate-400" />
            <button
              onClick={() => setStatusFilter('semua')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                statusFilter === 'semua' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({data.length})
            </button>
            <button
              onClick={() => setStatusFilter('lunas')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                statusFilter === 'lunas' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              ✅ Lunas ({countLunas})
            </button>
            <button
              onClick={() => setStatusFilter('cicilan')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                statusFilter === 'cicilan' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              ⏳ Cicilan ({countCicilan})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                statusFilter === 'pending' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              🕐 Pending ({countPending})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
            <p>Memuat data dari Google Sheets...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {data.length === 0 
              ? 'Tidak ada data order yang ditemukan di sheet "Orders".' 
              : 'Tidak ada order yang cocok dengan filter yang dipilih.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <motion.table 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="w-full text-sm text-left"
            >
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID Pesanan</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Pemesan</th>
                  <th className="px-6 py-4 font-semibold">Produk</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Total Harga</th>
                  <th className="px-6 py-4 font-semibold">Sisa Bayar</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, i) => {
                  const totalHarga = Number(item['Harga Total'] || item.total_amount || 0);
                  const totalTerbayar = Number(item['Total Terbayar'] || item.paid_amount || 0);
                  const sisaBayar = totalHarga - totalTerbayar;
                  const status = (item['Status'] || item.status || '').toLowerCase();

                  return (
                    <motion.tr 
                      variants={itemVariants}
                      key={item.id || i} 
                      onClick={() => { if (item.id || item['ID Order']) window.location.href = `/invoices/${encodeURIComponent(item.id || item['ID Order'])}` }}
                      className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900">{item['ID Order'] || item.id || '-'}</td>
                      <td className="px-6 py-4 text-slate-600">{item['Tanggal'] || item.order_date || '-'}</td>
                      <td className="px-6 py-4 text-slate-800">{item['Nama'] || item.customer_name || '-'}</td>
                      <td className="px-6 py-4 text-slate-800">
                        {item['Judul Buku'] || item.book_title || '-'} 
                        <span className="text-slate-500 text-xs ml-1">x{item['Qty'] || item.qty || 1}</span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(item['Status'] || item.status)}</td>
                      <td className="px-6 py-4 text-slate-800 font-medium">{formatRp(totalHarga)}</td>
                      <td className="px-6 py-4">
                        {status === 'cicilan' && sisaBayar > 0 ? (
                          <div>
                            <span className="font-bold text-red-600">{formatRp(sisaBayar)}</span>
                            <span className="block text-xs text-red-400 mt-0.5">Kurang dibayar</span>
                          </div>
                        ) : status === 'lunas' || sisaBayar <= 0 ? (
                          <span className="text-emerald-600 font-medium">-</span>
                        ) : (
                          <span className="font-semibold text-orange-600">{formatRp(sisaBayar)}</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </motion.table>
          </div>
        )}
      </div>
    </div>
  );
}

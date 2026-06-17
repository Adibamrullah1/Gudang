"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Loader2, Download, Printer, Eye } from "lucide-react";
import { fetchSheetData } from "@/lib/google-sheets";
import Link from "next/link";

export default function InvoicesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        // Invoices are derived from Orders data
        const result = await fetchSheetData("Orders");
        const orders = Array.isArray(result) ? result : [];
        
        const mappedInvoices = orders.map((order: any) => {
          const status = (order.Status || order.status || "").toLowerCase();
          const totalHarga = Number(order['Harga Total'] || order.total_amount || 0);
          const totalTerbayar = Number(order['Total Terbayar'] || order.paid_amount || 0);
          let invoiceStatus = 'Unpaid';
          if (status === 'lunas') invoiceStatus = 'Paid';
          else if (status === 'cicilan') invoiceStatus = 'Cicilan';
          
          return {
            id: `INV-${order['ID Order'] || order.id || Math.floor(Math.random() * 1000)}`,
            order_id: order['ID Order'] || order.id,
            customer_name: order['Nama'] || order['Customer'] || '-',
            due_date: order['Tanggal'] || order.order_date || '-',
            total_harga: totalHarga,
            total_terbayar: totalTerbayar,
            sisa: totalHarga - totalTerbayar,
            status: invoiceStatus
          };
        }).filter((inv: any) => inv.order_id);
        
        setData(mappedInvoices);
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

  const formatRp = (num: any) => {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === 'paid' || s === 'lunas') return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Lunas</span>;
    if (s === 'cicilan') return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Cicilan</span>;
    if (s === 'overdue' || s === 'lewat') return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Overdue</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Unpaid</span>;
  };

  const filteredData = data.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.id || '').toLowerCase().includes(q) ||
      (item.order_id || '').toLowerCase().includes(q) ||
      (item.customer_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 p-8 pt-6 bg-slate-50 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-emerald-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-emerald-600" />
            Invoices (Tagihan)
          </h2>
          <p className="text-slate-500 mt-1">Daftar tagihan pembayaran untuk sekolah atau institusi.</p>
        </div>
      </motion.div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari ID Invoice atau customer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
            <p>Memuat data dari Google Sheets...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Tidak ada data tagihan yang ditemukan.
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
                  <th className="px-6 py-4 font-semibold">ID Invoice</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Terbayar</th>
                  <th className="px-6 py-4 font-semibold">Sisa</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, i) => (
                  <motion.tr 
                    variants={itemVariants}
                    key={item.id || i} 
                    className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900">{item.id || '-'}</td>
                    <td className="px-6 py-4 text-slate-700">{item.customer_name}</td>
                    <td className="px-6 py-4 text-slate-600">{item.due_date || '-'}</td>
                    <td className="px-6 py-4 text-slate-800 font-medium">{formatRp(item.total_harga)}</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">{formatRp(item.total_terbayar)}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${item.sisa > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {formatRp(item.sisa)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link 
                          href={`/invoices/${encodeURIComponent(item.order_id)}`}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                          title="Lihat & Cetak Invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link 
                          href={`/invoices/${encodeURIComponent(item.order_id)}`}
                          className="text-emerald-600 hover:text-emerald-800 p-2 rounded-full hover:bg-emerald-50 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          </div>
        )}
      </div>
    </div>
  );
}

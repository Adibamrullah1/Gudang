"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Loader2, Plus } from "lucide-react";
import { fetchSheetData } from "@/lib/google-sheets";

export default function CustomersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchSheetData("Customers");
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
            <Users className="h-8 w-8 text-emerald-600" />
            Data Pelanggan
          </h2>
          <p className="text-slate-500 mt-1">Kelola data pemesan, sekolah, dan institusi.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md shadow-orange-500/20 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Tambah Pelanggan
        </motion.button>
      </motion.div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari pelanggan..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
            <p>Memuat data dari Google Sheets...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Tidak ada data pelanggan yang ditemukan di sheet "Customers".
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
                  <th className="px-6 py-4 font-semibold">Nama Instansi / Sekolah</th>
                  <th className="px-6 py-4 font-semibold">Nama Pemesan</th>
                  <th className="px-6 py-4 font-semibold">No. Telepon / WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <motion.tr 
                    variants={itemVariants}
                    key={item.id || i} 
                    className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-emerald-700">{item['Nama Lembaga'] || item.institution_name || '-'}</td>
                    <td className="px-6 py-4 text-slate-700">{item['NAMA'] || item.name || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{item['Nomor WA'] || item.phone_number || '-'}</td>
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

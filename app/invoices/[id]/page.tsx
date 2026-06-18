"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Printer, Download, ArrowLeft } from "lucide-react";
import { fetchSheetData } from "@/lib/google-sheets";
import Link from "next/link";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string; // This is the order_id, e.g., "ORD-001"
  const [order, setOrder] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const ordersResult = await fetchSheetData("Orders");
        const paymentsResult = await fetchSheetData("Payments").catch(() => []);
        
        const orders = Array.isArray(ordersResult) ? ordersResult : [];
        const allPayments = Array.isArray(paymentsResult) ? paymentsResult : [];

        // Find matching order
        const matchedOrder = orders.find((o: any) => {
          const id = o['ID Order'] || o.id || '';
          return id === invoiceId || id === decodeURIComponent(invoiceId);
        });

        setOrder(matchedOrder || null);

        // Find payments for this order
        const matchedPayments = allPayments.filter((p: any) => {
          const pid = p['ID Order'] || p.order_id || '';
          return pid === invoiceId || pid === decodeURIComponent(invoiceId);
        });

        setPayments(matchedPayments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [invoiceId]);

  const formatRp = (num: any) => {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Using browser print dialog to save as PDF
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 pt-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-500">Memuat data invoice...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 p-8 pt-6 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto text-center py-20">
          <p className="text-slate-500 text-lg mb-4">Order dengan ID <strong>{decodeURIComponent(invoiceId)}</strong> tidak ditemukan.</p>
          <Link href="/invoices" className="text-emerald-600 hover:text-emerald-700 font-medium">
            ← Kembali ke Daftar Invoice
          </Link>
        </div>
      </div>
    );
  }

  const totalHarga = Number(order['Harga Total'] || order.total_amount || 0);
  const totalTerbayar = Number(order['Total Terbayar'] || order.paid_amount || 0);
  const sisaBayar = totalHarga - totalTerbayar;
  const status = (order['Status'] || order.status || 'Pending');
  const isLunas = status.toLowerCase() === 'lunas';

  // Parse items from string: "Title (Qtyx @ Price)"
  const rawItemsString = order['Judul Buku'] || order['Buku'] || '';
  const parsedItems: any[] = [];
  const regex = /(.+?)\s*\((\d+)x\s*@\s*(\d+)\)/g;
  let match;
  while ((match = regex.exec(rawItemsString)) !== null) {
    parsedItems.push({
      title: match[1].trim(),
      qty: Number(match[2]),
      price: Number(match[3]),
    });
  }
  
  // Fallback for old orders where Judul Buku was just a plain string
  if (parsedItems.length === 0 && rawItemsString) {
    parsedItems.push({
      title: rawItemsString,
      qty: Number(order['Jumlah'] || order['Qty'] || 1),
      price: Number(order['Harga Satuan'] || 0),
    });
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-area, #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          /* Hide sidebar when printing */
          nav, aside, header {
            display: none !important;
          }
        }
      `}</style>

      <div className="flex-1 p-8 pt-6 bg-slate-50 min-h-screen">
        {/* Action Buttons (hidden on print) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto mb-6 flex items-center justify-between no-print"
        >
          <Link href="/invoices" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Invoice
          </Link>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md shadow-blue-600/20 flex items-center gap-2 text-sm"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-2 text-sm"
            >
              <Printer className="h-4 w-4" />
              Cetak Invoice
            </motion.button>
          </div>
        </motion.div>

        {/* Invoice Content */}
        <motion.div
          id="invoice-print-area"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">INVOICE</h1>
                <p className="text-emerald-200 mt-1 text-sm">Kaffah Warehouse</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">INV-{order['ID Order'] || order.id}</p>
                <p className="text-emerald-200 text-sm mt-1">Tanggal: {order['Tanggal'] || order.order_date || '-'}</p>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div className={`px-8 py-3 text-center text-sm font-bold uppercase tracking-wide ${
            isLunas 
              ? 'bg-emerald-50 text-emerald-700 border-b border-emerald-100' 
              : 'bg-orange-50 text-orange-700 border-b border-orange-100'
          }`}>
            {isLunas ? '✅ LUNAS' : `⏳ ${status.toUpperCase()} — Sisa: ${formatRp(sisaBayar)}`}
          </div>

          {/* Order Details */}
          <div className="p-8">
            <div className="mb-8">
              <h3 className="text-xs uppercase text-slate-400 font-semibold mb-2 tracking-wide">Info Pesanan</h3>
              <div className="space-y-1 text-sm grid grid-cols-2 gap-4">
                <p><span className="text-slate-500">ID Order:</span> <span className="font-semibold text-slate-800">{order['ID Order'] || order.id}</span></p>
                <p><span className="text-slate-500">Nama:</span> <span className="font-semibold text-slate-800">{order['Nama'] || order['Customer'] || '-'}</span></p>
                <p><span className="text-slate-500">Institusi:</span> <span className="font-semibold text-slate-800">{order['Instansi'] || order['Institusi'] || '-'}</span></p>
                <p><span className="text-slate-500">No. WA:</span> <span className="font-semibold text-slate-800">{order['Nomor WA'] || order['No HP'] || order['No WA'] || '-'}</span></p>
                <p><span className="text-slate-500">Ekspedisi:</span> <span className="font-semibold text-slate-800">{order['Ekspedisi'] || '-'}</span></p>
                <p><span className="text-slate-500">Alamat:</span> <span className="font-semibold text-slate-800">{order['Alamat Lengkap'] || order['Alamat'] || '-'}</span></p>
              </div>
            </div>

            {/* Rincian Produk */}
            <div className="mb-8">
              <h3 className="text-xs uppercase text-slate-400 font-semibold mb-3 tracking-wide">Detail Produk</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs uppercase text-slate-500 font-semibold">Judul Buku</th>
                      <th className="text-right px-6 py-3 text-xs uppercase text-slate-500 font-semibold">Harga Satuan</th>
                      <th className="text-center px-6 py-3 text-xs uppercase text-slate-500 font-semibold">Jumlah</th>
                      <th className="text-right px-6 py-3 text-xs uppercase text-slate-500 font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedItems.map((item, idx) => (
                      <tr key={idx} className="border-t border-slate-100">
                        <td className="px-6 py-3 text-slate-800 font-medium">{item.title}</td>
                        <td className="px-6 py-3 text-right text-slate-600">{item.price ? formatRp(item.price) : '-'}</td>
                        <td className="px-6 py-3 text-center text-slate-800 font-medium">{item.qty}</td>
                        <td className="px-6 py-3 text-right text-slate-800 font-semibold">{item.price ? formatRp(item.price * item.qty) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs uppercase text-slate-500 font-semibold">Keterangan</th>
                    <th className="text-right px-6 py-3 text-xs uppercase text-slate-500 font-semibold">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100">
                    <td className="px-6 py-3 text-slate-700">Harga Total Pesanan</td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-900">{formatRp(totalHarga)}</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-6 py-3 text-slate-700">Total Terbayar</td>
                    <td className="px-6 py-3 text-right font-semibold text-emerald-600">{formatRp(totalTerbayar)}</td>
                  </tr>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-900">Sisa yang Harus Dibayar</td>
                    <td className={`px-6 py-4 text-right font-bold text-lg ${sisaBayar > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatRp(sisaBayar)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment History */}
            {payments.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs uppercase text-slate-400 font-semibold mb-3 tracking-wide">Riwayat Pembayaran</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs uppercase text-slate-500 font-semibold">Tanggal</th>
                        <th className="text-left px-6 py-3 text-xs uppercase text-slate-500 font-semibold">Metode</th>
                        <th className="text-right px-6 py-3 text-xs uppercase text-slate-500 font-semibold">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="px-6 py-3 text-slate-600">{p['Tanggal'] || p.payment_date || '-'}</td>
                          <td className="px-6 py-3 text-slate-600">{p['Metode'] || p.payment_method || '-'}</td>
                          <td className="px-6 py-3 text-right font-semibold text-emerald-600">
                            {formatRp(p['Jumlah Bayar '] || p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 pt-6 border-t border-slate-100">
              <p>Invoice ini dibuat secara otomatis oleh sistem Kaffah Warehouse.</p>
              <p className="mt-1">Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

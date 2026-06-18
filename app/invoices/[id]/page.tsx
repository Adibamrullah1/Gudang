"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Printer, Download, ArrowLeft } from "lucide-react";
import { fetchSheetData } from "@/lib/google-sheets";
import Link from "next/link";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
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

        const matchedOrder = orders.find((o: any) => {
          const id = o['ID Order'] || o.id || '';
          return id === invoiceId || id === decodeURIComponent(invoiceId);
        });

        setOrder(matchedOrder || null);

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
    return 'Rp' + Number(num || 0).toLocaleString('id-ID');
  };

  const handlePrint = () => {
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

  const subtotal = parsedItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const diskon15 = Math.round(subtotal * 0.15);
  const biayaPengiriman = 30000; // Default biaya pengiriman
  const grandTotal = subtotal - diskon15 + biayaPengiriman;

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
            padding: 1cm;
            font-size: 11pt;
          }
          .no-print {
            display: none !important;
          }
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
          className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between no-print"
        >
          <Link href="/invoices" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Invoice
          </Link>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
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

        {/* ===== INVOICE DOCUMENT ===== */}
        <motion.div
          id="invoice-print-area"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-[210mm] mx-auto bg-white border border-slate-300 shadow-xl"
          style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
        >
          {/* ===== HEADER ===== */}
          <div className="px-8 pt-6 pb-4">
            <div className="flex justify-between items-start">
              {/* Logo Area */}
              <div className="flex items-center gap-3">
                <div className="bg-[#005A9C] text-white px-3 py-2 rounded-md flex flex-col items-center leading-none">
                  <span className="text-2xl font-black">K</span>
                </div>
                <div>
                  <h2 className="text-[#005A9C] text-xl font-black tracking-tight leading-tight">KAFFAH</h2>
                  <p className="text-[#005A9C] text-xs font-bold tracking-wider leading-tight">EDUCATION</p>
                  <p className="text-[#E67E22] text-xs font-bold tracking-wider leading-tight">PARTNER</p>
                </div>
              </div>
              {/* Invoice Title */}
              <div className="text-right">
                <h1 className="text-5xl font-black text-[#E67E22] tracking-tight" style={{ fontFamily: "Impact, sans-serif" }}>INVOICE</h1>
              </div>
            </div>
          </div>

          {/* ===== TITLE BAR ===== */}
          <div className="px-8 pb-4">
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide">FORM PEMESANAN</h3>
              <h3 className="text-sm font-bold text-slate-800 tracking-wide">BUKU KAFAH EDUCATION PARTNER</h3>
            </div>
          </div>

          {/* ===== INFO SECTION ===== */}
          <div className="px-8 pb-4">
            <div className="flex justify-between items-start gap-6">
              {/* LEFT: Invoice To */}
              <div className="text-xs space-y-0.5 flex-1">
                <p className="font-bold text-slate-900">INVOICE TO:</p>
                <p className="text-slate-700">{order['Nama'] || order['Customer'] || '-'}</p>
                <p className="text-slate-700">{order['Instansi'] || order['Institusi'] || '-'}</p>
                <p className="text-slate-700">{order['Alamat Lengkap'] || order['Alamat'] || '-'}</p>
                <p className="text-slate-700 mt-1.5"><span className="font-semibold">TANGGAL:</span> {order['Tanggal'] || order.order_date || '-'}</p>
                <p className="text-slate-700"><span className="font-semibold">NO WA:</span> {order['No WA'] || order['Nomor WA'] || order['No HP'] || '-'}</p>
              </div>
              {/* RIGHT: Payment Info */}
              <div className="border-2 border-[#005A9C] p-3 text-xs space-y-0.5 flex-shrink-0">
                <p className="font-bold text-slate-900">INFO PEMBAYARAN:</p>
                <p className="text-slate-700">NO. REK : 6313-0102-5486-539</p>
                <p className="text-slate-700">NAMA&nbsp;&nbsp;&nbsp;&nbsp;: MOH SHORIH ALKHOLID</p>
                <p className="text-slate-700">BANK&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: BRI</p>
                <p className="text-slate-700 mt-1">Konfirmasi : 0856-4625-2020</p>
              </div>
            </div>
          </div>

          {/* ===== PRODUCT TABLE ===== */}
          <div className="px-8 pb-2">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#005A9C] text-white">
                  <th className="border border-[#005A9C] px-3 py-2 text-center font-bold w-10">NO</th>
                  <th className="border border-[#005A9C] px-3 py-2 text-left font-bold">NAMA PRODUK</th>
                  <th className="border border-[#005A9C] px-3 py-2 text-center font-bold w-28">HARGA @</th>
                  <th className="border border-[#005A9C] px-3 py-2 text-center font-bold w-20">JUMLAH</th>
                  <th className="border border-[#005A9C] px-3 py-2 text-center font-bold w-28">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {parsedItems.map((item, idx) => (
                  <tr key={idx} className="border border-slate-300">
                    <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">{idx + 1}</td>
                    <td className="border border-slate-300 px-3 py-2 text-slate-800">{item.title}</td>
                    <td className="border border-slate-300 px-3 py-2 text-right text-slate-700">{Number(item.price).toLocaleString('id-ID')}</td>
                    <td className="border border-slate-300 px-3 py-2 text-center text-slate-700 font-medium">{item.qty > 0 ? item.qty : ''}</td>
                    <td className="border border-slate-300 px-3 py-2 text-right text-slate-800 font-medium">
                      {item.qty > 0 ? formatRp(item.price * item.qty) : formatRp(0)}
                    </td>
                  </tr>
                ))}
                {/* Empty rows to match the template style if needed */}
                {parsedItems.length < 10 && Array.from({ length: Math.max(0, 10 - parsedItems.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="border border-slate-300">
                    <td className="border border-slate-300 px-3 py-2 text-center text-slate-400">{parsedItems.length + i + 1}</td>
                    <td className="border border-slate-300 px-3 py-2"></td>
                    <td className="border border-slate-300 px-3 py-2"></td>
                    <td className="border border-slate-300 px-3 py-2"></td>
                    <td className="border border-slate-300 px-3 py-2"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== TOTALS SECTION ===== */}
          <div className="px-8 pb-4">
            <div className="flex flex-col items-end text-sm space-y-1">
              {/* Subtotal */}
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-800 text-right w-40"></span>
                <span className="font-bold text-slate-900 text-right w-36">{formatRp(subtotal)}</span>
              </div>
              {/* Diskon */}
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-800 text-right w-40">Diskon 15%</span>
                <span className="font-bold text-right w-36 bg-[#E67E22] text-white px-3 py-0.5">{formatRp(diskon15)}</span>
              </div>
              {/* Biaya Pengiriman */}
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-800 text-right w-40">Biaya Pengiriman</span>
                <span className="font-bold text-slate-900 text-right w-36">{formatRp(biayaPengiriman)}</span>
              </div>
              {/* Grand Total */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xl font-black text-slate-900 text-right w-40">TOTAL</span>
                <span className="text-xl font-black text-right w-36 border-4 border-[#27AE60] bg-[#EAFAF1] text-[#27AE60] px-3 py-1">{formatRp(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* ===== PAYMENT HISTORY ===== */}
          {payments.length > 0 && (
            <div className="px-8 pb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Riwayat Pembayaran:</p>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-3 py-1.5 text-left font-bold text-slate-600">Tanggal</th>
                    <th className="border border-slate-300 px-3 py-1.5 text-left font-bold text-slate-600">Metode</th>
                    <th className="border border-slate-300 px-3 py-1.5 text-right font-bold text-slate-600">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={i}>
                      <td className="border border-slate-300 px-3 py-1.5 text-slate-600">{p['Tanggal'] || p.payment_date || '-'}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-slate-600">{p['Metode'] || p.payment_method || '-'}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-semibold text-emerald-700">
                        {formatRp(p['Jumlah Bayar '] || p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===== SIGNATURE SECTION ===== */}
          <div className="px-8 pt-6 pb-10">
            <div className="flex justify-between">
              {/* Left: Admin */}
              <div className="text-center">
                <p className="text-xs text-slate-500 italic mb-16">Admin</p>
                <div className="border-b border-slate-400 w-44 mx-auto"></div>
                <p className="text-sm font-bold text-slate-800 mt-1">Krisnayana Gumelar R</p>
              </div>
              {/* Right: Bag. Keuangan */}
              <div className="text-center">
                <p className="text-xs text-slate-500 italic mb-16">Bag. Keuangan</p>
                <div className="border-b border-slate-400 w-44 mx-auto"></div>
                <p className="text-sm font-bold text-slate-800 mt-1">M. SHORIH ALKHOLID</p>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </>
  );
}

"use client";

import { Activity, BookOpen, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const stats = [
    { name: 'Total Products', value: '8', icon: BookOpen, change: '+12%', changeType: 'positive' },
    { name: 'Total Customers', value: '142', icon: Users, change: '+4.5%', changeType: 'positive' },
    { name: 'Pending Orders', value: '12', icon: ShoppingCart, change: '-2%', changeType: 'negative' },
    { name: 'Monthly Revenue', value: 'Rp 24.5M', icon: Activity, change: '+18.2%', changeType: 'positive' },
  ];

  const salesData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: 8000 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-white min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between space-y-2"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-emerald-900">Dashboard</h2>
          <p className="text-muted-foreground text-slate-500">
            Overview performa gudang dan penjualan Kaffah hari ini.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md shadow-orange-500/20"
          >
            Download Report
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div 
            key={stat.name} 
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.1), 0 8px 10px -6px rgba(16, 185, 129, 0.1)" }}
            className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-emerald-600' : 'text-orange-500'
              }`}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm col-span-4"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Grafik Penjualan Bulan Ini</h3>
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>+18% dari bulan lalu</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#10b981', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm col-span-3"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Order Terbaru</h3>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i, index) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (index * 0.1) }}
                whileHover={{ x: 5, backgroundColor: '#f8fafc' }}
                className="flex items-center gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0 cursor-pointer p-2 -mx-2 rounded-lg transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <ShoppingCart className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none text-slate-800">Order ORD-0{i}</p>
                  <p className="text-xs text-slate-500">SD Tahfidz Assaadah</p>
                </div>
                <div className="text-sm font-bold text-emerald-600">
                  Rp {(1190000 * i).toLocaleString('id-ID')}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

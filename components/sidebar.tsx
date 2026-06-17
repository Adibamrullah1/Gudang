"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ShoppingCart, 
  FileText, 
  Wallet, 
  PackageSearch 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products (Buku)", href: "/products", icon: BookOpen },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Payments", href: "/payments", icon: Wallet },
  { name: "Inventory", href: "/inventory", icon: PackageSearch },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 border-r border-slate-800 text-slate-300">
      <div className="flex h-16 shrink-0 items-center px-6 bg-slate-950/50 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Kaffah Warehouse</span>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "hover:bg-slate-800/50 hover:text-white",
                  "group flex items-center gap-x-3 rounded-lg p-3 text-sm font-medium transition-all duration-200"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white",
                    "h-5 w-5 shrink-0 transition-colors duration-200"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-3">
          <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-sm font-medium text-white">AD</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Admin Kaffah</span>
            <span className="text-xs text-slate-400">Warehouse Manager</span>
          </div>
        </div>
      </div>
    </div>
  );
}

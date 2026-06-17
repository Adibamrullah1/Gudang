import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kaffah Warehouse Dashboard",
  description: "Dashboard manajemen gudang, buku, order, dan arus kas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full antialiased`}>
        <div className="flex h-full min-h-screen">
          {/* Sidebar Area */}
          <Sidebar />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="min-h-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

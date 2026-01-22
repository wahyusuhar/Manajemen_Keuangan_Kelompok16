import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import BusinessCard from "@/components/BusinessCard";
import LogoutButton from "@/components/LogoutButton";

export const revalidate = 0;

export default async function Home() {
  // 1. Ambil data usaha
  const { data: list_usaha, error } = await supabase
    .from('usaha')
    .select('*')
    .order('id', { ascending: true });

  if (error) console.error("Error:", error);

  const totalUsaha = list_usaha?.length || 0;
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-green-600 text-white p-1.5 rounded-lg shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72m-13.5 8.65h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .415.336.75.75.75Z" />
                </svg>
              </div>
              <span className="font-bold text-lg text-gray-800 tracking-tight">Kelompok<span className="text-green-600">16</span></span>
            </div>

            {/* Logout */}
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* --- KONTEN DASHBOARD --- */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 flex-grow w-full">
        
        {/* Section: Judul & Statistik */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div className="w-full md:w-auto">
            <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola Data Keuangan dengan mudah.</p>
          </div>
          
          {/* Card Statistik */}
          <div className="w-full md:w-auto bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between md:justify-start gap-4">
            <div className="flex items-center gap-4">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5M12 6.75h1.5m-3 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
                </div>
                <div className="text-left">
                <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">TOTAL USAHA</p>
                <p className="text-2xl font-bold text-gray-800 leading-none">{totalUsaha}</p>
                </div>
            </div>
          </div>
        </div>

        {/* --- TOMBOL AKSI (BARU) --- */}
        <div className="mb-8 flex flex-col md:flex-row gap-3">
            
            {/* 1. Tombol Tambah Usaha (Hijau) */}
            <Link 
              href="/tambah" 
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tambah Usaha Baru
            </Link>

            {/* 2. Tombol Kelola Kas (Kuning/Emas) - FITUR BARU */}
            <Link 
              href="/kas" 
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 4.5ZM3 4.5a1.5 1.5 0 0 0 1.5 1.5h15a1.5 1.5 0 0 0 1.5-1.5M3 7.5h18m-1.5 2.25c-.078-.314-.28-.588-.56-.75a3.006 3.006 0 0 0-2.829 0c-.28.162-.481.436-.56.75a3.007 3.007 0 0 0-.214.908c-.015.112-.016.226 0 .339.043.328.18.636.386.892.215.267.492.476.808.61.32.135.666.204 1.015.204s.695-.069 1.015-.204a2.296 2.296 0 0 0 .808-.61 2.26 2.26 0 0 0 .386-.892c.016-.113.015-.227 0-.339a3.007 3.007 0 0 0-.214-.908Z" />
              </svg>
              Kelola Kas & Iuran
            </Link>

        </div>

        {/* Grid List Usaha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {list_usaha?.map((item: any) => (
             <BusinessCard key={item.id} item={item} />
          ))} 

          {/* State Kosong */}
          {list_usaha?.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed mx-auto w-full">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📭</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Belum ada data</h3>
              <p className="text-gray-500 text-sm mt-1 px-4">Data usaha masih kosong. Silakan tambah data baru.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- FOOTER / COPYRIGHT --- */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-sm text-gray-600 font-medium">
                &copy; {currentYear} <span className="text-green-700 font-bold">KPM Kelompok 16</span> Desa Kragilan.
            </p>
            <p className="text-xs text-gray-400 mt-1">
                Dibuat dengan sepenuh ❤️ untuk kemajuan Kelompok 16.
            </p>
        </div>
      </footer>

    </main>
  );
}
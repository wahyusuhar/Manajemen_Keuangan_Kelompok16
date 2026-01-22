"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function KelolaKategoriPage() {
  const router = useRouter();
  const [listKategori, setListKategori] = useState<any[]>([]);
  const [namaBaru, setNamaBaru] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Ambil Data (READ)
  const fetchKategori = async () => {
    const { data, error } = await supabase
      .from("kategori_kas")
      .select("*")
      .order("id", { ascending: true });
    
    if (data) setListKategori(data);
    if (error) console.error(error);
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  // 2. Tambah Data (CREATE)
  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBaru) return;
    setLoading(true);

    const { error } = await supabase
      .from("kategori_kas")
      .insert([{ nama: namaBaru }]);

    if (error) {
      alert("Gagal menambah kategori!");
      console.error(error);
    } else {
      setNamaBaru(""); // Reset input
      fetchKategori(); // Refresh list
    }
    setLoading(false);
  };

  // 3. Hapus Data (DELETE)
  const handleHapus = async (id: number) => {
    const confirm = window.confirm("Yakin ingin menghapus kategori ini?");
    if (!confirm) return;

    // Cek dulu apakah kategori ini dipakai di transaksi kas
    const { count } = await supabase
        .from('uang_kas')
        .select('*', { count: 'exact', head: true })
        .eq('kategori_id', id);

    if (count && count > 0) {
        alert("Gagal! Kategori ini sedang digunakan dalam transaksi kas. Hapus transaksi terkait terlebih dahulu.");
        return;
    }

    const { error } = await supabase
      .from("kategori_kas")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Gagal menghapus!");
      console.error(error);
    } else {
      fetchKategori();
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center items-start">
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-800">Kelola Kategori Kas</h1>
            <Link href="/kas/tambah" className="text-sm text-blue-600 hover:underline">
              ← Kembali
            </Link>
        </div>

        {/* Form Tambah */}
        <form onSubmit={handleTambah} className="flex gap-2 mb-8">
          <input
            type="text"
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Nama kategori baru (misal: Sedekah)"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? "..." : "Tambah"}
          </button>
        </form>

        {/* List Kategori */}
        <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Daftar Kategori Tersedia</h3>
            
            {listKategori.length === 0 ? (
                <p className="text-center text-gray-400 py-4 italic">Belum ada kategori. Silakan tambah.</p>
            ) : (
                <ul className="divide-y divide-gray-100">
                {listKategori.map((item) => (
                    <li key={item.id} className="py-3 flex justify-between items-center group">
                        <span className="text-gray-700 font-medium">{item.nama}</span>
                        <button 
                            onClick={() => handleHapus(item.id)}
                            className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 px-2"
                            title="Hapus Kategori"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    </li>
                ))}
                </ul>
            )}
        </div>

      </div>
    </main>
  );
}
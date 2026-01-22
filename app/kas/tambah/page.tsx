"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TambahKasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Form
  const [jenis, setJenis] = useState("Masuk"); // Default: Pemasukan
  const [jumlah, setJumlah] = useState("");
  const [targetJumlah, setTargetJumlah] = useState(""); // State Baru: Target Bayar
  const [keterangan, setKeterangan] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  
  // Kategori
  const [kategoriId, setKategoriId] = useState("");
  const [listKategori, setListKategori] = useState<any[]>([]);

  // Ambil data Kategori saat halaman dimuat
  useEffect(() => {
    const fetchKategori = async () => {
      const { data } = await supabase
        .from("kategori_kas")
        .select("*")
        .order("nama", { ascending: true });
      
      if (data) setListKategori(data);
    };
    fetchKategori();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validasi input
    if (!jumlah || !kategoriId) {
      alert("Harap isi nominal dan pilih kategori!");
      setLoading(false);
      return;
    }

    // Kirim data ke Supabase
    const { error } = await supabase.from("uang_kas").insert([
      {
        jenis,
        jumlah: parseInt(jumlah), // Ubah text jadi angka
        target_jumlah: targetJumlah ? parseInt(targetJumlah) : 0, // SIMPAN TARGET JUMLAH
        keterangan,
        tanggal,
        kategori_id: parseInt(kategoriId),
      },
    ]);

    if (error) {
      alert("Gagal menyimpan: " + error.message);
      setLoading(false);
    } else {
      // Sukses! Balik ke halaman Kas
      router.push("/kas");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Header Form */}
        <div className="bg-gray-800 text-white p-6">
          <h1 className="text-xl font-bold">Catat Transaksi Kas</h1>
          <p className="text-gray-400 text-sm mt-1">Isi data pemasukan atau pengeluaran.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* 1. Pilih Jenis Transaksi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Transaksi</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setJenis("Masuk")}
                className={`p-3 rounded-xl border text-center font-bold transition ${
                  jenis === "Masuk" 
                    ? "bg-green-50 border-green-500 text-green-700 ring-2 ring-green-200" 
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                💰 Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setJenis("Keluar")}
                className={`p-3 rounded-xl border text-center font-bold transition ${
                  jenis === "Keluar" 
                    ? "bg-red-50 border-red-500 text-red-700 ring-2 ring-red-200" 
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                💸 Pengeluaran
              </button>
            </div>
          </div>

          {/* 2. Jumlah Uang (Nominal yang dibayar saat ini) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Nominal yang Dibayar (Rp)
            </label>
            <input
              type="number"
              required
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="0"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg outline-none"
            />
          </div>

          {/* 3. INPUT BARU: Target Pembayaran (Hanya muncul jika Masuk) */}
          {jenis === "Masuk" && (
            <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-yellow-800 mb-1">
                    Total yang Seharusnya Dibayar (Target)
                </label>
                <input
                    type="number"
                    value={targetJumlah}
                    onChange={(e) => setTargetJumlah(e.target.value)}
                    placeholder="Contoh: 20000"
                    className="w-full p-2 border border-yellow-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
                />
                <p className="text-xs text-yellow-600 mt-1">
                    *Isi jika ingin sistem menghitung kekurangan bayar (utang). Kosongkan jika lunas.
                </p>
            </div>
          )}

          {/* 4. Kategori (Dropdown) */}
          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Kategori Kas</label>
                {/* Link menuju halaman Kelola Kategori */}
                <Link href="/kas/kategori" className="text-xs text-blue-600 font-bold hover:underline">
                    + Kelola Kategori
                </Link>
            </div>
            <select
              required
              value={kategoriId}
              onChange={(e) => setKategoriId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Pilih Kategori --</option>
              {listKategori.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>

          {/* 5. Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Detail</label>
            <input
              type="text"
              required
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder={jenis === 'Masuk' ? "Contoh: Iuran dari Pak Budi" : "Contoh: Beli Kertas HVS"}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* 6. Tanggal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Tombol Simpan & Batal */}
          <div className="pt-4 flex gap-3">
            <Link
              href="/kas"
              className="w-1/3 py-3 px-4 border border-gray-300 rounded-xl text-center text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`w-2/3 py-3 px-4 rounded-xl text-white font-bold shadow-md transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
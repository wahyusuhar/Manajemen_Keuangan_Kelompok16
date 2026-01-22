"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function FormTransaksi({ usaha_id }: { usaha_id: string }) {
  const router = useRouter();
  
  const [mode, setMode] = useState<"Tutup" | "Pemasukan" | "Pengeluaran">("Tutup");
  const [isLoading, setIsLoading] = useState(false);
  const [jumlah, setJumlah] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jumlah || !keterangan) return alert("Mohon isi semua data!");

    setIsLoading(true);

    const { error } = await supabase.from("transaksi").insert({
      usaha_id: usaha_id,
      jenis: mode,
      jumlah: Number(jumlah),
      keterangan: keterangan,
      tanggal: new Date().toISOString().split("T")[0],
    });

    if (error) {
      alert("Gagal menyimpan: " + error.message);
    } else {
      setJumlah("");
      setKeterangan("");
      setMode("Tutup");
      router.refresh(); 
    }
    setIsLoading(false);
  };

  // TAMPILAN 1: Form Tertutup (Hanya Tombol)
  if (mode === "Tutup") {
    return (
      <div className="mt-6 flex gap-2 md:gap-3 w-full">
        {/* Tombol Pemasukan */}
        <button
          onClick={() => setMode("Pemasukan")}
          className="flex-1 bg-green-600 text-white px-2 py-2.5 md:px-4 md:py-2 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-1 md:gap-2 shadow-sm text-xs md:text-base whitespace-nowrap"
        >
          ➕ <span className="hidden md:inline">Catat</span> Pemasukan
        </button>

        {/* Tombol Pengeluaran */}
        <button
          onClick={() => setMode("Pengeluaran")}
          className="flex-1 bg-red-500 text-white px-2 py-2.5 md:px-4 md:py-2 rounded-lg font-bold hover:bg-red-600 transition flex items-center justify-center gap-1 md:gap-2 shadow-sm text-xs md:text-base whitespace-nowrap"
        >
          ➖ <span className="hidden md:inline">Catat</span> Pengeluaran
        </button>
      </div>
    );
  }

  // TAMPILAN 2: Mode Input (Form Terbuka)
  return (
    <div className={`mt-6 p-4 md:p-5 rounded-xl border-2 ${mode === 'Pemasukan' ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
      <h3 className={`font-bold mb-4 flex items-center gap-2 text-sm md:text-base ${mode === 'Pemasukan' ? 'text-green-700' : 'text-red-700'}`}>
        {mode === 'Pemasukan' ? '➕ Tambah Pemasukan' : '➖ Tambah Pengeluaran'}
      </h3>

      <form onSubmit={handleSimpan} className="space-y-3 md:space-y-4">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Jumlah Uang (Rp)</label>
          <input
            type="number"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Contoh: 50000"
            required
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Keterangan</label>
          <input
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder={mode === 'Pemasukan' ? "Contoh: Penjualan" : "Contoh: Beli Bahan"}
            required
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg font-bold text-white text-xs md:text-sm transition ${
               mode === 'Pemasukan' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isLoading ? "Menyimpan..." : "💾 Simpan"}
          </button>
          
          <button
            type="button"
            onClick={() => setMode("Tutup")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition text-xs md:text-sm"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
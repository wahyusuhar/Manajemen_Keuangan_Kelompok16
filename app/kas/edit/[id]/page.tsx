"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditKasPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrapping params (Next.js 15 requirement)
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [jenis, setJenis] = useState("Masuk");
  const [jumlah, setJumlah] = useState("");
  const [targetJumlah, setTargetJumlah] = useState(""); // Input baru: Seharusnya Bayar
  const [keterangan, setKeterangan] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [listKategori, setListKategori] = useState<any[]>([]);

  // 1. Fetch Data Awal (Transaksi & Kategori)
  useEffect(() => {
    const fetchData = async () => {
      // Ambil List Kategori
      const { data: katData } = await supabase.from("kategori_kas").select("*");
      if (katData) setListKategori(katData);

      // Ambil Detail Transaksi
      const { data: trx, error } = await supabase
        .from("uang_kas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Transaksi tidak ditemukan!");
        router.push("/kas");
      } else if (trx) {
        setJenis(trx.jenis);
        setJumlah(trx.jumlah);
        setTargetJumlah(trx.target_jumlah || ""); // Isi target jika ada
        setKeterangan(trx.keterangan);
        setTanggal(trx.tanggal);
        setKategoriId(trx.kategori_id);
      }
      setLoading(false);
    };

    fetchData();
  }, [id, router]);

  // 2. Simpan Perubahan
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("uang_kas")
      .update({
        jenis,
        jumlah: parseInt(jumlah),
        target_jumlah: targetJumlah ? parseInt(targetJumlah) : 0, // Simpan target
        keterangan,
        tanggal,
        kategori_id: parseInt(kategoriId),
      })
      .eq("id", id);

    if (error) {
      alert("Gagal update: " + error.message);
      setSaving(false);
    } else {
      router.push("/kas");
      router.refresh();
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-lg border border-gray-100 p-6">
        <h1 className="text-xl font-bold mb-6 text-gray-800">✏️ Edit Transaksi</h1>
        
        <form onSubmit={handleUpdate} className="space-y-4">
            
            {/* Jenis */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
                <select 
                    value={jenis} 
                    onChange={(e)=>setJenis(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                >
                    <option value="Masuk">Pemasukan</option>
                    <option value="Keluar">Pengeluaran</option>
                </select>
            </div>

            {/* Nominal Dibayar */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nominal yang Dibayar (Rp)</label>
                <input
                    type="number"
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                    className="w-full p-2 border rounded-lg font-bold text-lg"
                    required
                />
            </div>

            {/* Target Pembayaran (Hanya jika Pemasukan) */}
            {jenis === "Masuk" && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <label className="block text-sm font-medium text-yellow-800 mb-1">
                        Total yang Seharusnya Dibayar (Target)
                    </label>
                    <input
                        type="number"
                        value={targetJumlah}
                        onChange={(e) => setTargetJumlah(e.target.value)}
                        placeholder="Contoh: 20000"
                        className="w-full p-2 border border-yellow-300 rounded-lg"
                    />
                    <p className="text-xs text-yellow-600 mt-1">
                        *Isi jika ingin sistem menghitung kekurangan bayar.
                    </p>
                </div>
            )}

            {/* Kategori */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                    value={kategoriId}
                    onChange={(e) => setKategoriId(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    required
                >
                    <option value="">-- Pilih --</option>
                    {listKategori.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
            </div>

            {/* Keterangan */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <input
                    type="text"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    required
                />
            </div>

             {/* Tanggal */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    required
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Link href="/kas" className="w-1/2 py-2 text-center border rounded-lg text-gray-600 hover:bg-gray-50">
                    Batal
                </Link>
                <button type="submit" disabled={saving} className="w-1/2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">
                    {saving ? "Menyimpan..." : "Update Data"}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";

export default function EditTransaksiPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    tanggal: "",
    keterangan: "",
    jumlah: 0,
    jenis: "Pemasukan",
  });

  // Ambil Data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("transaksi")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setFormData({
            tanggal: data.tanggal,
            keterangan: data.keterangan,
            jumlah: data.jumlah,
            jenis: data.jenis
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  // Simpan Data
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("transaksi")
      .update(formData)
      .eq("id", id);

    if (error) {
      alert("Gagal update: " + error.message);
      setLoading(false);
    } else {
      router.back(); 
      router.refresh();
    }
  };

  // Helper untuk warna tema berdasarkan jenis transaksi
  const themeColor = formData.jenis === "Pemasukan" ? "text-green-600 border-green-600" : "text-red-600 border-red-600";
  const bgThemeColor = formData.jenis === "Pemasukan" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700";
  const softBgColor = formData.jenis === "Pemasukan" ? "bg-green-50" : "bg-red-50";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-4 w-4 bg-gray-400 rounded-full mb-2"></div>
        Loading...
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 md:flex md:items-center md:justify-center md:p-4">
      
      {/* Container utama: Full screen di mobile, Card di desktop */}
      <div className="bg-white w-full max-w-md md:rounded-3xl shadow-xl min-h-screen md:min-h-fit flex flex-col relative overflow-hidden">
        
        {/* Header Mobile */}
        <div className="px-6 pt-8 pb-4 flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition"
          >
            {/* Icon Back Chevron */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-800">Edit Transaksi</h1>
          <div className="w-8"></div> {/* Spacer agar judul center */}
        </div>

        <form onSubmit={handleUpdate} className="flex-1 flex flex-col px-6 pb-8">
            
            {/* Bagian 1: Selector Jenis Transaksi (Toggle Switch) */}
            <div className="bg-gray-100 p-1 rounded-xl flex mb-8">
                <button
                    type="button"
                    onClick={() => setFormData({...formData, jenis: "Pemasukan"})}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${
                        formData.jenis === "Pemasukan" 
                        ? "bg-white text-green-600 shadow-sm" 
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                    Pemasukan
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({...formData, jenis: "Pengeluaran"})}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${
                        formData.jenis === "Pengeluaran" 
                        ? "bg-white text-red-600 shadow-sm" 
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                    Pengeluaran
                </button>
            </div>

            {/* Bagian 2: Input Nominal (Hero Input) */}
            <div className="text-center mb-8">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jumlah Uang</label>
                <div className={`relative mt-2 border-b-2 ${themeColor} transition-colors duration-300`}>
                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 text-lg font-medium ${formData.jenis === 'Pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                        Rp
                    </span>
                    <input
                        type="number"
                        required
                        className={`w-full py-4 pl-8 pr-2 text-4xl font-bold text-gray-800 bg-transparent text-center focus:outline-none placeholder-gray-200`}
                        placeholder="0"
                        value={formData.jumlah}
                        onChange={(e) => setFormData({ ...formData, jumlah: Number(e.target.value) })}
                    />
                </div>
            </div>

            {/* Bagian 3: Detail Lainnya */}
            <div className="space-y-5">
                {/* Input Tanggal */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border border-gray-100 ${softBgColor}`}>
                     <div className={`p-2 rounded-lg bg-white shadow-sm ${formData.jenis === 'Pemasukan' ? 'text-green-500' : 'text-red-500'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                     </div>
                     <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Tanggal Transaksi</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-transparent font-medium text-gray-700 focus:outline-none text-sm"
                            value={formData.tanggal}
                            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                        />
                     </div>
                </div>

                {/* Input Keterangan */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border border-gray-100 ${softBgColor}`}>
                     <div className={`p-2 rounded-lg bg-white shadow-sm ${formData.jenis === 'Pemasukan' ? 'text-green-500' : 'text-red-500'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                     </div>
                     <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Keterangan</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Beli Pupuk"
                            className="w-full bg-transparent font-medium text-gray-700 focus:outline-none text-sm"
                            value={formData.keterangan}
                            onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                        />
                     </div>
                </div>
            </div>

            {/* Spacer agar tombol turun ke bawah */}
            <div className="mt-auto pt-8">
                <button
                    type="submit"
                    className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transform transition active:scale-95 ${bgThemeColor}`}
                >
                    Simpan Perubahan
                </button>
                
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full py-4 mt-2 text-gray-400 text-sm font-semibold hover:text-gray-600"
                >
                    Batal
                </button>
            </div>

        </form>
      </div>
    </main>
  );
}
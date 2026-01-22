"use client"; // Wajib karena ada interaksi tombol

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BusinessCard({ item }: { item: any }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Fungsi Menghapus Data
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Mencegah link utama terbuka
    e.stopPropagation(); // Mencegah event bubbling

    const confirmDelete = confirm(`Yakin ingin menghapus "${item.nama_usaha}"?`);
    if (!confirmDelete) return;

    setIsDeleting(true);

    // 1. Hapus Transaksi dulu (karena berelasi/foreign key)
    await supabase.from("transaksi").delete().eq("usaha_id", item.id);
    
    // 2. Hapus Usaha
    const { error } = await supabase.from("usaha").delete().eq("id", item.id);

    if (error) {
      alert("Gagal menghapus: " + error.message);
    } else {
      router.refresh(); // Refresh halaman agar data hilang dari list
    }
    setIsDeleting(false);
  };

  return (
    <Link
      href={`/usaha/${item.id}`}
      className="relative block bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-green-300 transition duration-300 group active:scale-[0.98] md:active:scale-100"
    >
      {/* Header Kartu */}
      <div className="flex justify-between items-start mb-3 gap-2">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 group-hover:text-green-700 line-clamp-1">
          {item.nama_usaha}
        </h2>
        <span className="shrink-0 text-[10px] md:text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200 whitespace-nowrap">
          Buka ➝
        </span>
      </div>

      <p className="text-xs md:text-sm text-gray-500 mb-2 flex items-center gap-1">
        👤 <span className="font-medium">{item.pemilik}</span>
      </p>

      <p className="text-gray-700 mb-12 line-clamp-2 text-sm leading-relaxed">
        {item.deskripsi}
      </p>

      {/* FOOTER: Kontak & Tombol Aksi */}
      <div className="absolute bottom-5 left-6 right-6 flex justify-between items-center pt-3 border-t">
        <div className="text-sm text-blue-600 font-medium flex items-center gap-1">
          📞 {item.kontak}
        </div>

        {/* Tombol Edit & Hapus */}
        <div className="flex gap-2">
            {/* Tombol Edit */}
            <Link
                href={`/edit/${item.id}`}
                onClick={(e) => e.stopPropagation()} // Supaya tidak membuka detail saat diklik
                className="bg-yellow-100 text-yellow-700 p-2 rounded-lg hover:bg-yellow-200 transition text-xs font-bold"
            >
                ✏️ Edit
            </Link>

            {/* Tombol Hapus */}
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition text-xs font-bold z-10"
            >
                {isDeleting ? "..." : "🗑️ Hapus"}
            </button>
        </div>
      </div>
    </Link>
  );
}
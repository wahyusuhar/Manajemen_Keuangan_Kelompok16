"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ActionButtons({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?");
    if (!confirmDelete) return;

    setLoading(true);
    const { error } = await supabase.from("transaksi").delete().eq("id", id);

    if (error) {
      alert("Gagal menghapus: " + error.message);
    } else {
      router.refresh(); // Refresh halaman agar data hilang dari tabel
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-2 justify-end">
      {/* Tombol Edit (Link ke halaman edit) */}
      <Link
        href={`/transaksi/edit/${id}`}
        className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs hover:bg-yellow-200 transition font-bold"
      >
        ✏️ Edit
      </Link>

      {/* Tombol Hapus */}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200 transition font-bold disabled:opacity-50"
      >
        {loading ? "..." : "🗑️ Hapus"}
      </button>
    </div>
  );
}
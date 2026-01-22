"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FormEdit({ usaha }: { usaha: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_usaha: usaha.nama_usaha || "",
    pemilik: usaha.pemilik || "",
    deskripsi: usaha.deskripsi || "",
    kontak: usaha.kontak || "",
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("usaha")
      .update(formData)
      .eq("id", usaha.id);

    if (error) {
      alert("Gagal update: " + error.message);
    } else {
      router.push("/"); // Kembali ke dashboard
      router.refresh(); // Refresh data
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleUpdate} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-semibold text-gray-600">Nama Usaha</label>
        <input
          required
          className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none"
          value={formData.nama_usaha}
          onChange={(e) => setFormData({ ...formData, nama_usaha: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-600">Nama Pemilik</label>
        <input
          required
          className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none"
          value={formData.pemilik}
          onChange={(e) => setFormData({ ...formData, pemilik: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-600">Deskripsi</label>
        <textarea
          required
          className="w-full border p-2 rounded-lg mt-1 h-24 focus:ring-2 focus:ring-green-500 outline-none"
          value={formData.deskripsi}
          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-600">Kontak (WA/HP)</label>
        <input
          required
          type="text"
          className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none"
          value={formData.kontak}
          onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
        />
      </div>

      <div className="flex gap-3 mt-4">
        <Link
          href="/"
          className="w-1/2 py-2 text-center border rounded-lg hover:bg-gray-100 font-semibold transition text-gray-600"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="w-1/2 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition flex justify-center"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}
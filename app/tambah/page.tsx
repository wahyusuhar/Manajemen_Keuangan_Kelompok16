'use client'; // Wajib ada karena ini halaman interaktif (pencet-pencet)

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function TambahUsaha() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Menyimpan data inputan
  const [formData, setFormData] = useState({
    nama_usaha: '',
    pemilik: '',
    deskripsi: '',
    kontak: ''
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // Kirim data ke Supabase
    const { error } = await supabase
      .from('usaha')
      .insert([formData]);

    if (error) {
      alert('Gagal menyimpan: ' + error.message);
      setLoading(false);
    } else {
      alert('Berhasil menambah usaha!');
      router.push('/'); // Kembali ke halaman depan
      router.refresh(); // Refresh data agar yang baru muncul
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">
          ➕ Tambah Usaha Baru
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Usaha</label>
            <input 
              type="text" name="nama_usaha" required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik</label>
            <input 
              type="text" name="pemilik" required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP / Kontak</label>
            <input 
              type="text" name="kontak" required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
            <textarea 
              name="deskripsi" rows={3}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
              onChange={handleChange}
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Sedang Menyimpan...' : 'Simpan Data'}
          </button>

          <button 
            type="button"
            onClick={() => router.back()}
            className="w-full text-gray-500 text-sm mt-2 hover:text-gray-700"
          >
            Batal / Kembali
          </button>
        </form>
      </div>
    </div>
  );
}
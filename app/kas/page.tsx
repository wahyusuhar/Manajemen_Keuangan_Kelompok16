"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper format rupiah
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function KasPage() {
  // --- STATE UTAMA ---
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [listKategori, setListKategori] = useState<any[]>([]);
  const [filterKategori, setFilterKategori] = useState("all");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ masuk: 0, keluar: 0, saldo: 0 });

  // --- STATE BENDAHARA ---
  const [showModalBendahara, setShowModalBendahara] = useState(false);
  const [bendahara, setBendahara] = useState({ id: 1, nama: "", ttd_url: "" });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
    fetchBendahara();
  }, []);

  // --- 1. FETCH DATA TRANSAKSI ---
  const fetchData = async () => {
    setLoading(true);
    const { data: dataKas, error: errKas } = await supabase
      .from("uang_kas")
      .select(`*, kategori_kas ( id, nama )`)
      .order("tanggal", { ascending: false })
      .order("id", { ascending: false });

    const { data: dataKat } = await supabase
      .from("kategori_kas")
      .select("*")
      .order("nama", { ascending: true });

    if (!errKas) {
      setTransaksi(dataKas || []);
      setListKategori(dataKat || []);
    }
    setLoading(false);
  };

  // --- 2. FETCH DATA BENDAHARA ---
  const fetchBendahara = async () => {
    const { data, error } = await supabase
      .from("profil_bendahara")
      .select("*")
      .single(); // Ambil satu baris saja
    
    if (data && !error) {
      setBendahara(data);
    }
  };

  // --- 3. FILTER LOGIC ---
  const filteredTransaksi = transaksi.filter((item) => {
    if (filterKategori === "all") return true;
    return item.kategori_id == filterKategori;
  });

  useEffect(() => {
    let masuk = 0;
    let keluar = 0;
    filteredTransaksi.forEach((item) => {
      if (item.jenis === "Masuk") masuk += item.jumlah;
      else keluar += item.jumlah;
    });
    setSummary({ masuk, keluar, saldo: masuk - keluar });
  }, [filterKategori, transaksi]);


  // --- 4. HANDLE UPLOAD & UPDATE BENDAHARA ---
  const handleSimpanBendahara = async () => {
    setUploading(true);
    let publicUrl = bendahara.ttd_url;

    // A. Jika ada file baru dipilih, upload dulu
    if (fileInputRef.current?.files?.length) {
        const file = fileInputRef.current.files[0];
        const fileName = `ttd-${Date.now()}.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("tanda-tangan")
            .upload(fileName, file, { upsert: true });

        if (uploadError) {
            alert("Gagal upload gambar: " + uploadError.message);
            setUploading(false);
            return;
        }

        // Dapatkan URL publik
        const { data: urlData } = supabase.storage
            .from("tanda-tangan")
            .getPublicUrl(fileName);
            
        publicUrl = urlData.publicUrl;
    }

    // B. Update Database
    const { error } = await supabase
        .from("profil_bendahara")
        .update({ nama: bendahara.nama, ttd_url: publicUrl })
        .eq("id", bendahara.id);

    if (error) {
        alert("Gagal menyimpan profil bendahara");
    } else {
        alert("Data Bendahara Berhasil Disimpan!");
        fetchBendahara();
        setShowModalBendahara(false);
    }
    setUploading(false);
  };

  const handleHapusTTD = async () => {
      if(!confirm("Hapus tanda tangan?")) return;
      const { error } = await supabase
        .from("profil_bendahara")
        .update({ ttd_url: null }) // Set null
        .eq("id", bendahara.id);
      
      if(!error) fetchBendahara();
  };

  // --- 5. LOGIC CETAK PDF (DENGAN GAMBAR) ---
  
  // Helper: Convert URL Gambar ke Base64 agar bisa masuk PDF
  const getImageDataUrl = async (url: string) => {
    if (!url) return null;
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Gagal load gambar", error);
        return null;
    }
  };

  const handleCetakPDF = async () => {
    const doc = new jsPDF();

    // Judul PDF
    let judulLaporan = "Laporan Keuangan Kas (Semua Kategori)";
    let namaFile = "Laporan_Kas_Semua";
    
    if (filterKategori !== "all") {
      const kat = listKategori.find((k) => k.id == filterKategori);
      const namaKategori = kat ? kat.nama : "Kategori";
      judulLaporan = `Laporan Kas: ${namaKategori}`;
      namaFile = `Laporan_Kas_${namaKategori.replace(/\s+/g, "_")}`;
    }

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN MANAJEMEN KEUANGAN KELOMPOK 16", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(judulLaporan, 105, 28, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 105, 34, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);

    // Tabel Data
    const tableRows = filteredTransaksi.map((item, index) => {
        const kurangBayar = (item.target_jumlah || 0) - item.jumlah;
        const status = (item.jenis === "Masuk" && kurangBayar > 0) 
            ? `Kurang ${formatRupiah(kurangBayar)}` 
            : "-";

        return [
            index + 1,
            new Date(item.tanggal).toLocaleDateString("id-ID"),
            item.jenis.toUpperCase(),
            item.kategori_kas?.nama || "Umum",
            item.keterangan,
            formatRupiah(item.jumlah),
            status
        ];
    });

    autoTable(doc, {
        head: [["No", "Tanggal", "Jenis", "Kategori", "Ket.", "Nominal", "Catatan"]],
        body: tableRows,
        startY: 45,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], halign: 'center' }, 
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            5: { halign: 'right', fontStyle: 'bold' },
            6: { textColor: [220, 38, 38], fontSize: 8 }
        },
        styles: { fontSize: 9, cellPadding: 3 },
    });

    // Ringkasan & Tanda Tangan
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Kotak Ringkasan
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, finalY, 90, 35, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text("Ringkasan Laporan:", 18, finalY + 8);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Pemasukan`, 18, finalY + 16);
    doc.text(`Total Pengeluaran`, 18, finalY + 22);
    doc.setFont("helvetica", "bold");
    doc.text(`Sisa Saldo Akhir`, 18, finalY + 30);
    doc.text(`: ${formatRupiah(summary.masuk)}`, 60, finalY + 16);
    doc.text(`: ${formatRupiah(summary.keluar)}`, 60, finalY + 22);
    doc.setTextColor(22, 163, 74);
    doc.text(`: ${formatRupiah(summary.saldo)}`, 60, finalY + 30);

    // --- AREA TANDA TANGAN ---
    const signX = 140;
    const signY = finalY + 5;
    
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Mengetahui,", signX + 25, signY, { align: "center" });
    doc.text("Bendahara", signX + 25, signY + 5, { align: "center" });

    // Render Gambar TTD jika ada
    if (bendahara.ttd_url) {
        const imgData = await getImageDataUrl(bendahara.ttd_url);
        if (imgData) {
            // (image, format, x, y, width, height)
            doc.addImage(imgData as string, 'PNG', signX + 5, signY + 8, 40, 20); 
        }
    }

    // Nama Bendahara
    doc.setFont("helvetica", "bold");
    doc.text(`( ${bendahara.nama || "...................."} )`, signX + 25, signY + 35, { align: "center" });

    doc.save(`${namaFile}.pdf`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    const { error } = await supabase.from("uang_kas").delete().eq("id", id);
    if (!error) fetchData(); 
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Nav */}
        <div className="flex justify-between items-center">
            <Link href="/" className="text-gray-500 hover:text-gray-900 text-sm font-medium">
                ← Kembali ke Dashboard
            </Link>

            {/* Tombol Setting Bendahara */}
            <button 
                onClick={() => setShowModalBendahara(true)}
                className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition flex items-center gap-1"
            >
                ⚙️ Atur TTD Bendahara
            </button>
        </div>

        {/* Judul & Filter Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">💰 Buku Kas & Iuran</h1>
                <p className="text-gray-500 text-sm mt-1">Kelola pencatatan keuangan dengan rapi.</p>
            </div>

            {/* AREA FILTER & CETAK */}
            <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
                <div className="flex flex-col">
                    <label className="text-[10px] text-gray-400 font-bold ml-1 uppercase">Filter Cetak</label>
                    <select 
                        value={filterKategori}
                        onChange={(e) => setFilterKategori(e.target.value)}
                        className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer min-w-[150px]"
                    >
                        <option value="all">🌐 Semua Kategori</option>
                        <hr />
                        {listKategori.map((k) => (
                            <option key={k.id} value={k.id}>📂 {k.nama}</option>
                        ))}
                    </select>
                </div>
                
                <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>

                <button 
                    onClick={handleCetakPDF}
                    className="bg-gray-800 hover:bg-gray-900 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm active:scale-95"
                >
                    🖨️ Cetak PDF
                </button>
            </div>
        </div>

        {/* --- MODAL BENDAHARA --- */}
        {showModalBendahara && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Pengaturan Bendahara</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bendahara</label>
                            <input 
                                type="text"
                                value={bendahara.nama || ""}
                                onChange={(e) => setBendahara({...bendahara, nama: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Cth: Siti Aminah"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanda Tangan (Gambar)</label>
                            
                            {/* Preview Gambar */}
                            {bendahara.ttd_url ? (
                                <div className="mb-2 relative w-full h-32 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden group">
                                    <img src={bendahara.ttd_url} alt="TTD" className="max-h-full object-contain" />
                                    <button 
                                        onClick={handleHapusTTD}
                                        className="absolute inset-0 bg-red-500 bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center text-transparent group-hover:text-red-600 font-bold transition"
                                    >
                                        Hapus Tanda Tangan
                                    </button>
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400 mb-2 italic">Belum ada tanda tangan. Upload format PNG transparan agar bagus.</div>
                            )}

                            <input 
                                type="file" 
                                ref={fileInputRef}
                                accept="image/*"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button 
                            onClick={() => setShowModalBendahara(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={handleSimpanBendahara}
                            disabled={uploading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploading ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- KONTEN UTAMA (SAMA SEPERTI SEBELUMNYA) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Saldo Terfilter</p>
                <h2 className={`text-2xl font-bold mt-1 ${summary.saldo >= 0 ? "text-blue-600" : "text-red-600"}`}>
                    {formatRupiah(summary.saldo)}
                </h2>
            </div>
            <div className="md:col-span-2 flex gap-4">
                <div className="flex-1 bg-green-50 p-4 rounded-xl border border-green-100">
                     <p className="text-xs text-green-600 font-bold uppercase">Total Masuk</p>
                     <p className="text-lg font-bold text-green-700">+ {formatRupiah(summary.masuk)}</p>
                </div>
                <div className="flex-1 bg-red-50 p-4 rounded-xl border border-red-100">
                     <p className="text-xs text-red-600 font-bold uppercase">Total Keluar</p>
                     <p className="text-lg font-bold text-red-700">- {formatRupiah(summary.keluar)}</p>
                </div>
            </div>
        </div>

        <Link href="/kas/tambah" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-center py-3 rounded-xl shadow-lg transition transform hover:scale-[1.01]">
            + Catat Transaksi Baru
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Riwayat Mutasi {filterKategori !== 'all' && "(Difilter)"}</h3>
            <span className="text-xs text-gray-400">{filteredTransaksi.length} Data ditemukan</span>
          </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-xs">
                    <tr>
                        <th className="px-4 py-3 whitespace-nowrap">Tanggal</th>
                        <th className="px-4 py-3 whitespace-nowrap">Kategori</th>
                        <th className="px-4 py-3 whitespace-nowrap">Keterangan</th>
                        <th className="px-4 py-3 text-right whitespace-nowrap">Nominal</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-400">Memuat data...</td></tr>
                    ) : filteredTransaksi.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">Tidak ada transaksi untuk kategori ini.</td></tr>
                    ) : (
                        filteredTransaksi.map((item) => {
                            const kurangBayar = (item.target_jumlah || 0) - item.jumlah;
                            const isKurang = item.jenis === "Masuk" && kurangBayar > 0;

                            return (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    {/* Kolom Tanggal: whitespace-nowrap agar tanggal sejajar */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="font-medium text-gray-800">
                                            {new Date(item.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className={`text-[10px] uppercase font-bold ${item.jenis === 'Masuk' ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.jenis}
                                        </div>
                                    </td>
                                    
                                    {/* Kolom Kategori: whitespace-nowrap agar tidak turun 3 baris */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium border border-blue-100">
                                            {item.kategori_kas?.nama || "-"}
                                        </span>
                                    </td>
                                    
                                    {/* Kolom Keterangan: whitespace-nowrap agar nama & tag kurang bayar sejajar */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-medium">{item.keterangan}</span>
                                            {isKurang && (
                                                <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-100 w-fit mt-1">
                                                    ⚠ Kurang {formatRupiah(kurangBayar)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    
                                    {/* Kolom Nominal */}
                                    <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${item.jenis === "Masuk" ? "text-green-600" : "text-red-600"}`}>
                                        {item.jenis === "Masuk" ? "+" : "-"} {formatRupiah(item.jumlah)}
                                    </td>
                                    
                                    {/* Kolom Aksi */}
                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                        <div className="flex justify-center gap-2">
                                            <Link href={`/kas/edit/${item.id}`} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded">
                                                ✏️
                                            </Link>
                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { notFound } from "next/navigation";
import FormTransaksi from "@/components/FormTransaksi";
// import DownloadPDF from "@/components/DownloadPDF"; // <--- HAPUS INI
import DownloadSection from "@/components/DownloadSection"; // <--- 1. GANTI DENGAN INI
import ActionButtons from "@/components/ActionButtons";

export const revalidate = 0;

const hitungSaldo = (transaksi: any[]) => {
  let saldo = 0;
  transaksi.forEach((t) => {
    if (t.jenis === 'Pemasukan') saldo += t.jumlah;
    else saldo -= t.jumlah;
  });
  return saldo;
};

export default async function DetailUsaha({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 

  const { data: usaha, error } = await supabase
    .from('usaha')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !usaha) return notFound();

  const { data: transaksi } = await supabase
    .from('transaksi')
    .select('*')
    .eq('usaha_id', id)
    .order('tanggal', { ascending: false });

  const saldoTotal = hitungSaldo(transaksi || []);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-4">
            <Link href="/" className="text-gray-500 hover:text-green-600 font-medium text-sm md:text-base">
                ← Kembali ke Dashboard
            </Link>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-0">
                
                {/* Bagian Kiri: Info */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 break-words">{usaha.nama_usaha}</h1>
                    <p className="text-gray-600 text-sm md:text-base">Pemilik: {usaha.pemilik}</p>
                    <p className="text-xs md:text-sm text-gray-500 mt-2">{usaha.deskripsi}</p>
                </div>

                {/* Bagian Kanan: Saldo & Download Section */}
                <div className="w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0 flex flex-col gap-3 md:items-end">
                    <div className="md:text-right w-full">
                        <div className="text-xs md:text-sm text-gray-500 mb-1 text-right">Total Saldo Kas (Semua)</div>
                        <div className={`text-2xl md:text-3xl font-bold text-right ${saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Rp {saldoTotal.toLocaleString('id-ID')}
                        </div>
                    </div>
                    
                    {/* 2. MASUKKAN COMPONENT FILTER & DOWNLOAD DISINI */}
                    <DownloadSection 
                        usaha={usaha} 
                        transaksi={transaksi || []} 
                    />

                </div>
            </div>
            
            <FormTransaksi usaha_id={id} />
        </div>

        {/* Tabel Riwayat Transaksi (Tetap Menampilkan SEMUA data, filter hanya untuk PDF) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
                <h2 className="font-bold text-gray-700 text-sm md:text-base">Riwayat Transaksi</h2>
            </div>
            
            {transaksi && transaksi.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-100 text-gray-600 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-4 py-3">Tanggal</th>
                                <th className="px-4 py-3 w-full">Keterangan</th>
                                <th className="px-4 py-3">Jenis</th>
                                <th className="px-4 py-3 text-right">Jumlah (Rp)</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transaksi.map((t: any) => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-500 text-xs md:text-sm">{t.tanggal}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800 text-sm md:text-base truncate max-w-[150px] md:max-w-none">
                                        {t.keterangan}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-bold ${
                                            t.jenis === 'Pemasukan' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {t.jenis}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-3 text-right font-bold text-sm md:text-base ${
                                        t.jenis === 'Pemasukan' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {t.jenis === 'Pengeluaran' ? '-' : ''} 
                                        {t.jumlah.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <ActionButtons id={t.id} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-8 text-center text-gray-400 text-sm">
                    Belum ada transaksi tercatat.
                </div>
            )}
        </div>

      </div>
    </main>
  );
}
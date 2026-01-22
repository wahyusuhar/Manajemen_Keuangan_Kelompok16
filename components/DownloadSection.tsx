"use client";

import { useState, useMemo } from "react";
import DownloadPDF from "./DownloadPDF";

export default function DownloadSection({ 
  usaha, 
  transaksi 
}: { 
  usaha: any; 
  transaksi: any[] 
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Logic Filter Data
  const filteredData = useMemo(() => {
    return transaksi.filter((t) => {
      if (!startDate && !endDate) return true; // Jika tidak ada filter, ambil semua
      
      const tDate = new Date(t.tanggal);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return tDate >= start && tDate <= end;
      } else if (start) {
        return tDate >= start;
      } else if (end) {
        return tDate <= end;
      }
      return true;
    });
  }, [transaksi, startDate, endDate]);

  // Hitung Saldo berdasarkan data yang difilter (Opsional: agar PDF sinkron)
  const saldoFiltered = useMemo(() => {
    let saldo = 0;
    filteredData.forEach((t) => {
      if (t.jenis === 'Pemasukan') saldo += t.jumlah;
      else saldo -= t.jumlah;
    });
    return saldo;
  }, [filteredData]);

  return (
    <div className="flex flex-col gap-3 items-end w-full">
      {/* Input Tanggal */}
      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto justify-end">
        <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase">Dari</label>
            <input 
                type="date" 
                className="border rounded px-2 py-1 text-xs md:text-sm text-gray-700 focus:outline-green-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
            />
        </div>
        <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase">Sampai</label>
            <input 
                type="date" 
                className="border rounded px-2 py-1 text-xs md:text-sm text-gray-700 focus:outline-green-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
            />
        </div>
      </div>

      {/* Info Jumlah Data */}
      <div className="text-xs text-gray-400">
        {filteredData.length} data terpilih
      </div>

      {/* Tombol Download dengan Data Terfilter */}
      <DownloadPDF 
        usaha={usaha} 
        transaksi={filteredData} 
        saldoTotal={saldoFiltered} 
      />
    </div>
  );
}
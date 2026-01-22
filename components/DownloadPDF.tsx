"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DownloadPDFProps {
  usaha: any;
  transaksi: any[];
  saldoTotal: number;
}

export default function DownloadPDF({ usaha, transaksi, saldoTotal }: DownloadPDFProps) {
  
  const handleDownload = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth(); // Ambil lebar halaman untuk centering

    // --- BAGIAN 1: KOP SURAT ---
    
    // A. Nama Usaha (Tengah, Besar, Bold)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0); // Hitam pekat
    // Parameter 'align: center' membuat teks otomatis di tengah berdasarkan koordinat X (pageWidth / 2)
    doc.text(usaha.nama_usaha.toUpperCase(), pageWidth / 2, 20, { align: "center" });

    // B. Sub-Header (Pemilik & Kontak) - (Tengah, Kecil)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80); // Abu-abu gelap
    const subHeader = `Pemilik: ${usaha.pemilik}  |  Kontak: ${usaha.kontak}`;
    doc.text(subHeader, pageWidth / 2, 27, { align: "center" });

    // C. Garis Bawah Kop Surat
    doc.setDrawColor(50); // Warna garis (abu tua)
    doc.setLineWidth(1);  // Ketebalan garis
    // Menggambar garis dari kiri (x=10) ke kanan (x = lebar halaman - 10) pada ketinggian y=32
    doc.line(10, 32, pageWidth - 10, 32); 

    // --- BAGIAN 2: JUDUL LAPORAN & TANGGAL ---
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("Laporan Riwayat Transaksi", 14, 42); // Judul Kiri
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    const tanggalCetak = new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    doc.text(`Dicetak pada: ${tanggalCetak}`, pageWidth - 14, 42, { align: "right" }); // Tanggal Kanan

    // --- BAGIAN 3: TABEL TRANSAKSI ---
    const tableColumn = ["Tanggal", "Keterangan", "Jenis", "Jumlah (Rp)"];
    const tableRows: any[] = [];

    transaksi.forEach((t) => {
      const isMasuk = t.jenis === 'Pemasukan';
      const transactionData = [
        t.tanggal,
        t.keterangan,
        t.jenis,
        (isMasuk ? '' : '- ') + t.jumlah.toLocaleString('id-ID'),
      ];
      tableRows.push(transactionData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 48, // Mulai tabel sedikit di bawah judul
      theme: 'grid',
      headStyles: { 
          fillColor: [22, 163, 74], // Hijau
          halign: 'center' // Judul kolom rata tengah
      }, 
      styles: { 
          fontSize: 10,
          cellPadding: 3 
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Lebar kolom tanggal
        2: { cellWidth: 30, halign: 'center' }, // Jenis rata tengah
        3: { halign: 'right', fontStyle: 'bold' }, // Jumlah rata kanan & tebal
      },
      // Mewarnai baris tabel (Zebra striping otomatis ada di theme grid, tapi kita bisa custom font color jika mau)
      didParseCell: function(data) {
          // Opsional: Warnai teks jumlah (Hijau/Merah)
          if (data.section === 'body' && data.column.index === 3) {
              const rawValue = data.cell.raw as string;
              if (rawValue.includes('-')) {
                  data.cell.styles.textColor = [220, 38, 38]; // Merah
              } else {
                  data.cell.styles.textColor = [22, 163, 74]; // Hijau
              }
          }
      }
    });

    // --- BAGIAN 4: FOOTER (TOTAL SALDO) ---
    // Mengambil posisi Y terakhir setelah tabel selesai
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Kotak Ringkasan Saldo
    doc.setFillColor(245, 245, 245); // Background abu sangat muda
    doc.rect(pageWidth - 80, finalY - 10, 70, 20, "F"); // Kotak background

    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Total Saldo Akhir:`, pageWidth - 75, finalY); // Label
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0); // Hitam
    doc.text(`Rp ${saldoTotal.toLocaleString('id-ID')}`, pageWidth - 15, finalY + 1, { align: "right" }); // Angka

    // Simpan PDF
    doc.save(`Laporan_${usaha.nama_usaha.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition flex items-center gap-2"
    >
      📄 Download Laporan
    </button>
  );
}
"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper format rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

// Helper format tanggal
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function PrintKasButton({ data }: { data: any[] }) {
  const handlePrint = () => {
    const doc = new jsPDF();

    // --- 1. HEADER (Kop Surat Modern) ---
    // Blok Hijau di atas
    doc.setFillColor(22, 163, 74); // Warna Green-600
    doc.rect(0, 0, 210, 40, "F"); // Kotak memenuhi lebar A4

    // Judul Utama (Putih)
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Laporan Kas & Iuran", 14, 20);

    // Sub-judul (Putih agak transparan)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Sistem Informasi UMKM Desa Kragilan", 14, 28);
    
    // Info Tanggal Cetak (Kanan Atas)
    doc.text(`Dicetak: ${formatDate(new Date().toISOString())}`, 195, 20, { align: "right" });
    doc.text("Oleh: Admin Desa", 195, 28, { align: "right" });

    // --- 2. PERHITUNGAN DATA ---
    const totalMasuk = data
      .filter((d) => d.jenis === "Masuk")
      .reduce((a, b) => a + b.jumlah, 0);
    const totalKeluar = data
      .filter((d) => d.jenis === "Keluar")
      .reduce((a, b) => a + b.jumlah, 0);
    const saldo = totalMasuk - totalKeluar;

    const sortedData = [...data].sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    );

    const tableRows = sortedData.map((item, index) => [
      index + 1,
      formatDate(item.tanggal),
      item.keterangan + (item.usaha ? `\n(Sumber: ${item.usaha.nama_usaha})` : ""),
      item.jenis === "Masuk" ? formatRupiah(item.jumlah) : "-",
      item.jenis === "Keluar" ? formatRupiah(item.jumlah) : "-",
    ]);

    // --- 3. TABEL DATA (AutoTable) ---
    autoTable(doc, {
      head: [["No", "Tanggal", "Keterangan", "Pemasukan", "Pengeluaran"]],
      body: tableRows,
      startY: 50, // Mulai agak ke bawah dari header hijau
      theme: "grid", // Grid agar ada garis pembatas
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [50, 50, 50],
        lineColor: [200, 200, 200], // Garis abu-abu halus
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [255, 255, 255], // Header Putih
        textColor: [22, 163, 74], // Teks Hijau
        fontStyle: "bold",
        lineWidth: 0, // Header tanpa border vertikal tebal
        borderBottomWidth: 1.5, // Garis bawah tebal di header
        borderColor: [22, 163, 74],
      },
      alternateRowStyles: {
        fillColor: [245, 250, 245], // Baris selang-seling warna hijau sangat muda
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" }, // No
        1: { cellWidth: 35 }, // Tanggal
        2: { cellWidth: "auto" }, // Keterangan (otomatis lebar sisa)
        3: { cellWidth: 35, halign: "right", textColor: [22, 163, 74] }, // Masuk (Hijau, Rata Kanan)
        4: { cellWidth: 35, halign: "right", textColor: [220, 38, 38] }, // Keluar (Merah, Rata Kanan)
      },
      didParseCell: function (data) {
        // Biar baris keterangan agak lega
        if (data.section === 'body' && data.column.index === 2) {
            data.cell.styles.cellPadding = 4;
        }
      }
    });

    // --- 4. RINGKASAN TOTAL (Di Kanan Bawah) ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const pageWidth = doc.internal.pageSize.width;
    const boxWidth = 80;
    const startX = pageWidth - boxWidth - 14; // Posisi X (Rata Kanan)

    // Garis Pemisah Tipis
    doc.setDrawColor(200, 200, 200);
    doc.line(startX, finalY, pageWidth - 14, finalY);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    // Label & Nilai (Pemasukan)
    doc.text("Total Pemasukan:", startX, finalY + 8);
    doc.text(formatRupiah(totalMasuk), pageWidth - 14, finalY + 8, { align: "right" });

    // Label & Nilai (Pengeluaran)
    doc.text("Total Pengeluaran:", startX, finalY + 14);
    doc.text(formatRupiah(totalKeluar), pageWidth - 14, finalY + 14, { align: "right" });

    // Garis Pemisah Tebal (Saldo Akhir)
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(startX, finalY + 18, pageWidth - 14, finalY + 18);

    // TOTAL SALDO (Besar & Hijau)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74); // Hijau
    doc.text("Sisa Saldo Kas:", startX, finalY + 26);
    doc.text(formatRupiah(saldo), pageWidth - 14, finalY + 26, { align: "right" });

    // --- 5. FOOTER (Halaman) ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Halaman ${i} dari ${pageCount} | Dokumen ini digenerate otomatis oleh sistem.`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    doc.save(`Laporan-Kas-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <button
      onClick={handlePrint}
      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 flex items-center gap-2 transition active:scale-95"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
        />
      </svg>
      Cetak PDF
    </button>
  );
}
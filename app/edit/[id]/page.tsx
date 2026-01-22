import { supabase } from "@/lib/supabaseClient";
import FormEdit from "./FormEdit"; 

export const revalidate = 0;

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Ambil ID dari URL
  const { id } = await params;

  console.log(">>> DEBUG: Mencari ID:", id); // Cek Terminal VS Code Anda saat refresh

  // 2. Cek ke Supabase
  const { data: usaha, error } = await supabase
    .from("usaha")
    .select("*")
    .eq("id", id)
    .single();

  console.log(">>> DEBUG: Hasil Data:", usaha); // Cek Terminal VS Code
  console.log(">>> DEBUG: Error:", error);      // Cek Terminal VS Code

  // 3. JIKA DATA KOSONG / ERROR (Jangan return notFound dulu, kita mau lihat errornya)
  if (!usaha || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-2">❌ Data Tidak Ditemukan</h1>
        <div className="bg-white p-6 rounded-xl shadow border border-red-200 text-left max-w-lg w-full">
          <p className="font-bold text-gray-700">Detail Debugging:</p>
          <ul className="list-disc pl-5 text-sm text-gray-600 mt-2 space-y-1">
            <li><strong>ID yang dicari:</strong> {id}</li>
            <li><strong>Status Data:</strong> {usaha ? "Ada" : "NULL (Kosong)"}</li>
            <li><strong>Pesan Error Supabase:</strong> {error ? error.message : "Tidak ada error teknis"}</li>
            <li><strong>Kemungkinan Penyebab:</strong> {error?.code === "PGRST116" ? "ID tidak ada di database." : "Mungkin masalah RLS (Permission)."}</li>
          </ul>
          
          <div className="mt-6 pt-4 border-t">
            <a href="/" className="text-blue-600 hover:underline">← Kembali ke Dashboard</a>
          </div>
        </div>
      </div>
    );
  }

  // 4. Jika Data Ada, Tampilkan Form
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md w-full max-w-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">✏️ Edit Usaha</h1>
        <FormEdit usaha={usaha} />
      </div>
    </main>
  );
}
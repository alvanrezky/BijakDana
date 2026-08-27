import { NextRequest, NextResponse } from "next/server";

const FREE_MODELS = ["openrouter/free"];

function formatRupiah(n: number) {
  return `Rp${(n || 0).toLocaleString("id-ID")}`;
}

const PILLAR_LABELS: Record<string, string> = {
  savings: "Konsistensi Menabung",
  budget: "Kepatuhan Budget",
  emergency: "Dana Darurat",
  stability: "Stabilitas Pengeluaran",
  diversification: "Diversifikasi Simpanan",
};

const HEALTH_LABELS: Record<string, string> = {
  sehat: "Sehat",
  cukup: "Cukup",
  perhatian: "Perlu Perhatian",
};

export async function POST(req: NextRequest) {
  const { messages, userFinance } = await req.json();

  let dataText = "Data keuangan pengguna belum tersedia.";

  if (userFinance) {
    const {
      profile,
      budget,
      goals,
      totalPengeluaranBulanIni,
      totalPemasukanBulanIni,
      transaksiTerakhir,
      riwayatBulanan,
      skorKesehatan,
    } = userFinance;

    dataText = `
PROFIL PENGGUNA:
- Nama: ${profile?.name ?? "-"}
- Pendapatan: ${formatRupiah(profile?.income)} (${profile?.incomeType ?? "-"})
- Target dana darurat: ${formatRupiah(profile?.emergencyFundTarget)}
- Dana darurat terkumpul: ${formatRupiah(profile?.emergencyFundCurrent)}

BUDGET PER KATEGORI:
${
  Object.entries(budget || {})
    .map(([cat, amount]) => `- ${cat}: ${formatRupiah(Number(amount))}`)
    .join("\n") || "Belum ada budget."
}

TARGET TABUNGAN (GOALS):
${
  (goals || [])
    .map((g: any) => `- ${g.name}: target ${formatRupiah(g.targetAmount)} dalam ${g.targetMonths} bulan`)
    .join("\n") || "Belum ada target tabungan."
}

RINGKASAN BULAN INI:
- Total pemasukan: ${formatRupiah(totalPemasukanBulanIni)}
- Total pengeluaran: ${formatRupiah(totalPengeluaranBulanIni)}

RIWAYAT PEMASUKAN & PENGELUARAN PER BULAN (dari yang terlama ke terbaru):
${
  (riwayatBulanan || [])
    .map(
      (m: any) =>
        `- ${m.label}: pemasukan ${formatRupiah(m.pemasukan)}, pengeluaran ${formatRupiah(
          m.pengeluaran
        )}, selisih ${formatRupiah(m.selisih)}`
    )
    .join("\n") || "Belum ada riwayat bulanan."
}

SKOR KESEHATAN FINANSIAL:
${
  skorKesehatan
    ? `- Skor keseluruhan: ${skorKesehatan.overall}/100 (kategori: ${HEALTH_LABELS[skorKesehatan.label] ?? skorKesehatan.label})
- Rincian per pilar:
${skorKesehatan.pillars
  .map(
    (p: any) =>
      `  • ${PILLAR_LABELS[p.key] ?? p.key}: ${p.score}/100${p.hasData ? "" : " (data belum cukup)"}`
  )
  .join("\n")}
- Pilar yang paling perlu diperbaiki: ${skorKesehatan.pilarTerlemah
        .map((p: any) => `${PILLAR_LABELS[p.key] ?? p.key} (${p.score}/100)`)
        .join(", ")}`
    : "Skor kesehatan finansial belum tersedia."
}

TRANSAKSI TERAKHIR:
${
  (transaksiTerakhir || [])
    .map(
      (t: any) =>
        `- ${t.date} | ${t.type === "expense" ? "Keluar" : "Masuk"} | ${t.cat} | ${formatRupiah(
          t.amount
        )} | ${t.desc}`
    )
    .join("\n") || "Belum ada transaksi."
}
`.trim();
  }

  const systemPrompt = `Kamu adalah asisten keuangan pribadi BijakDana. Jawab dalam Bahasa Indonesia yang ramah, singkat, dan jelas.

ATURAN FORMAT:
- Boleh gunakan markdown sederhana (bold dengan **teks**, atau list dengan tanda -) hanya jika benar-benar diperlukan
- DILARANG KERAS menggunakan heading markdown (#, ##, ###) dalam bentuk apapun
- Tulis jawaban sebagai paragraf mengalir, boleh pakai **bold** untuk penekanan kata tertentu saja, bukan untuk judul section
- Jangan menampilkan ulang seluruh data pengguna dalam bentuk tabel/daftar panjang kecuali diminta secara spesifik
- Langsung jawab inti pertanyaan pengguna secara natural, maksimal 4-6 kalimat
- Berikan saran yang spesifik berdasarkan data berikut. Jangan mengarang angka yang tidak ada di data.
- Jika pengguna bertanya soal bulan atau periode tertentu (misal "bulan lalu", "3 bulan terakhir", nama bulan tertentu), gunakan data di bagian RIWAYAT PEMASUKAN & PENGELUARAN PER BULAN untuk menjawab, bukan hanya RINGKASAN BULAN INI.
- Jika pengguna bertanya soal skor kesehatan finansial (misal "gimana skor kesehatan saya", "kenapa skor saya rendah", "apa yang perlu diperbaiki"), gunakan data di bagian SKOR KESEHATAN FINANSIAL. Jelaskan dengan bahasa yang mudah dipahami, fokus ke pilar yang paling lemah, dan beri saran konkret untuk memperbaikinya berdasarkan data transaksi/budget yang ada.

${dataText}`;

  const payloadMessages = [{ role: "system", content: systemPrompt }, ...messages];

  let aiReply = "";
  let lastError = "";

  for (const model of FREE_MODELS) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://alvan.dev",
          "X-Title": "BijakDana AI",
        },
        body: JSON.stringify({ model, messages: payloadMessages }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          aiReply = reply;
          break;
        }
      } else {
        lastError = await response.text();
        console.error(`Model ${model} gagal:`, lastError);
      }
    } catch (err) {
      lastError = String(err);
    }
  }

  if (!aiReply) {
    console.error("Semua model gagal:", lastError);
    return NextResponse.json({
      reply: "Maaf, semua model AI gratis sedang tidak tersedia. Coba lagi nanti.",
    });
  }

  return NextResponse.json({ reply: aiReply });
}
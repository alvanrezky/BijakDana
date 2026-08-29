import { NextRequest, NextResponse } from "next/server";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/constants/categories";

const FREE_MODELS = ["openrouter/free"];
const MAX_ATTEMPTS_PER_MODEL = 3;

const VALID_EXPENSE_CATS = EXPENSE_CATEGORIES.map((c) => c.id);
const VALID_INCOME_CATS = INCOME_CATEGORIES.map((c) => c.id);
const VALID_METHODS = ["GoPay", "OVO", "DANA", "Transfer bank", "Cash", "Kartu debit", "Kartu kredit"];

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

function formatRupiah(n: number) {
  return `Rp${(n || 0).toLocaleString("id-ID")}`;
}

type ParsedAiResponse = {
  reply: string;
  transaksi: {
    type: "income" | "expense";
    cat: string;
    amount: number;
    desc: string;
    method: string;
  } | null;
};

function extractJson(raw: string): any | null {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function validateParsed(parsed: any): ParsedAiResponse | null {
  if (!parsed || typeof parsed !== "object") return null;

  const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
  if (reply.length < 3) return null;

  let transaksi: ParsedAiResponse["transaksi"] = null;

  if (parsed.transaksi && typeof parsed.transaksi === "object") {
    const t = parsed.transaksi;
    const type = t.type === "income" || t.type === "expense" ? t.type : null;
    const amount = typeof t.amount === "number" && isFinite(t.amount) && t.amount > 0 ? t.amount : null;

    if (type && amount) {
      const validCats = type === "expense" ? VALID_EXPENSE_CATS : VALID_INCOME_CATS;
      const cat = validCats.includes(t.cat) ? t.cat : type === "expense" ? "lain" : "lain-in";
      const method = VALID_METHODS.includes(t.method) ? t.method : "Cash";
      const desc = typeof t.desc === "string" ? t.desc.trim().slice(0, 100) : "";

      transaksi = { type, cat, amount, desc, method };
    }
  }

  return { reply, transaksi };
}

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

  const systemPrompt = `Kamu adalah asisten keuangan pribadi BijakDana. Kamu punya 2 kemampuan: (1) menjawab pertanyaan/konsultasi soal keuangan pengguna, dan (2) mencatat transaksi baru kalau pengguna menyebutkan pemasukan/pengeluaran dalam kalimat natural (misal "tadi jajan kopi 25rb pake gopay" atau "gajian 3 juta").

ATURAN OUTPUT PALING PENTING (berlaku apa pun model yang menjalankanmu):
Kamu HARUS SELALU membalas HANYA dengan satu objek JSON valid, tanpa teks lain di luar JSON, tanpa markdown code fence, dengan struktur PERSIS seperti ini:

{
  "reply": "kalimat balasan natural dalam Bahasa Indonesia untuk ditampilkan ke pengguna, ramah dan singkat, maksimal 4-6 kalimat, boleh pakai **bold** tapi JANGAN pakai heading markdown (#, ##)",
  "transaksi": null
}

Kalau pengguna JELAS menyebutkan transaksi baru (ada nominal uang dan jenis pemasukan/pengeluaran), isi "transaksi" dengan objek berikut, dan "reply" berisi konfirmasi natural bahwa transaksi sudah dicatat:

{
  "reply": "Oke, sudah aku catat ya! ...",
  "transaksi": {
    "type": "expense" atau "income",
    "cat": "salah satu id kategori valid di bawah",
    "amount": nominal dalam angka (tanpa titik/koma, contoh 25000 bukan 25rb atau 25.000),
    "desc": "deskripsi singkat dari kalimat pengguna",
    "method": "salah satu metode pembayaran valid di bawah, default Cash kalau tidak disebutkan"
  }
}

Kalau pengguna hanya bertanya/konsultasi (bukan mencatat transaksi), field "transaksi" harus null.

KATEGORI PENGELUARAN VALID (untuk transaksi type=expense): ${VALID_EXPENSE_CATS.join(", ")}
KATEGORI PEMASUKAN VALID (untuk transaksi type=income): ${VALID_INCOME_CATS.join(", ")}
METODE PEMBAYARAN VALID: ${VALID_METHODS.join(", ")}

ATURAN LAIN:
- Jangan mengarang angka yang tidak ada di data saat menjawab pertanyaan konsultasi.
- Jika pengguna bertanya soal bulan/periode tertentu, gunakan data RIWAYAT PEMASUKAN & PENGELUARAN PER BULAN.
- Jika pengguna bertanya soal skor kesehatan finansial, gunakan data SKOR KESEHATAN FINANSIAL, jelaskan dengan bahasa mudah dipahami, fokus ke pilar paling lemah, dan beri saran konkret.
- Jika kalimat pengguna ambigu soal nominal/jenis transaksi, JANGAN mengarang — set "transaksi": null dan tanyakan klarifikasi lewat "reply".

${dataText}`;

  const payloadMessages = [{ role: "system", content: systemPrompt }, ...messages];

  let result: ParsedAiResponse | null = null;
  let lastError = "";
  let lastRawReply = "";

  outer: for (const model of FREE_MODELS) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
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
          const rawReply = data.choices?.[0]?.message?.content;

          if (rawReply) {
            lastRawReply = rawReply;
            const parsed = extractJson(rawReply);
            const validated = validateParsed(parsed);
            if (validated) {
              result = validated;
              break outer;
            }
            console.warn(`Model ${model} (percobaan ${attempt}) hasil tidak valid:`, rawReply);
          }
        } else {
          lastError = await response.text();
          console.error(`Model ${model} gagal (percobaan ${attempt}):`, lastError);
        }
      } catch (err) {
        lastError = String(err);
      }
    }
  }

  if (!result) {
    console.error("Semua percobaan gagal parsing JSON:", lastError);

    if (lastRawReply) {
      return NextResponse.json({ reply: lastRawReply, transaksi: null });
    }
    return NextResponse.json({
      reply: "Maaf, AI sedang sulit dihubungi. Coba tanya lagi sebentar ya.",
      transaksi: null,
    });
  }

  return NextResponse.json(result);
}
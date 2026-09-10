import { NextRequest, NextResponse } from "next/server";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/constants/categories";

const FREE_MODELS = [ "openrouter/free", ];

const VISION_MODELS = [
  "qwen/qwen2.5-vl-32b-instruct:free",
  "meta-llama/llama-3.2-11b-vision-instruct:free",
  "google/gemini-2.0-flash-exp:free",
];
const MAX_ATTEMPTS_PER_MODEL = 3;

const VALID_EXPENSE_CATS = EXPENSE_CATEGORIES.map((c) => c.id);
const VALID_INCOME_CATS = INCOME_CATEGORIES.map((c) => c.id);
const VALID_METHODS = ["GoPay", "OVO", "DANA", "Transfer bank", "Cash", "Kartu debit", "Kartu kredit"];

function normalizeCategory(raw: string, type: "income" | "expense"): string | null {
  if (!raw || typeof raw !== "string") return null;
  const needle = raw.trim().toLowerCase();
  const list = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const byId = list.find((c) => c.id.toLowerCase() === needle);
  if (byId) return byId.id;

  const byLabel = list.find((c) => c.label.toLowerCase() === needle);
  if (byLabel) return byLabel.id;

  const byPartial = list.find(
    (c) => c.label.toLowerCase().includes(needle) || needle.includes(c.id.toLowerCase())
  );
  if (byPartial) return byPartial.id;

  return null;
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

function formatRupiah(n: number) {
  return `Rp${(n || 0).toLocaleString("id-ID")}`;
}

type TransaksiItem = {
  type: "income" | "expense";
  cat: string;
  amount: number;
  desc: string;
  method: string;
  date?: string;
};

type ParsedAiResponse = {
  reply: string;
  transaksi: TransaksiItem[] | null;
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

function normalizeDateStr(raw: any): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  return undefined;
}

function validateTransaksiItem(t: any): TransaksiItem | null {
  if (!t || typeof t !== "object") return null;

  const type = t.type === "income" || t.type === "expense" ? t.type : null;
  const amount = typeof t.amount === "number" && isFinite(t.amount) && t.amount > 0 ? t.amount : null;
  if (!type || !amount) return null;

  const matchedCat = normalizeCategory(t.cat, type);
  const cat = matchedCat ?? (type === "expense" ? "lain" : "lain-in");

  if (!matchedCat) {
    console.warn(`Kategori dari AI tidak match ("${t.cat}"), fallback ke "${cat}"`);
  }

  const method = VALID_METHODS.includes(t.method) ? t.method : "Cash";
  const desc = typeof t.desc === "string" ? t.desc.trim().slice(0, 100) : "";
  const date = normalizeDateStr(t.date);

  return { type, cat, amount, desc, method, ...(date ? { date } : {}) };
}

function validateParsed(parsed: any): ParsedAiResponse | null {
  if (!parsed || typeof parsed !== "object") return null;

  const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
  if (reply.length < 3) return null;

  let transaksi: TransaksiItem[] | null = null;

  const rawTransaksi = parsed.transaksi;
  if (rawTransaksi) {
    const rawList = Array.isArray(rawTransaksi) ? rawTransaksi : [rawTransaksi];
    const validItems = rawList
      .map(validateTransaksiItem)
      .filter((x): x is TransaksiItem => x !== null);
    if (validItems.length > 0) transaksi = validItems;
  }

  return { reply, transaksi };
}

export async function POST(req: NextRequest) {
  const { messages, userFinance, image } = await req.json();

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

  const systemPrompt = `Kamu adalah asisten keuangan pribadi BijakDana. Kamu punya 2 kemampuan: (1) menjawab pertanyaan/konsultasi soal keuangan pengguna, dan (2) mencatat satu atau lebih transaksi baru kalau pengguna menyebutkan pemasukan/pengeluaran dalam kalimat natural (misal "tadi jajan kopi 25rb pake gopay" atau "gajian 3 juta"), atau lewat foto struk belanja yang dilampirkan.

ATURAN OUTPUT PALING PENTING (berlaku apa pun model yang menjalankanmu):
Kamu HARUS SELALU membalas HANYA dengan satu objek JSON valid, tanpa teks lain di luar JSON, tanpa markdown code fence, dengan struktur PERSIS seperti ini:

{
  "reply": "kalimat balasan natural dalam Bahasa Indonesia untuk ditampilkan ke pengguna, ramah dan singkat, maksimal 4-6 kalimat, boleh pakai **bold** tapi JANGAN pakai heading markdown (#, ##)",
  "transaksi": null
}

Kalau pengguna menyebutkan SATU ATAU LEBIH transaksi baru (ada nominal uang dan jenis pemasukan/pengeluaran) dalam satu pesan, isi "transaksi" dengan ARRAY berisi satu objek per transaksi:

{
  "reply": "kalimat konfirmasi natural, sebutkan berapa transaksi yang dicatat kalau lebih dari satu",
  "transaksi": [
    {
      "type": "expense" atau "income",
      "cat": "salah satu id kategori valid di bawah",
      "amount": nominal dalam angka (tanpa titik/koma, contoh 25000 bukan 25rb atau 25.000),
      "desc": "deskripsi singkat dari transaksi ini",
      "method": "salah satu metode pembayaran valid di bawah, default Cash kalau tidak disebutkan",
      "date": "YYYY-MM-DD, HANYA isi kalau pengguna/struk menyebutkan tanggal spesifik, kalau tidak yakin JANGAN sertakan field ini sama sekali"
    }
  ]
}

Kalau pengguna menyebutkan BEBERAPA transaksi sekaligus dalam satu pesan (misalnya bercerita beberapa pengeluaran hari ini), masukkan SEMUA transaksi itu sebagai elemen terpisah di dalam array "transaksi" — jangan digabung jadi satu transaksi kalau kategori atau nominalnya berbeda.

Kalau pengguna mengirim GAMBAR STRUK BELANJA:
- Baca semua item/baris pembelian di struk tersebut beserta nominalnya.
- Kalau semua item masuk kategori yang sama (misalnya semua bahan makanan), boleh digabung jadi satu transaksi dengan total nominal struk.
- Kalau item-itemnya masuk kategori yang jelas berbeda (misalnya ada makanan dan ada alat tulis), catat sebagai transaksi terpisah per kategori.
- Gunakan tanggal di struk untuk field "date" kalau tanggalnya terbaca jelas, kalau tidak terbaca JANGAN sertakan field "date".
- Kalau ada nama toko/merchant di struk, sertakan di "desc".
- Kalau struk tidak jelas terbaca / bukan struk belanja, set "transaksi": null dan jelaskan di "reply" bahwa gambar tidak bisa dibaca dengan jelas, minta pengguna kirim ulang foto yang lebih terang/jelas. JANGAN mengarang nominal yang tidak benar-benar terbaca.

Kalau pengguna hanya bertanya/konsultasi (bukan mencatat transaksi), field "transaksi" harus null.

KATEGORI PENGELUARAN VALID (format "id: Label", pakai id-nya di field cat):
${EXPENSE_CATEGORIES.map((c) => `- ${c.id}: ${c.label}`).join("\n")}

KATEGORI PEMASUKAN VALID (format "id: Label", pakai id-nya di field cat):
${INCOME_CATEGORIES.map((c) => `- ${c.id}: ${c.label}`).join("\n")}

METODE PEMBAYARAN VALID: ${VALID_METHODS.join(", ")}

CONTOH PEMETAAN KATEGORI (ikuti pola ini untuk kasus serupa):
- "print tugas", "beli buku kuliah", "bayar les/kursus" → cat: pendidikan
- "beli kuota", "bayar wifi", "token listrik", "bayar PDAM" → cat: listrik
- "jajan", "makan siang", "beli kopi", "delivery makanan" → cat: makan
- "bensin", "parkir", "ojek online", "tol" → cat: transport
- "nonton bioskop", "langganan streaming", "top up game" → cat: hiburan
- "beli obat", "ke dokter", "vitamin" → cat: kesehatan
Kalau kalimat pengguna benar-benar tidak cocok dengan kategori manapun di atas, baru gunakan "lain" (expense) atau "lain-in" (income).

ATURAN LAIN:
- Jangan mengarang angka yang tidak ada di data saat menjawab pertanyaan konsultasi.
- Jika pengguna bertanya soal bulan/periode tertentu, gunakan data RIWAYAT PEMASUKAN & PENGELUARAN PER BULAN.
- Jika pengguna bertanya soal skor kesehatan finansial, gunakan data SKOR KESEHATAN FINANSIAL, jelaskan dengan bahasa mudah dipahami, fokus ke pilar paling lemah, dan beri saran konkret.
- Jika kalimat pengguna ambigu soal nominal/jenis transaksi, JANGAN mengarang — set "transaksi": null dan tanyakan klarifikasi lewat "reply".
- Jangan pernah mengarang nominal atau tanggal transaksi dari struk yang tidak benar-benar terbaca jelas.
- Gunakan nada bicara yang ramah, hangat, dan sedikit playful — seperti teman yang paham keuangan, BUKAN robot formal. Sisipkan emoji yang relevan secara wajar (1-3 emoji per balasan cukup), contoh: 😊 🎉 💰 📝 ✅ 💡 ⚠️ 🔥.
- Saat mengonfirmasi SATU transaksi berhasil dicatat, ikuti format ini persis: "Oke, sudah aku catat ya! [deskripsi singkat] berhasil tercatat.\n\n📝 **Tercatat**: [Pengeluaran/Pemasukan] Rp[nominal] ([kategori])"
- Saat mengonfirmasi LEBIH DARI SATU transaksi sekaligus: satu kalimat pembuka ramah, baris kosong, lalu tiap transaksi di baris terpisah diawali "📝 " dengan format: "📝 [deskripsi] - Rp[nominal] ([metode])".
- Gunakan **bold** HANYA untuk menegaskan nominal, nama kategori, atau status penting (misal Sehat/Cukup/Perlu Perhatian) — jangan bold satu kalimat penuh. Sesekali boleh pakai *italic* untuk penekanan halus.
- SELALU tulis dalam Bahasa Indonesia yang konsisten dan baku secara santai. Hindari mencampur kata Inggris kalau ada padanan Indonesia yang lazim dipakai (gunakan "pengeluaran/pemasukan", bukan "expense/income"; "catatan", bukan "note"). Periksa ulang ejaan sebelum menjawab, pastikan tidak ada typo.

${dataText}`;

  let payloadMessages: any[] = [{ role: "system", content: systemPrompt }, ...messages];

  if (image && payloadMessages.length > 0) {
    const lastIdx = payloadMessages.length - 1;
    const lastMsg = payloadMessages[lastIdx];
    if (lastMsg.role === "user") {
      payloadMessages[lastIdx] = {
        role: "user",
        content: [
          {
            type: "text",
            text:
              typeof lastMsg.content === "string" && lastMsg.content.trim()
                ? lastMsg.content
                : "Tolong baca struk belanja ini dan catat transaksinya.",
          },
          { type: "image_url", image_url: { url: image } },
        ],
      };
    }
  }

  const modelsToTry = image ? VISION_MODELS : FREE_MODELS;

  let result: ParsedAiResponse | null = null;
  let lastError = "";
  let lastRawReply = "";

  outer: for (const model of modelsToTry) {
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
      reply: image
        ? "Maaf, aku belum berhasil membaca struknya dengan jelas. Coba foto ulang dengan pencahayaan lebih terang ya."
        : "Maaf, AI sedang sulit dihubungi. Coba tanya lagi sebentar ya.",
      transaksi: null,
    });
  }

  return NextResponse.json(result);
}
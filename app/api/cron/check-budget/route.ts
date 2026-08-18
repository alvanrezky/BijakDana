import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CATEGORY_LABELS: Record<string, string> = {
  makan: "Makan & Minum", transport: "Transportasi", sewa: "Sewa/Kos/KPR",
  listrik: "Listrik/Air/Internet", hiburan: "Hiburan", kesehatan: "Kesehatan",
  pendidikan: "Pendidikan", pakaian: "Pakaian/Perawatan", sosial: "Sosial/Hadiah",
};

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monthKey = new Date().toISOString().slice(0, 7);
  const monthStart = `${monthKey}-01`;

  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  if (!users) return NextResponse.json({ ok: true, checked: 0 });

  let sentCount = 0;

  for (const user of users.users) {
    const { data: budgets } = await supabaseAdmin.from("budgets").select("cat, amount").eq("user_id", user.id);
    if (!budgets || budgets.length === 0) continue;

    const { data: txs } = await supabaseAdmin
      .from("transactions")
      .select("cat, amount")
      .eq("user_id", user.id)
      .eq("type", "expense")
      .gte("date", monthStart);
    if (!txs) continue;

    const spentByCat: Record<string, number> = {};
    txs.forEach((t) => {
      spentByCat[t.cat] = (spentByCat[t.cat] || 0) + t.amount;
    });

    for (const b of budgets) {
      if (b.amount <= 0) continue;
      const spent = spentByCat[b.cat] || 0;
      if (spent <= b.amount) continue;

      const refKey = `${monthKey}-${b.cat}`;
      const { error: logError } = await supabaseAdmin
        .from("notification_log")
        .insert({ user_id: user.id, type: "budget_exceeded", ref_key: refKey });

      if (logError) continue; // sudah pernah dicatat bulan ini, skip

      const catLabel = CATEGORY_LABELS[b.cat] || b.cat;
      const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

      await supabaseAdmin.from("notifications").insert({
        user_id: user.id,
        type: "budget_exceeded",
        title: `Budget ${catLabel} terlampaui`,
        body: `Pengeluaran ${fmt(spent)} melebihi budget ${fmt(b.amount)}.`,
      });

      sentCount++;
    }
  }

  return NextResponse.json({ ok: true, notified: sentCount });
}
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Env belum lengkap" }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  if (!users) return NextResponse.json({ ok: true, reset: 0 });

  let count = 0;
  for (const user of users.users) {
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, aiTokenBalance: 250000 },
    });
    count++;
  }

  return NextResponse.json({ ok: true, reset: count });
}
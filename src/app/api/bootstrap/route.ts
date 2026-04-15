import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { seedStarterCurriculum } from "@/lib/supabase/seed";

export async function POST() {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return NextResponse.json(
      {
        seeded: false,
        reason: "Supabase admin client is not configured.",
      },
      { status: 200 },
    );
  }

  try {
    await seedStarterCurriculum(admin);

    return NextResponse.json({ seeded: true });
  } catch (error) {
    return NextResponse.json(
      {
        seeded: false,
        error: error instanceof Error ? error.message : "Bootstrap failed.",
      },
      { status: 500 },
    );
  }
}

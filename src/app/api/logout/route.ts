import { COOKIE_CONFIG } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set({
    ...COOKIE_CONFIG,
    value: "",
    maxAge: 0,
  });

  return Response.json({ success: true });
}

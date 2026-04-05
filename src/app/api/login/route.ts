import { getAdminPassword, COOKIE_CONFIG } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password !== getAdminPassword()) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set({
    ...COOKIE_CONFIG,
    value: getAdminPassword(),
  });

  return Response.json({ success: true });
}

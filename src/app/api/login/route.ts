import { getAdminPassword, COOKIE_CONFIG } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { cookies, headers } from "next/headers";

export async function POST(request: Request) {
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  const { allowed, retryAfterSec } = checkRateLimit(ip);
  if (!allowed) {
    return Response.json(
      { error: `Too many attempts. Retry after ${retryAfterSec}s.` },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      },
    );
  }

  const { password } = await request.json();

  if (password !== getAdminPassword()) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set({ ...COOKIE_CONFIG, value: getAdminPassword() });

  return Response.json({ success: true });
}

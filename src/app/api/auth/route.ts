import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ authenticated: false }, { status: 401 });
  }
  return Response.json({ authenticated: true });
}

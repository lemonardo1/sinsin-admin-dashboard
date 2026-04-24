import { query } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const inquiries = await query<{
      id: number;
      inquiry_type: string | null;
      name: string;
      contact: string;
      message: string;
      partnership: string[] | null;
      contact_time: string[] | null;
      created_at: string;
    }>(
      `SELECT id, inquiry_type, name, contact, message, partnership, contact_time, created_at
       FROM business_inquiry
       ORDER BY created_at DESC
       LIMIT 200`
    );
    return Response.json({ inquiries });
  } catch (e) {
    console.error("Inquiries API error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}

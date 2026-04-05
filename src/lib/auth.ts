import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";
const COOKIE_NAME = "sinsin-admin-auth";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return token?.value === ADMIN_PASSWORD;
}

export function getAdminPassword(): string {
  return ADMIN_PASSWORD;
}

export const COOKIE_CONFIG = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
};

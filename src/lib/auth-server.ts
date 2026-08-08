import "server-only";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Get the current session on the server side.
 * Returns null if no session exists.
 */
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Require authentication. Redirects to /sign-in if not authenticated.
 * Returns the session if authenticated.
 */
export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    redirect("/sign-in");
  }
  return session;
}

/**
 * Require a specific role. Redirects to /sign-in if not authenticated,
 * or to /dashboard if authenticated but lacking the required role.
 */
export async function requireRole(role: string) {
  const session = await requireAuth();
  if (session.user.role !== role && session.user.role !== "admin") {
    redirect("/dashboard");
  }
  return session;
}

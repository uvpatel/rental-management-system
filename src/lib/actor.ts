import { getServerSession } from "./auth-server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { userMemberships, customerProfiles } from "@/db/schema";

export type ActorRole = "ADMIN" | "VENDOR" | "CUSTOMER";

export type ActorContext = {
  userId: string;
  email: string;
  name: string;
  role: ActorRole;
  organizationId?: string;
  companyName?: string;
  gstin?: string;
  permissions: string[];
};

export async function getActorContext(): Promise<ActorContext | null> {
  const session = await getServerSession();
  if (!session?.user) return null;

  const dbUser = session.user;
  let role: ActorRole = "CUSTOMER";
  let organizationId: string | undefined = undefined;

  const memberships = await db
    .select()
    .from(userMemberships)
    .where(eq(userMemberships.userId, dbUser.id));
  const membership = memberships[0];

  if (membership) {
    role = (membership.role as ActorRole) || (dbUser.role === "admin" ? "ADMIN" : "VENDOR");
    organizationId = membership.organizationId || undefined;
  } else if (dbUser.role === "admin") {
    role = "ADMIN";
    organizationId = "org_apex";
  }

  let companyName: string | undefined = undefined;
  let gstin: string | undefined = undefined;

  if (role === "CUSTOMER") {
    const profiles = await db
      .select()
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, dbUser.id));
    const profile = profiles[0];
    if (profile) {
      companyName = profile.companyName || undefined;
      gstin = profile.gstin || undefined;
    }
  }

  const permissions: string[] = [];
  if (role === "ADMIN") {
    permissions.push("all");
  } else if (role === "VENDOR") {
    permissions.push("manage_products", "manage_orders", "manage_invoices", "view_reports");
  } else {
    permissions.push("create_quotation", "view_own_orders", "pay_invoice");
  }

  return {
    userId: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role,
    organizationId,
    companyName,
    gstin,
    permissions,
  };
}

import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/sign-in");
  }
  redirect("/dashboard/overview");
}

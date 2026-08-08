import { requireRole } from "@/lib/auth-server";
import { AdminPanel } from "./admin-panel";

export default async function AdminPage() {
  await requireRole("admin");

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
        <h1 className="text-lg font-semibold">Admin Panel</h1>
      </header>
      <main className="flex-1 p-6">
        <AdminPanel />
      </main>
    </div>
  );
}

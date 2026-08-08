import { requireAuth } from "@/lib/auth-server";
import { SettingsPanel } from "./settings-panel";

export default async function SettingsPage() {
  const session = await requireAuth();

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>
      <main className="flex-1 p-6">
        <SettingsPanel
          initialUser={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image ?? null,
            role: session.user.role as string,
          }}
        />
      </main>
    </div>
  );
}

import Link from "next/link";

const shortcuts = [
  { href: "/scheduling", label: "New Scheduling Simulation" },
  { href: "/paging", label: "New Paging Simulation" },
  { href: "/deadlock", label: "New Deadlock Simulation" },
];

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-300">
          Saved simulations will appear here once Supabase persistence is connected in a later step.
        </p>
      </header>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="text-lg font-medium">Quick Start</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {shortcuts.map((s) => (
            <Link key={s.href} href={s.href} className="rounded-md border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800">
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
        No saved simulations yet.
      </div>
    </section>
  );
}

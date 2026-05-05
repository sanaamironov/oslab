import Link from "next/link";

const modules = [
  {
    href: "/scheduling",
    title: "CPU Scheduling Simulator",
    description: "Model FCFS, SJF, SRTF, Round Robin, and Priority scheduling with deterministic outputs.",
  },
  {
    href: "/paging",
    title: "Page Replacement Visualizer",
    description: "Explore FIFO, LRU, and OPT page replacement with step-by-step frame transitions.",
  },
  {
    href: "/deadlock",
    title: "Deadlock Detection Visualizer",
    description: "Build resource-allocation graphs and detect circular wait/deadlock cycles.",
  },
];

export default function LandingPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="inline-flex rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
          OSLab
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Interactive Operating Systems Concept Visualizer</h1>
        <p className="max-w-3xl text-slate-300">
          OSLab is a graduate-level web application for deterministic simulation of core operating systems concepts.
          Use the modules below to run algorithmic experiments, inspect timelines, and compare outcomes.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {modules.map((module) => (
          <article key={module.href} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{module.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{module.description}</p>
            <Link
              href={module.href}
              className="mt-4 inline-flex rounded-md bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-500"
            >
              Open Module
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

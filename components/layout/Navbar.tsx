import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/scheduling", label: "Scheduling" },
  { href: "/paging", label: "Paging" },
  { href: "/deadlock", label: "Deadlock" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-semibold tracking-tight text-cyan-300">
          OSLab
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-slate-300 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

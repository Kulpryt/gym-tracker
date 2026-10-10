"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Accueil", icon: "🏠" },
  { href: "/workouts", label: "Séances", icon: "🏋️" },
  { href: "/exercises", label: "Exercices", icon: "📋" },
  { href: "/nutrition", label: "Nutrition", icon: "🍎" }
];

export default function NavBar({ username }: { username?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/8 bg-bg/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="font-display text-lg font-bold shrink-0">
          Gym<span className="text-accent">Track</span>
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-accent/15 text-accent font-medium"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <span>{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* User menu */}
        {username && (
          <div className="relative ml-auto">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold uppercase">
                {username[0]}
              </span>
              <span className="hidden md:inline">{username}</span>
              <span className="text-xs opacity-40">▾</span>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 card min-w-[140px] py-1">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Se déconnecter
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Nav links — mobile (barre en bas de la navbar) */}
      <div className="md:hidden flex border-t border-white/6">
        {links.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                active ? "text-accent font-medium" : "text-white/40"
              }`}
            >
              <span className="text-base">{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}

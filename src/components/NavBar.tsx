"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Accueil", icon: "🏠" },
  { href: "/workouts", label: "Séances", icon: "🏋️" },
  { href: "/exercises", label: "Exercices", icon: "📋" },
  { href: "/nutrition", label: "Nutrition", icon: "🍎" }
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 md:static md:mt-10 border-t md:border-t-0 border-white/10 bg-bg/95 backdrop-blur">
      <div className="max-w-5xl mx-auto flex md:justify-center gap-1 md:gap-6 px-2 py-2 md:py-4">
        {links.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex-1 md:flex-none text-center text-xs md:text-sm py-2 px-2 rounded-lg ${
                active ? "text-accent font-semibold" : "text-white/60"
              }`}
            >
              <span className="block md:inline mr-0 md:mr-1">{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

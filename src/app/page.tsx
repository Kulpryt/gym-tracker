import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Déclaration en amont pour une portée globale au composant
  let recentSessions: any[] = [];
  let goal: any = { kcal: 2000, protein: 150, carbs: 200, fat: 70 }; // Valeur par défaut de sécurité

  try {
    const result = await Promise.all([
      prisma.workoutSession.findMany({
        where: { userId: user.userId },
        orderBy: { date: "desc" },
        take: 5,
        include: { sets: true }
      }),
      prisma.macroGoal.upsert({
        where: { userId: user.userId },
        create: { userId: user.userId },
        update: {}
      })
    ]);
    recentSessions = result[0];
    goal = result[1];
  } catch {
    // User supprimé ou FK invalide → déconnexion propre
    const { clearSessionCookie } = await import("@/lib/auth");
    clearSessionCookie();
    redirect("/login");
  }

  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setHours(23, 59, 59, 999);
  
  const todayLogs = await prisma.foodLogEntry.findMany({
    where: { userId: user.userId, date: { gte: start, lte: end } }
  });

  const totals = todayLogs.reduce(
    (acc, l) => ({ 
      kcal: acc.kcal + l.kcal, 
      protein: acc.protein + l.protein, 
      carbs: acc.carbs + l.carbs, 
      fat: acc.fat + l.fat 
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold">Bonjour, {user.username} 👋</h2>
        <p className="text-white/40 text-sm">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Macros du jour */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold">Nutrition du jour</h3>
          <Link href="/nutrition" className="text-xs text-accent">tout voir →</Link>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "kcal", value: Math.round(totals.kcal), goal: goal.kcal },
            { label: "protéines", value: Math.round(totals.protein), goal: goal.protein, unit: "g" },
            { label: "glucides", value: Math.round(totals.carbs), goal: goal.carbs, unit: "g" },
            { label: "lipides", value: Math.round(totals.fat), goal: goal.fat, unit: "g" },
          ].map((m) => (
            <div key={m.label} className="bg-black/20 rounded-xl p-3">
              <div className="text-lg font-bold">{m.value}{m.unit}</div>
              <div className="text-[10px] text-white/40 mt-0.5">/ {m.goal}{m.unit ?? ""}</div>
              <div className="text-[10px] text-white/30 capitalize mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Dernières séances */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold">Dernières séances</h3>
          <Link href="/workouts" className="text-xs text-accent">tout voir →</Link>
        </div>
        {recentSessions.length === 0 ? (
          <p className="text-white/30 text-sm">Aucune séance — commençons !</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {recentSessions.map((s) => (
              <li key={s.id}>
                <Link href={`/workouts/${s.id}`} className="flex justify-between items-center py-2.5">
                  <span className="text-sm">{s.name}</span>
                  <span className="text-white/35 text-xs">
                    {new Date(s.date).toLocaleDateString("fr-FR")} · {s.sets.length} série{s.sets.length > 1 ? "s" : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/workouts" className="btn-accent">+ Nouvelle séance</Link>
    </div>
  );
}
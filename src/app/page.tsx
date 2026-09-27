import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [recentSessions, goal] = await Promise.all([
    prisma.workoutSession.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: { sets: true }
    }),
    prisma.macroGoal.upsert({ where: { id: "default" }, create: { id: "default" }, update: {} })
  ]);

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const todayLogs = await prisma.foodLogEntry.findMany({
    where: { date: { gte: start, lte: end } }
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
    <div className="space-y-6">
      <section className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold">Nutrition du jour</h2>
          <Link href="/nutrition" className="text-sm text-accent">voir tout →</Link>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-xl font-bold">{Math.round(totals.kcal)}</div>
            <div className="text-xs text-white/50">/ {goal.kcal} kcal</div>
          </div>
          <div>
            <div className="text-xl font-bold">{Math.round(totals.protein)}g</div>
            <div className="text-xs text-white/50">protéines</div>
          </div>
          <div>
            <div className="text-xl font-bold">{Math.round(totals.carbs)}g</div>
            <div className="text-xs text-white/50">glucides</div>
          </div>
          <div>
            <div className="text-xl font-bold">{Math.round(totals.fat)}g</div>
            <div className="text-xs text-white/50">lipides</div>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold">Dernières séances</h2>
          <Link href="/workouts" className="text-sm text-accent">voir tout →</Link>
        </div>
        {recentSessions.length === 0 ? (
          <p className="text-white/50 text-sm">Aucune séance pour l'instant.</p>
        ) : (
          <ul className="space-y-2">
            {recentSessions.map((s) => (
              <li key={s.id}>
                <Link href={`/workouts/${s.id}`} className="flex justify-between items-center py-2 border-b border-white/5">
                  <span>{s.name}</span>
                  <span className="text-white/50 text-sm">
                    {new Date(s.date).toLocaleDateString("fr-FR")} · {s.sets.length} séries
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/workouts" className="btn-accent inline-block">+ Nouvelle séance</Link>
    </div>
  );
}

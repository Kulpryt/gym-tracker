export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? 30);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [foodLogs, sessions, weightLogs] = await Promise.all([
    prisma.foodLogEntry.findMany({
      where: { userId: user.userId, date: { gte: since } },
      orderBy: { date: "asc" },
      select: { date: true, kcal: true, protein: true, carbs: true, fat: true }
    }),
    prisma.workoutSession.findMany({
      where: { userId: user.userId, date: { gte: since } },
      orderBy: { date: "asc" },
      include: {
        sets: {
          include: { exercise: { select: { id: true, name: true } } }
        }
      }
    }),
    prisma.weightLog.findMany({
      where: { userId: user.userId, date: { gte: since } },
      orderBy: { date: "asc" },
      select: { date: true, weightKg: true }
    })
  ]);

  // Agréger nutrition par jour
  const nutritionByDay: Record<string, { date: string; kcal: number; protein: number; carbs: number; fat: number }> = {};
  for (const log of foodLogs) {
    const key = log.date.toISOString().slice(0, 10);
    if (!nutritionByDay[key]) nutritionByDay[key] = { date: key, kcal: 0, protein: 0, carbs: 0, fat: 0 };
    nutritionByDay[key].kcal += log.kcal;
    nutritionByDay[key].protein += log.protein;
    nutritionByDay[key].carbs += log.carbs;
    nutritionByDay[key].fat += log.fat;
  }

  // Progression par exercice : charge max par séance
  const progressByExercise: Record<string, { name: string; data: { date: string; maxKg: number; totalReps: number }[] }> = {};
  for (const session of sessions) {
    const dateKey = session.date.toISOString().slice(0, 10);
    for (const set of session.sets) {
      if (!set.weightKg) continue;
      const exId = set.exercise.id;
      if (!progressByExercise[exId]) {
        progressByExercise[exId] = { name: set.exercise.name, data: [] };
      }
      const existing = progressByExercise[exId].data.find(d => d.date === dateKey);
      if (existing) {
        existing.maxKg = Math.max(existing.maxKg, set.weightKg);
        existing.totalReps += set.reps ?? 0;
      } else {
        progressByExercise[exId].data.push({ date: dateKey, maxKg: set.weightKg, totalReps: set.reps ?? 0 });
      }
    }
  }

  return NextResponse.json({
    nutritionByDay: Object.values(nutritionByDay).sort((a, b) => a.date.localeCompare(b.date)),
    sessions: sessions.map(s => ({
      id: s.id,
      name: s.name,
      date: s.date.toISOString().slice(0, 10),
      setsCount: s.sets.length,
      exercises: [...new Set(s.sets.map(st => st.exercise.name))]
    })),
    weightLogs: weightLogs.map(w => ({ date: w.date.toISOString().slice(0, 10), weightKg: w.weightKg })),
    progressByExercise
  });
}

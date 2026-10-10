export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  // Vérifie que la session appartient à cet user
  const session = await prisma.workoutSession.findFirst({
    where: { id: body.sessionId, userId: user.userId }
  });
  if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 403 });

  const lastSet = await prisma.workoutSet.findFirst({
    where: { sessionId: body.sessionId, exerciseId: body.exerciseId },
    orderBy: { setNumber: "desc" }
  });
  const set = await prisma.workoutSet.create({
    data: {
      sessionId: body.sessionId,
      exerciseId: body.exerciseId,
      setNumber: (lastSet?.setNumber ?? 0) + 1,
      weightKg: body.weightKg ?? null,
      reps: body.reps ?? null,
      rpe: body.rpe ?? null,
      notes: body.notes ?? null
    },
    include: { exercise: true }
  });
  return NextResponse.json(set);
}

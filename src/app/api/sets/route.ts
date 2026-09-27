import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
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

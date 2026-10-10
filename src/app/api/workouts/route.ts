export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    include: { sets: { include: { exercise: true } } }
  });
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const session = await prisma.workoutSession.create({
    data: {
      userId: user.id,
      name: body.name || `Séance du ${new Date().toLocaleDateString("fr-FR")}`,
      date: body.date ? new Date(body.date) : new Date(),
      notes: body.notes ?? null
    }
  });
  return NextResponse.json(session);
}

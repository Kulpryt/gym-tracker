import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessions = await prisma.workoutSession.findMany({
    orderBy: { date: "desc" },
    include: { sets: { include: { exercise: true } } }
  });
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const session = await prisma.workoutSession.create({
    data: {
      name: body.name || `Séance du ${new Date().toLocaleDateString("fr-FR")}`,
      date: body.date ? new Date(body.date) : new Date(),
      notes: body.notes ?? null
    }
  });
  return NextResponse.json(session);
}

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? 90);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await prisma.weightLog.findMany({
    where: { userId: user.userId, date: { gte: since } },
    orderBy: { date: "asc" }
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { weightKg, date } = await req.json();
  const log = await prisma.weightLog.create({
    data: {
      userId: user.userId,
      weightKg: parseFloat(weightKg),
      date: date ? new Date(date) : new Date()
    }
  });
  return NextResponse.json(log);
}

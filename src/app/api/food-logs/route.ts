export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const day = dateParam ? new Date(dateParam) : new Date();
  const start = new Date(day); start.setHours(0, 0, 0, 0);
  const end = new Date(day); end.setHours(23, 59, 59, 999);

  const logs = await prisma.foodLogEntry.findMany({
    where: { userId: user.userId, date: { gte: start, lte: end } },
    include: { product: true },
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const factor = body.quantityG / 100;
  const log = await prisma.foodLogEntry.create({
    data: {
      userId: user.userId,
      date: body.date ? new Date(body.date) : new Date(),
      mealType: body.mealType,
      barcode: body.barcode ?? null,
      customName: body.customName ?? null,
      quantityG: body.quantityG,
      kcal: body.per100.kcal * factor,
      protein: body.per100.protein * factor,
      carbs: body.per100.carbs * factor,
      fat: body.per100.fat * factor
    }
  });
  return NextResponse.json(log);
}

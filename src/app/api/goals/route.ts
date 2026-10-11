export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const goal = await prisma.macroGoal.upsert({
    where: { userId: user.userId },
    create: { userId: user.userId },
    update: {}
  });
  return NextResponse.json(goal);
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const goal = await prisma.macroGoal.upsert({
    where: { userId: user.userId },
    create: { userId: user.userId, ...body },
    update: body
  });
  return NextResponse.json(goal);
}

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const goal = await prisma.macroGoal.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {}
  });
  return NextResponse.json(goal);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const goal = await prisma.macroGoal.upsert({
    where: { id: "default" },
    create: { id: "default", ...body },
    update: body
  });
  return NextResponse.json(goal);
}

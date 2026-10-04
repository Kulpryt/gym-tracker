export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await prisma.workoutSession.findUnique({
    where: { id: params.id },
    include: { sets: { include: { exercise: true }, orderBy: { completedAt: "asc" } } }
  });
  if (!session) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(session);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const session = await prisma.workoutSession.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {})
    }
  });
  return NextResponse.json(session);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.workoutSession.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

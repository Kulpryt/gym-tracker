export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const session = await prisma.workoutSession.findUnique({
    where: { id: params.id, userId: user.userId },
    include: { sets: { include: { exercise: true }, orderBy: { completedAt: "asc" } } }
  });
  if (!session) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(session);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const session = await prisma.workoutSession.update({
    where: { id: params.id, userId: user.userId },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {})
    }
  });
  return NextResponse.json(session);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  await prisma.workoutSession.delete({
    where: { id: params.id, userId: user.userId }
  });
  return NextResponse.json({ ok: true });
}

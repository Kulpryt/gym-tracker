import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const set = await prisma.workoutSet.update({
    where: { id: params.id },
    data: {
      ...(body.weightKg !== undefined ? { weightKg: body.weightKg } : {}),
      ...(body.reps !== undefined ? { reps: body.reps } : {}),
      ...(body.rpe !== undefined ? { rpe: body.rpe } : {})
    }
  });
  return NextResponse.json(set);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.workoutSet.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

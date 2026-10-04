export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category");
  const equipment = searchParams.get("equipment");
  const take = Number(searchParams.get("take") ?? 40);
  const skip = Number(searchParams.get("skip") ?? 0);

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(category ? { category } : {}),
    ...(equipment ? { equipment } : {})
  };

  const [exercises, total] = await Promise.all([
    prisma.exercise.findMany({ where, take, skip, orderBy: { name: "asc" } }),
    prisma.exercise.count({ where })
  ]);

  return NextResponse.json({ exercises, total });
}

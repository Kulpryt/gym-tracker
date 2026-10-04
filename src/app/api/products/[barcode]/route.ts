export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchProductByBarcode } from "@/lib/openfoodfacts";

export async function GET(_req: NextRequest, { params }: { params: { barcode: string } }) {
  const { barcode } = params;

  const cached = await prisma.foodProduct.findUnique({ where: { barcode } });
  if (cached) return NextResponse.json(cached);

  const product = await fetchProductByBarcode(barcode);
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable sur OpenFoodFacts" }, { status: 404 });
  }

  const saved = await prisma.foodProduct.upsert({
    where: { barcode },
    create: product,
    update: product
  });

  return NextResponse.json(saved);
}

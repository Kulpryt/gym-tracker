export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, verifyPassword, clearSessionCookie } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === "changeUsername") {
    const { username } = body;
    if (!username || username.length < 3)
      return NextResponse.json({ error: "Pseudo trop court (min 3 car.)" }, { status: 400 });
    const exists = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
    if (exists && exists.id !== user.userId)
      return NextResponse.json({ error: "Ce pseudo est déjà pris" }, { status: 400 });
    await prisma.user.update({ where: { id: user.userId }, data: { username: username.toLowerCase() } });
    return NextResponse.json({ ok: true });
  }

  if (action === "changePassword") {
    const { currentPassword, newPassword } = body;
    if (!newPassword || newPassword.length < 6)
      return NextResponse.json({ error: "Nouveau mdp trop court (min 6 car.)" }, { status: 400 });
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    const valid = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!valid) return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 401 });
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.userId }, data: { passwordHash } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { password } = await req.json();
  const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
  if (!dbUser) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const valid = await verifyPassword(password, dbUser.passwordHash);
  if (!valid) return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });

  await prisma.user.delete({ where: { id: user.userId } });
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}

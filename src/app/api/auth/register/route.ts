import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { createSessionToken } from "@/lib/jwt";
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || username.length < 3) {
      return NextResponse.json({ error: "Le pseudo doit faire au moins 3 caractères" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit faire au moins 6 caractères" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Ce pseudo est déjà utilisé" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        passwordHash
      }
    });

    // Association des données orphelines au premier compte créé
    const userCount = await prisma.user.count();
    if (userCount === 1) {
      await prisma.workoutSession.updateMany({
        where: { userId: null },
        data: { userId: user.id }
      });
      await prisma.foodLogEntry.updateMany({
        where: { userId: null },
        data: { userId: user.id }
      });
      const orphanGoal = await prisma.macroGoal.findFirst({
        where: { userId: null }
      });
      if (orphanGoal) {
        await prisma.macroGoal.update({
          where: { id: orphanGoal.id },
          data: { userId: user.id }
        });
      }
    }

    // Création d'un objectif par défaut s'il n'en a pas récupéré un
    const userGoal = await prisma.macroGoal.findUnique({ where: { userId: user.id } });
    if (!userGoal) {
      await prisma.macroGoal.create({
        data: { userId: user.id }
      });
    }

    const token = await createSessionToken({ userId: user.id, username: user.username });
    setSessionCookie(token);

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }
}

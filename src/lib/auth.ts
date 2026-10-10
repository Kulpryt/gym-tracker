import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE, type SessionPayload } from "./jwt";
import { prisma } from "@/lib/prisma";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Récupère l'utilisateur actuel à partir du cookie de session.
 * Utilisable dans les Server Components et les Route Handlers.
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  // Vérifie que le user existe toujours en base
  const exists = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true }
  });
  if (!exists) return null;

  return payload;
}

/**
 * Définit le cookie de session sécurisé.
 */
export function setSessionCookie(token: string) {
  cookies().set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });
}

/**
 * Supprime le cookie de session.
 */
export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

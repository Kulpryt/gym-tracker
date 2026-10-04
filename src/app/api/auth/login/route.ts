import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const rawPasswords = process.env.APP_PASSWORDS || process.env.APP_PASSWORD || "";
    const validPasswords = rawPasswords.split(",").map((p) => p.trim()).filter(Boolean);

    if (validPasswords.length === 0) {
      return NextResponse.json({ success: true });
    }

    if (validPasswords.includes(password)) {
      cookies().set({
        name: "gym_auth",
        value: "authenticated",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "GymTrack",
  description: "Ton carnet d'entraînement et de nutrition"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="fr">
      <body>
        <NavBar username={user?.username} />
        <div className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}

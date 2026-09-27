import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Gym Tracker",
  description: "Suivi de séances de gym et de nutrition"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4">
          <header className="flex items-center justify-between py-6">
            <h1 className="font-display text-xl font-bold">
              Gym<span className="text-accent">Track</span>
            </h1>
          </header>
          <main>{children}</main>
        </div>
        <NavBar />
      </body>
    </html>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Session {
  id: string;
  name: string;
  date: string;
  sets: { id: string }[];
}

export default function WorkoutsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/workouts").then((r) => r.json()).then(setSessions);
  }, []);

  const createSession = async () => {
    const res = await fetch("/api/workouts", { method: "POST", body: JSON.stringify({}) });
    const session = await res.json();
    router.push(`/workouts/${session.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-lg font-bold">Séances</h2>
        <button onClick={createSession} className="btn-accent">+ Nouvelle séance</button>
      </div>
      <ul className="space-y-2">
        {sessions.map((s) => (
          <li key={s.id}>
            <Link href={`/workouts/${s.id}`} className="card p-4 flex justify-between items-center block">
              <span className="font-medium">{s.name}</span>
              <span className="text-white/50 text-sm">
                {new Date(s.date).toLocaleDateString("fr-FR")} · {s.sets.length} séries
              </span>
            </Link>
          </li>
        ))}
        {sessions.length === 0 && <p className="text-white/40 text-sm">Aucune séance. Crée la première !</p>}
      </ul>
    </div>
  );
}

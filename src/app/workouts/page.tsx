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
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  const load = () => fetch("/api/workouts").then(r => r.json()).then(setSessions);
  useEffect(() => { load(); }, []);

  const createSession = async () => {
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const session = await res.json();
    router.push(`/workouts/${session.id}`);
  };

  const deleteSession = async (id: string) => {
    if (!confirm("Supprimer cette séance et toutes ses séries ?")) return;
    setDeleting(id);
    await fetch(`/api/workouts/${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-bold">Séances</h2>
        <button onClick={createSession} className="btn-accent">+ Nouvelle séance</button>
      </div>
      <ul className="space-y-2">
        {sessions.map((s) => (
          <li key={s.id} className="card flex items-center">
            <Link href={`/workouts/${s.id}`} className="flex-1 flex justify-between items-center p-4">
              <span className="font-medium">{s.name}</span>
              <span className="text-white/40 text-sm">
                {new Date(s.date).toLocaleDateString("fr-FR")} · {s.sets.length} série{s.sets.length > 1 ? "s" : ""}
              </span>
            </Link>
            <button
              onClick={() => deleteSession(s.id)}
              disabled={deleting === s.id}
              className="px-4 py-4 text-white/20 hover:text-red-400 transition-colors text-sm"
            >
              {deleting === s.id ? "…" : "✕"}
            </button>
          </li>
        ))}
        {sessions.length === 0 && <p className="text-white/40 text-sm">Aucune séance. Crée la première !</p>}
      </ul>
    </div>
  );
}

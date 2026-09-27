"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  target: string;
  image: string;
  instructions: string;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ q, ...(category ? { category } : {}) });
    const res = await fetch(`/api/exercises?${params}`);
    const data = await res.json();
    setExercises(data.exercises);
    setLoading(false);
  }, [q, category]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const categories = [
    "chest", "back", "shoulders", "upper arms", "lower arms",
    "upper legs", "lower legs", "waist", "cardio", "neck"
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold">Exercices</h2>
      <div className="flex flex-col md:flex-row gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un exercice..."
          className="flex-1 bg-surface card px-3 py-2 outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-surface card px-3 py-2"
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-white/40 text-sm">Chargement...</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {exercises.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setSelected(ex)}
            className="card p-2 text-left"
          >
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black/20 mb-2">
              <Image src={ex.image} alt={ex.name} fill sizes="180px" className="object-cover" />
            </div>
            <p className="text-sm font-medium leading-tight capitalize">{ex.name}</p>
            <p className="text-xs text-white/40 capitalize">{ex.equipment}</p>
          </button>
        ))}
      </div>

      {exercises.length === 0 && !loading && (
        <p className="text-white/40 text-sm">
          Aucun résultat. Si la liste est vide en général, lance <code>npm run import:exercises</code> pour importer les 1324 exercices.
        </p>
      )}

      {selected && (
        <div
          className="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="card max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 rounded-b-none md:rounded-b-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/20 mb-3">
              <Image src={selected.image} alt={selected.name} fill className="object-cover" />
            </div>
            <h3 className="font-display text-lg font-bold capitalize mb-1">{selected.name}</h3>
            <p className="text-xs text-white/50 mb-3 capitalize">
              {selected.category} · {selected.equipment} · cible : {selected.target}
            </p>
            <p className="text-sm text-white/80 whitespace-pre-line">{selected.instructions}</p>
            <button className="btn-accent mt-4 w-full" onClick={() => setSelected(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

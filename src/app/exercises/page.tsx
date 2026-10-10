"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { translateCategory, translateEquipment, translateTarget } from "@/lib/translations";

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  target: string;
  image: string;
  gifUrl: string;
  instructions: string;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGif, setShowGif] = useState(true);

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
            <option key={c} value={c}>{translateCategory(c)}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-white/40 text-sm">Chargement...</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {exercises.map((ex) => (
          <button
            key={ex.id}
            onClick={() => { setSelected(ex); setShowGif(true); }}
            className="card p-2 text-left"
          >
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black/20 mb-2 group">
              <Image src={ex.image} alt={ex.name} fill sizes="180px" className="object-cover group-hover:opacity-0 transition-opacity duration-200" />
              <Image src={ex.gifUrl} alt={ex.name} fill sizes="180px" className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <p className="text-sm font-medium leading-tight capitalize">{ex.name}</p>
            <p className="text-xs text-white/40 capitalize">{translateEquipment(ex.equipment)}</p>
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
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/20 mb-3 flex items-center justify-center">
              {showGif && selected.gifUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.gifUrl} alt={selected.name} loading="lazy" className="object-contain w-full h-full" />
              ) : (
                <Image src={selected.image} alt={selected.name} fill loading="lazy" className="object-cover" />
              )}
            </div>
            {selected.gifUrl && (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setShowGif(true)}
                  className={`px-3 py-1 text-xs rounded-lg ${showGif ? "btn-accent" : "bg-white/10 text-white/70"}`}
                >
                  GIF animé
                </button>
                <button
                  onClick={() => setShowGif(false)}
                  className={`px-3 py-1 text-xs rounded-lg ${!showGif ? "btn-accent" : "bg-white/10 text-white/70"}`}
                >
                  Photo fixe
                </button>
              </div>
            )}
            <h3 className="font-display text-lg font-bold capitalize mb-1">{selected.name}</h3>
            <p className="text-xs text-white/50 mb-3 capitalize">
              {translateCategory(selected.category)} · {translateEquipment(selected.equipment)} · cible : {translateTarget(selected.target)}
            </p>
            <p className="text-sm text-white/80 whitespace-pre-line">{selected.instructions}</p>
            <button className="btn-accent mt-4 w-full" onClick={() => setSelected(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState, useCallback } from "react";
import { translateCategory, translateEquipment } from "@/lib/translations";

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
}

export default function ExercisePicker({
  onPick,
  onClose
}: {
  onPick: (ex: Exercise) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Exercise[]>([]);

  const search = useCallback(async () => {
    const res = await fetch(`/api/exercises?q=${encodeURIComponent(q)}&take=30`);
    const data = await res.json();
    setResults(data.exercises);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(search, 200);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50" onClick={onClose}>
      <div
        className="card w-full md:max-w-md max-h-[80vh] flex flex-col rounded-b-none md:rounded-b-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Chercher un exercice..."
            className="w-full bg-bg px-3 py-2 rounded-lg outline-none"
          />
        </div>
        <div className="overflow-y-auto flex-1">
          {results.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onPick(ex)}
              className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5"
            >
              <p className="capitalize text-sm font-medium">{ex.name}</p>
              <p className="text-xs text-white/40 capitalize">
                {translateCategory(ex.category)} · {translateEquipment(ex.equipment)}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

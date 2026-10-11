"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import ExercisePicker from "@/components/ExercisePicker";

interface WSet {
  id: string;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  rpe: number | null;
  notes: string | null;
  exercise: { id: string; name: string };
}
interface Session {
  id: string;
  name: string;
  date: string;
  sets: WSet[];
}

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, { weight: string; reps: string }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/workouts/${id}`);
    const data = await res.json();
    setSession(data);
    setName(data.name);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Pré-remplit les drafts avec la dernière valeur enregistrée pour cet exercice
  useEffect(() => {
    if (!session) return;
    const byEx: Record<string, { name: string; sets: WSet[] }> = {};
    for (const s of session.sets) {
      byEx[s.exercise.id] ??= { name: s.exercise.name, sets: [] };
      byEx[s.exercise.id].sets.push(s);
    }
    setDrafts(prev => {
      const next = { ...prev };
      for (const [exId, group] of Object.entries(byEx)) {
        if (!next[exId]) {
          const last = group.sets[group.sets.length - 1];
          next[exId] = {
            weight: last?.weightKg?.toString() ?? "",
            reps: last?.reps?.toString() ?? ""
          };
        }
      }
      return next;
    });
  }, [session]);

  if (!session) return <p className="text-white/40">Chargement...</p>;

  const byExercise = session.sets.reduce<Record<string, { name: string; sets: WSet[] }>>((acc, s) => {
    acc[s.exercise.id] ??= { name: s.exercise.name, sets: [] };
    acc[s.exercise.id].sets.push(s);
    return acc;
  }, {});

  const addExercise = async (ex: { id: string }) => {
    setPickerOpen(false);
    await fetch("/api/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id, exerciseId: ex.id })
    });
    load();
  };

  const addSet = async (exerciseId: string) => {
    setSaving(p => ({ ...p, [exerciseId]: true }));
    const d = drafts[exerciseId] ?? { weight: "", reps: "" };
    await fetch("/api/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: id,
        exerciseId,
        weightKg: d.weight ? parseFloat(d.weight) : null,
        reps: d.reps ? parseInt(d.reps) : null
      })
    });
    setSaving(p => ({ ...p, [exerciseId]: false }));
    load();
  };

  const deleteSet = async (setId: string) => {
    await fetch(`/api/sets/${setId}`, { method: "DELETE" });
    load();
  };

  const saveName = async () => {
    await fetch(`/api/workouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    setEditName(false);
    load();
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Titre éditable */}
      <div className="flex items-center gap-2">
        {editName ? (
          <>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveName()}
              autoFocus
              className="font-display text-lg font-bold bg-transparent border-b border-accent outline-none flex-1"
            />
            <button onClick={saveName} className="text-accent text-sm">✓</button>
            <button onClick={() => setEditName(false)} className="text-white/30 text-sm">✕</button>
          </>
        ) : (
          <>
            <h2 className="font-display text-lg font-bold">{session.name}</h2>
            <button onClick={() => setEditName(true)} className="text-white/20 hover:text-white/50 text-xs">✏️</button>
          </>
        )}
      </div>
      <p className="text-white/40 text-sm -mt-3">{new Date(session.date).toLocaleDateString("fr-FR")}</p>

      {Object.entries(byExercise).map(([exId, group]) => {
        const lastSet = group.sets[group.sets.length - 1];
        return (
          <div key={exId} className="card p-4">
            <p className="font-medium capitalize mb-3">{group.name}</p>

            {/* Tableau des séries */}
            <div className="space-y-1.5 mb-4">
              <div className="grid grid-cols-[2rem_1fr_1fr_1.5rem] gap-2 text-[10px] text-white/25 uppercase tracking-wide px-1">
                <span>#</span><span>Poids</span><span>Reps</span><span></span>
              </div>
              {group.sets.map((s) => (
                <div key={s.id} className="grid grid-cols-[2rem_1fr_1fr_1.5rem] gap-2 items-center bg-black/20 rounded-lg px-1 py-1.5">
                  <span className="text-xs text-white/30">{s.setNumber}</span>
                  <span className="text-sm font-medium">{s.weightKg != null ? `${s.weightKg} kg` : "—"}</span>
                  <span className="text-sm font-medium">{s.reps != null ? `${s.reps} reps` : "—"}</span>
                  <button onClick={() => deleteSet(s.id)} className="text-white/20 hover:text-red-400 text-xs transition-colors">✕</button>
                </div>
              ))}
            </div>

            {/* Saisie nouvelle série */}
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder={lastSet?.weightKg ? `${lastSet.weightKg}` : "kg"}
                className="w-20 bg-bg border border-white/10 px-2 py-1.5 rounded-lg outline-none text-sm focus:border-accent/50"
                value={drafts[exId]?.weight ?? ""}
                onChange={e => setDrafts(p => ({ ...p, [exId]: { weight: e.target.value, reps: p[exId]?.reps ?? "" } }))}
              />
              <input
                type="number"
                placeholder={lastSet?.reps ? `${lastSet.reps}` : "reps"}
                className="w-20 bg-bg border border-white/10 px-2 py-1.5 rounded-lg outline-none text-sm focus:border-accent/50"
                value={drafts[exId]?.reps ?? ""}
                onChange={e => setDrafts(p => ({ ...p, [exId]: { weight: p[exId]?.weight ?? "", reps: e.target.value } }))}
              />
              <button
                onClick={() => addSet(exId)}
                disabled={saving[exId]}
                className="btn-accent text-sm disabled:opacity-50"
              >
                {saving[exId] ? "…" : "+ Série"}
              </button>
            </div>
          </div>
        );
      })}

      <button
        onClick={() => setPickerOpen(true)}
        className="card p-4 w-full text-center text-accent font-medium border-dashed hover:bg-white/5 transition-colors"
      >
        + Ajouter un exercice
      </button>

      {pickerOpen && <ExercisePicker onPick={addExercise} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}

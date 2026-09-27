"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ExercisePicker from "@/components/ExercisePicker";

interface WSet {
  id: string;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
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

  const load = async () => {
    const res = await fetch(`/api/workouts/${id}`);
    setSession(await res.json());
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
      body: JSON.stringify({ sessionId: id, exerciseId: ex.id, weightKg: null, reps: null })
    });
    load();
  };

  const addSet = async (exerciseId: string) => {
    const d = drafts[exerciseId] ?? { weight: "", reps: "" };
    await fetch("/api/sets", {
      method: "POST",
      body: JSON.stringify({
        sessionId: id,
        exerciseId,
        weightKg: d.weight ? parseFloat(d.weight) : null,
        reps: d.reps ? parseInt(d.reps) : null
      })
    });
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-bold">{session.name}</h2>
        <p className="text-white/40 text-sm">{new Date(session.date).toLocaleDateString("fr-FR")}</p>
      </div>

      {Object.entries(byExercise).map(([exId, group]) => (
        <div key={exId} className="card p-4">
          <p className="font-medium capitalize mb-2">{group.name}</p>
          <div className="space-y-1 mb-3">
            {group.sets.map((s) => (
              <div key={s.id} className="flex gap-4 text-sm text-white/70">
                <span className="w-14">Série {s.setNumber}</span>
                <span>{s.weightKg ?? "–"} kg</span>
                <span>{s.reps ?? "–"} reps</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="kg"
              className="w-20 bg-bg px-2 py-1.5 rounded-lg outline-none text-sm"
              value={drafts[exId]?.weight ?? ""}
              onChange={(e) =>
                setDrafts((p) => ({ ...p, [exId]: { weight: e.target.value, reps: p[exId]?.reps ?? "" } }))
              }
            />
            <input
              type="number"
              placeholder="reps"
              className="w-20 bg-bg px-2 py-1.5 rounded-lg outline-none text-sm"
              value={drafts[exId]?.reps ?? ""}
              onChange={(e) =>
                setDrafts((p) => ({ ...p, [exId]: { weight: p[exId]?.weight ?? "", reps: e.target.value } }))
              }
            />
            <button onClick={() => addSet(exId)} className="btn-accent text-sm">+ Série</button>
          </div>
        </div>
      ))}

      <button onClick={() => setPickerOpen(true)} className="card p-4 w-full text-center text-accent font-medium">
        + Ajouter un exercice
      </button>

      {pickerOpen && <ExercisePicker onPick={addExercise} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Goal {
  kcal: number; protein: number; carbs: number; fat: number;
  currentWeight: number; targetWeight: number; goalType: string;
  height: number; age: number; gender: string; activityLevel: number;
}

const ACTIVITY = [
  { value: 1.2, label: "Sédentaire (pas de sport)" },
  { value: 1.375, label: "Légèrement actif (1-3j/sem)" },
  { value: 1.55, label: "Modérément actif (3-5j/sem)" },
  { value: 1.725, label: "Très actif (6-7j/sem)" },
  { value: 1.9, label: "Extrêmement actif (2x/jour)" }
];

function calcTDEE(g: Goal): number {
  const bmr = g.gender === "male"
    ? 10 * g.currentWeight + 6.25 * g.height - 5 * g.age + 5
    : 10 * g.currentWeight + 6.25 * g.height - 5 * g.age - 161;
  return Math.round(bmr * g.activityLevel);
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
      <label className="text-sm text-white/50 md:w-48 shrink-0">{label}</label>
      {children}
    </div>
  );
}

function Inp({ value, onChange, ...rest }: { value: number; onChange: (v: number) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      {...rest}
      className="w-32 bg-bg border border-white/10 px-3 py-2 rounded-xl outline-none text-sm focus:border-accent/60 transition-colors"
    />
  );
}

export default function GoalsPage() {
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/goals").then(r => r.json()).then(setGoal);
  }, []);

  const set = (field: keyof Goal) => (value: number | string) =>
    setGoal(g => g ? { ...g, [field]: value } : g);

  const autoCalc = () => {
    if (!goal) return;
    const tdee = calcTDEE(goal);
    const delta = goal.goalType === "prise" ? 300 : goal.goalType === "seche" ? -400 : 0;
    const kcal = tdee + delta;
    const protein = Math.round(goal.currentWeight * 2);
    const fat = Math.round(kcal * 0.25 / 9);
    const carbs = Math.round((kcal - protein * 4 - fat * 9) / 4);
    setGoal(g => g ? { ...g, kcal, protein, carbs, fat } : g);
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goal)
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!goal) return <p className="text-white/40">Chargement...</p>;

  const tdee = calcTDEE(goal);

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white/40 hover:text-white text-sm">← Retour</button>
        <h2 className="font-display text-2xl font-bold">Objectifs nutritionnels</h2>
      </div>

      {/* Profil */}
      <section className="card p-5 space-y-4">
        <h3 className="font-display font-bold text-sm text-white/50 uppercase tracking-wide">Profil</h3>
        <Row label="Genre">
          <div className="flex gap-2">
            {["male", "female"].map(g => (
              <button key={g} onClick={() => set("gender")(g)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${goal.gender === g ? "bg-accent text-white" : "bg-bg border border-white/10 text-white/50"}`}>
                {g === "male" ? "Homme" : "Femme"}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Âge"><Inp value={goal.age} onChange={set("age") as (v: number) => void} min={10} max={100} /></Row>
        <Row label="Taille (cm)"><Inp value={goal.height} onChange={set("height") as (v: number) => void} min={100} max={250} /></Row>
        <Row label="Poids actuel (kg)"><Inp value={goal.currentWeight} onChange={set("currentWeight") as (v: number) => void} min={30} max={300} step="0.5" /></Row>
        <Row label="Poids cible (kg)"><Inp value={goal.targetWeight} onChange={set("targetWeight") as (v: number) => void} min={30} max={300} step="0.5" /></Row>
        <Row label="Niveau d'activité">
          <select value={goal.activityLevel} onChange={e => set("activityLevel")(parseFloat(e.target.value))}
            className="bg-bg border border-white/10 px-3 py-2 rounded-xl text-sm outline-none w-full focus:border-accent/60">
            {ACTIVITY.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </Row>
        <Row label="Objectif">
          <div className="flex gap-2 flex-wrap">
            {[["maintien", "Maintien"], ["prise", "Prise de masse"], ["seche", "Sèche"]].map(([v, l]) => (
              <button key={v} onClick={() => set("goalType")(v)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${goal.goalType === v ? "bg-accent text-white" : "bg-bg border border-white/10 text-white/50"}`}>
                {l}
              </button>
            ))}
          </div>
        </Row>

        <div className="bg-black/20 rounded-xl p-3 text-sm text-white/60">
          TDEE estimé : <span className="text-white font-bold">{tdee} kcal</span>
          {goal.goalType !== "maintien" && (
            <span className="text-white/40"> ({goal.goalType === "prise" ? "+300" : "-400"} kcal)</span>
          )}
        </div>

        <button onClick={autoCalc} className="w-full py-2.5 rounded-xl bg-accent/10 text-accent text-sm font-semibold hover:bg-accent/20 transition-colors">
          ✨ Calculer automatiquement les macros
        </button>
      </section>

      {/* Macros manuelles */}
      <section className="card p-5 space-y-4">
        <h3 className="font-display font-bold text-sm text-white/50 uppercase tracking-wide">Objectifs journaliers</h3>
        <Row label="Calories (kcal)"><Inp value={goal.kcal} onChange={set("kcal") as (v: number) => void} min={500} max={6000} /></Row>
        <Row label="Protéines (g)"><Inp value={goal.protein} onChange={set("protein") as (v: number) => void} min={0} max={500} /></Row>
        <Row label="Glucides (g)"><Inp value={goal.carbs} onChange={set("carbs") as (v: number) => void} min={0} max={800} /></Row>
        <Row label="Lipides (g)"><Inp value={goal.fat} onChange={set("fat") as (v: number) => void} min={0} max={300} /></Row>

        <div className="bg-black/20 rounded-xl p-3 text-xs text-white/40">
          Total calculé : {Math.round(goal.protein * 4 + goal.carbs * 4 + goal.fat * 9)} kcal
          {Math.abs(Math.round(goal.protein * 4 + goal.carbs * 4 + goal.fat * 9) - goal.kcal) > 50 &&
            <span className="text-amber-400 ml-2">⚠ Écart avec l'objectif kcal</span>}
        </div>
      </section>

      <button onClick={save} disabled={saving} className="btn-accent w-full py-3 text-base disabled:opacity-50">
        {saving ? "Enregistrement…" : saved ? "✓ Enregistré !" : "Enregistrer les objectifs"}
      </button>
    </div>
  );
}

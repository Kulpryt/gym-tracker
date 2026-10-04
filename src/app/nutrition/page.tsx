"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Log {
  id: string;
  mealType: string;
  customName: string | null;
  quantityG: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  product: { name: string } | null;
}
interface Goal {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  currentWeight: number;
  targetWeight: number;
  goalType: string;
  height: number;
  age: number;
  gender: string;
  activityLevel: number;
}

const MEALS = ["petit-déjeuner", "déjeuner", "dîner", "collation"];

export default function NutritionPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState({ name: "", kcal: "", protein: "", carbs: "", fat: "", meal: "déjeuner" });

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({
    currentWeight: 75,
    targetWeight: 75,
    goalType: "maintien",
    height: 175,
    age: 25,
    gender: "male",
    activityLevel: 1.375,
    kcal: 2200,
    protein: 150,
    carbs: 220,
    fat: 70
  });

  const load = async () => {
    const [logsRes, goalRes] = await Promise.all([fetch("/api/food-logs"), fetch("/api/goals")]);
    const logsData = await logsRes.json();
    const goalData = await goalRes.json();
    setLogs(logsData);
    setGoal(goalData);
    setGoalForm({
      currentWeight: goalData.currentWeight ?? 75,
      targetWeight: goalData.targetWeight ?? 75,
      goalType: goalData.goalType ?? "maintien",
      height: goalData.height ?? 175,
      age: goalData.age ?? 25,
      gender: goalData.gender ?? "male",
      activityLevel: goalData.activityLevel ?? 1.375,
      kcal: goalData.kcal ?? 2200,
      protein: goalData.protein ?? 150,
      carbs: goalData.carbs ?? 220,
      fat: goalData.fat ?? 70
    });
  };

  useEffect(() => {
    load();
  }, []);

  const calculateAuto = () => {
    const w = Number(goalForm.currentWeight) || 75;
    const h = Number(goalForm.height) || 175;
    const a = Number(goalForm.age) || 25;
    const act = Number(goalForm.activityLevel) || 1.375;

    let bmr = 10 * w + 6.25 * h - 5 * a;
    bmr += goalForm.gender === "female" ? -161 : 5;
    const tdee = bmr * act;

    let kcal = tdee;
    if (goalForm.goalType === "seche" || goalForm.targetWeight < w) {
      kcal = tdee - 400;
    } else if (goalForm.goalType === "pdm" || goalForm.targetWeight > w) {
      kcal = tdee + 300;
    }

    const proteinPerKg = goalForm.goalType === "seche" ? 2.2 : 2.0;
    const protein = Math.round(w * proteinPerKg);
    const fat = Math.round(w * 1.0);
    const proteinKcal = protein * 4;
    const fatKcal = fat * 9;
    const remainingKcal = kcal - proteinKcal - fatKcal;
    const carbs = Math.max(50, Math.round(remainingKcal / 4));

    setGoalForm((prev) => ({
      ...prev,
      kcal: Math.round(kcal),
      protein,
      carbs,
      fat
    }));
  };

  const saveGoals = async () => {
    const res = await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goalForm)
    });
    const updated = await res.json();
    setGoal(updated);
    setGoalModalOpen(false);
  };

  const totals = logs.reduce(
    (acc, l) => ({
      kcal: acc.kcal + l.kcal,
      protein: acc.protein + l.protein,
      carbs: acc.carbs + l.carbs,
      fat: acc.fat + l.fat
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const removeLog = async (id: string) => {
    await fetch(`/api/food-logs/${id}`, { method: "DELETE" });
    load();
  };

  const saveManual = async () => {
    await fetch("/api/food-logs", {
      method: "POST",
      body: JSON.stringify({
        mealType: manual.meal,
        customName: manual.name,
        quantityG: 100,
        per100: {
          kcal: parseFloat(manual.kcal) || 0,
          protein: parseFloat(manual.protein) || 0,
          carbs: parseFloat(manual.carbs) || 0,
          fat: parseFloat(manual.fat) || 0
        }
      })
    });
    setManual({ name: "", kcal: "", protein: "", carbs: "", fat: "", meal: "déjeuner" });
    setManualOpen(false);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-lg font-bold">Nutrition — aujourd'hui</h2>
        <div className="flex gap-2">
          <button onClick={() => setGoalModalOpen(true)} className="card px-3 py-1.5 text-xs">⚙️ Objectifs</button>
          <Link href="/nutrition/scan" className="btn-accent">📷 Scanner</Link>
        </div>
      </div>

      {goal && (
        <div className="card p-4 grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-lg font-bold">{Math.round(totals.kcal)}</div>
            <div className="text-xs text-white/50">/ {goal.kcal} kcal</div>
          </div>
          <div>
            <div className="text-lg font-bold">{Math.round(totals.protein)}g</div>
            <div className="text-xs text-white/50">/ {goal.protein}g P</div>
          </div>
          <div>
            <div className="text-lg font-bold">{Math.round(totals.carbs)}g</div>
            <div className="text-xs text-white/50">/ {goal.carbs}g G</div>
          </div>
          <div>
            <div className="text-lg font-bold">{Math.round(totals.fat)}g</div>
            <div className="text-xs text-white/50">/ {goal.fat}g L</div>
          </div>
        </div>
      )}

      {goalModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setGoalModalOpen(false)}>
          <div className="card max-w-md w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold">Objectifs & Calculateur de Macros</h3>
            
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-white/50">Poids actuel (kg)</label>
                  <input
                    type="number"
                    value={goalForm.currentWeight}
                    onChange={(e) => setGoalForm({ ...goalForm, currentWeight: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-bg px-3 py-2 rounded-lg outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Poids cible (kg)</label>
                  <input
                    type="number"
                    value={goalForm.targetWeight}
                    onChange={(e) => setGoalForm({ ...goalForm, targetWeight: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-bg px-3 py-2 rounded-lg outline-none mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/50">Objectif</label>
                <select
                  value={goalForm.goalType}
                  onChange={(e) => setGoalForm({ ...goalForm, goalType: e.target.value })}
                  className="w-full bg-bg px-3 py-2 rounded-lg outline-none mt-1"
                >
                  <option value="seche">Sèche / Perte de poids</option>
                  <option value="pdm">Prise de masse</option>
                  <option value="maintien">Maintien</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-white/50">Taille (cm)</label>
                  <input
                    type="number"
                    value={goalForm.height}
                    onChange={(e) => setGoalForm({ ...goalForm, height: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-bg px-3 py-2 rounded-lg outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Âge</label>
                  <input
                    type="number"
                    value={goalForm.age}
                    onChange={(e) => setGoalForm({ ...goalForm, age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-bg px-3 py-2 rounded-lg outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Sexe</label>
                  <select
                    value={goalForm.gender}
                    onChange={(e) => setGoalForm({ ...goalForm, gender: e.target.value })}
                    className="w-full bg-bg px-3 py-2 rounded-lg outline-none mt-1"
                  >
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/50">Niveau d'activité</label>
                <select
                  value={goalForm.activityLevel}
                  onChange={(e) => setGoalForm({ ...goalForm, activityLevel: parseFloat(e.target.value) })}
                  className="w-full bg-bg px-3 py-2 rounded-lg outline-none mt-1"
                >
                  <option value={1.2}>Sédentaire (peu ou pas d'exercice)</option>
                  <option value={1.375}>Légèrement actif (1-3 séances/sem)</option>
                  <option value={1.55}>Modérément actif (3-5 séances/sem)</option>
                  <option value={1.725}>Très actif (6-7 séances/sem)</option>
                </select>
              </div>

              <button onClick={calculateAuto} className="card bg-accent/20 text-accent w-full py-2 font-medium">
                ⚡ Calculer automatiquement les macros
              </button>

              <hr className="border-white/10 my-2" />
              <p className="text-xs text-white/60 font-medium">Ou modifier manuellement :</p>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-white/50">Calories (kcal)</label>
                  <input
                    type="number"
                    value={goalForm.kcal}
                    onChange={(e) => setGoalForm({ ...goalForm, kcal: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-bg px-3 py-2 rounded-lg outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Protéines (g)</label>
                  <input
                    type="number"
                    value={goalForm.protein}
                    onChange={(e) => setGoalForm({ ...goalForm, protein: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-bg px-3 py-2 rounded-lg outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Glucides (g)</label>
                  <input
                    type="number"
                    value={goalForm.carbs}
                    onChange={(e) => setGoalForm({ ...goalForm, carbs: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-bg px-3 py-2 rounded-lg outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Lipides (g)</label>
                  <input
                    type="number"
                    value={goalForm.fat}
                    onChange={(e) => setGoalForm({ ...goalForm, fat: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-bg px-3 py-2 rounded-lg outline-none mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setGoalModalOpen(false)} className="card px-4 py-2 flex-1">Annuler</button>
              <button onClick={saveGoals} className="btn-accent flex-1">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {MEALS.map((meal) => {
        const mealLogs = logs.filter((l) => l.mealType === meal);
        if (mealLogs.length === 0) return null;
        return (
          <div key={meal} className="card p-4">
            <p className="font-medium capitalize mb-2">{meal}</p>
            <ul className="space-y-1">
              {mealLogs.map((l) => (
                <li key={l.id} className="flex justify-between items-center text-sm">
                  <span>{l.product?.name ?? l.customName} <span className="text-white/40">· {l.quantityG}g</span></span>
                  <span className="flex items-center gap-2">
                    <span className="text-white/50">{Math.round(l.kcal)} kcal</span>
                    <button onClick={() => removeLog(l.id)} className="text-white/30 hover:text-red-400">✕</button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <button onClick={() => setManualOpen((v) => !v)} className="text-accent text-sm">
        {manualOpen ? "Annuler l'ajout manuel" : "+ Ajout manuel (sans code-barres)"}
      </button>

      {manualOpen && (
        <div className="card p-4 space-y-2">
          <input placeholder="Nom" value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} className="w-full bg-bg px-3 py-2 rounded-lg outline-none" />
          <div className="grid grid-cols-4 gap-2">
            <input placeholder="kcal" value={manual.kcal} onChange={(e) => setManual({ ...manual, kcal: e.target.value })} className="bg-bg px-2 py-2 rounded-lg outline-none" />
            <input placeholder="protéines" value={manual.protein} onChange={(e) => setManual({ ...manual, protein: e.target.value })} className="bg-bg px-2 py-2 rounded-lg outline-none" />
            <input placeholder="glucides" value={manual.carbs} onChange={(e) => setManual({ ...manual, carbs: e.target.value })} className="bg-bg px-2 py-2 rounded-lg outline-none" />
            <input placeholder="lipides" value={manual.fat} onChange={(e) => setManual({ ...manual, fat: e.target.value })} className="bg-bg px-2 py-2 rounded-lg outline-none" />
          </div>
          <select value={manual.meal} onChange={(e) => setManual({ ...manual, meal: e.target.value })} className="w-full bg-bg px-3 py-2 rounded-lg outline-none">
            {MEALS.map((m) => <option key={m}>{m}</option>)}
          </select>
          <button onClick={saveManual} className="btn-accent w-full">Ajouter</button>
        </div>
      )}
    </div>
  );
}

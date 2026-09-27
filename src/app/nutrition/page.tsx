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
}

const MEALS = ["petit-déjeuner", "déjeuner", "dîner", "collation"];

export default function NutritionPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState({ name: "", kcal: "", protein: "", carbs: "", fat: "", meal: "déjeuner" });

  const load = async () => {
    const [logsRes, goalRes] = await Promise.all([fetch("/api/food-logs"), fetch("/api/goals")]);
    setLogs(await logsRes.json());
    setGoal(await goalRes.json());
  };

  useEffect(() => {
    load();
  }, []);

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
        <Link href="/nutrition/scan" className="btn-accent">📷 Scanner</Link>
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

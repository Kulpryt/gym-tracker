"use client";
import { useEffect, useState, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from "recharts";

type Period = 7 | 30 | 90;

interface NutritionDay { date: string; kcal: number; protein: number; carbs: number; fat: number }
interface SessionSummary { id: string; name: string; date: string; setsCount: number; exercises: string[] }
interface WeightEntry { date: string; weightKg: number }
interface ExerciseProgress { name: string; data: { date: string; maxKg: number; totalReps: number }[] }
interface HistoryData {
  nutritionByDay: NutritionDay[];
  sessions: SessionSummary[];
  weightLogs: WeightEntry[];
  progressByExercise: Record<string, ExerciseProgress>;
}

const fmt = (d: string) => {
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
};

const ACCENT = "#4A6741";
const COLORS = ["#4A6741", "#6b9e61", "#91c187", "#b8ddb5"];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl font-bold font-display">{value}</div>
      <div className="text-xs text-white/40 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-white/25 mt-1">{sub}</div>}
    </div>
  );
}

export default function HistoryPage() {
  const [period, setPeriod] = useState<Period>(30);
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newWeight, setNewWeight] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);
  const [selectedExo, setSelectedExo] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/history?days=${period}`);
    const d = await res.json();
    setData(d);
    if (!selectedExo && Object.keys(d.progressByExercise).length > 0) {
      setSelectedExo(Object.keys(d.progressByExercise)[0]);
    }
    setLoading(false);
  }, [period, selectedExo]);

  useEffect(() => { load(); }, [period]);

  const logWeight = async () => {
    if (!newWeight) return;
    setSavingWeight(true);
    await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weightKg: parseFloat(newWeight) })
    });
    setNewWeight("");
    setSavingWeight(false);
    load();
  };

  const avgKcal = data?.nutritionByDay.length
    ? Math.round(data.nutritionByDay.reduce((s, d) => s + d.kcal, 0) / data.nutritionByDay.length)
    : 0;

  const lastWeight = data?.weightLogs.length
    ? data.weightLogs[data.weightLogs.length - 1].weightKg
    : null;

  const exoKeys = data ? Object.keys(data.progressByExercise) : [];

  return (
    <div className="space-y-6">
      {/* Header + période */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold">Historique</h2>
        <div className="flex bg-surface rounded-xl p-1 gap-1 border border-white/8">
          {([7, 30, 90] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p ? "bg-accent text-white" : "text-white/40 hover:text-white"
              }`}
            >
              {p}j
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-white/30 text-sm py-8 text-center">Chargement...</div>
      ) : !data ? null : (
        <>
          {/* Stats résumé */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Séances" value={data.sessions.length} sub={`sur ${period} jours`} />
            <StatCard label="Moy. kcal/jour" value={avgKcal} sub="jours avec données" />
            <StatCard label="Poids actuel" value={lastWeight ? `${lastWeight} kg` : "—"} sub="dernier relevé" />
            <StatCard
              label="Exercices suivis"
              value={exoKeys.length}
              sub="avec charge"
            />
          </div>

          {/* Poids dans le temps */}
          <section className="card p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="font-display font-bold">Poids corporel</h3>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  step="0.1"
                  placeholder="kg"
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && logWeight()}
                  className="w-24 bg-bg border border-white/10 px-3 py-1.5 rounded-xl text-sm outline-none focus:border-accent/60"
                />
                <button onClick={logWeight} disabled={savingWeight || !newWeight} className="btn-accent py-1.5">
                  {savingWeight ? "..." : "Logger"}
                </button>
              </div>
            </div>
            {data.weightLogs.length === 0 ? (
              <p className="text-white/30 text-sm">Aucun relevé de poids sur cette période.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.weightLogs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} width={36} />
                  <Tooltip
                    contentStyle={{ background: "#171b18", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                    labelFormatter={fmt}
                    formatter={(v: number) => [`${v} kg`, "Poids"]}
                  />
                  <Line type="monotone" dataKey="weightKg" stroke={ACCENT} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </section>

          {/* Calories par jour */}
          <section className="card p-5">
            <h3 className="font-display font-bold mb-4">Calories par jour</h3>
            {data.nutritionByDay.length === 0 ? (
              <p className="text-white/30 text-sm">Aucune donnée nutritionnelle sur cette période.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.nutritionByDay} barSize={period <= 7 ? 24 : 8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} width={40} />
                  <Tooltip
                    contentStyle={{ background: "#171b18", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                    labelFormatter={fmt}
                    formatter={(v: number) => [`${Math.round(v)} kcal`, "Calories"]}
                  />
                  <Bar dataKey="kcal" fill={ACCENT} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          {/* Macros par jour */}
          {data.nutritionByDay.length > 0 && (
            <section className="card p-5">
              <h3 className="font-display font-bold mb-4">Macros par jour (g)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.nutritionByDay} barSize={period <= 7 ? 16 : 5}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} width={36} />
                  <Tooltip
                    contentStyle={{ background: "#171b18", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                    labelFormatter={fmt}
                    formatter={(v: number, name: string) => [`${Math.round(v)}g`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }} />
                  <Bar dataKey="protein" name="Protéines" stackId="a" fill={COLORS[0]} />
                  <Bar dataKey="carbs" name="Glucides" stackId="a" fill={COLORS[1]} />
                  <Bar dataKey="fat" name="Lipides" stackId="a" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </section>
          )}

          {/* Progression exercice */}
          {exoKeys.length > 0 && (
            <section className="card p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-display font-bold">Progression — charge max</h3>
                <select
                  value={selectedExo}
                  onChange={e => setSelectedExo(e.target.value)}
                  className="bg-bg border border-white/10 px-3 py-1.5 rounded-xl text-sm outline-none capitalize max-w-[220px]"
                >
                  {exoKeys.map(k => (
                    <option key={k} value={k}>{data.progressByExercise[k].name}</option>
                  ))}
                </select>
              </div>
              {selectedExo && data.progressByExercise[selectedExo] && (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.progressByExercise[selectedExo].data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} width={36} />
                    <Tooltip
                      contentStyle={{ background: "#171b18", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                      labelFormatter={fmt}
                      formatter={(v: number) => [`${v} kg`, "Charge max"]}
                    />
                    <Line type="monotone" dataKey="maxKg" stroke={ACCENT} strokeWidth={2} dot={{ fill: ACCENT, r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </section>
          )}

          {/* Historique des séances */}
          <section className="card p-5">
            <h3 className="font-display font-bold mb-3">Séances ({data.sessions.length})</h3>
            {data.sessions.length === 0 ? (
              <p className="text-white/30 text-sm">Aucune séance sur cette période.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {[...data.sessions].reverse().map(s => (
                  <li key={s.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">{s.name}</span>
                      <span className="text-white/30 text-xs">{fmt(s.date)}</span>
                    </div>
                    <p className="text-xs text-white/35 mt-1 capitalize">
                      {s.setsCount} séries · {s.exercises.slice(0, 3).join(", ")}{s.exercises.length > 3 ? "…" : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

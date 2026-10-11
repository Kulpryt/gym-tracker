"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handle = async () => {
    setLoading(true);
    setError(null);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur"); setLoading(false); return; }
      router.push("/");
      router.refresh();
    } catch {
      setError("Une erreur est survenue");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold">
          Gym<span className="text-accent">Track</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Ton carnet d'entraînement perso</p>
      </div>

      <div className="card w-full max-w-sm">
        <div className="flex border-b border-white/10">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                mode === m ? "text-accent border-b-2 border-accent -mb-px" : "text-white/40"
              }`}
            >
              {m === "login" ? "Connexion" : "Créer un compte"}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-3">
          <input
            autoFocus
            placeholder="Pseudo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handle()}
            className="w-full bg-bg border border-white/10 px-3 py-2.5 rounded-xl outline-none text-sm focus:border-accent/60 transition-colors"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handle()}
            className="w-full bg-bg border border-white/10 px-3 py-2.5 rounded-xl outline-none text-sm focus:border-accent/60 transition-colors"
          />
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button
            onClick={handle}
            disabled={loading || !username || !password}
            className="btn-accent w-full py-2.5 mt-1 disabled:opacity-40"
          >
            {loading ? "..." : mode === "login" ? "Se connecter" : "Créer le compte"}
          </button>
          {mode === "register" && (
            <p className="text-white/30 text-xs text-center">
              Pseudo min. 3 caractères · Mot de passe min. 6 caractères
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

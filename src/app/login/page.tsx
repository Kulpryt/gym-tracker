"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Mot de passe incorrect");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Une erreur est survenue");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card p-6 max-w-sm w-full space-y-4">
        <h2 className="font-display text-xl font-bold text-center">Accès Protégé</h2>
        <p className="text-xs text-white/50 text-center">
          Entrez le mot de passe pour accéder au carnet d'entraînement.
        </p>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            autoFocus
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-bg px-3 py-2 rounded-lg outline-none text-sm"
          />
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-accent w-full py-2"
          >
            {loading ? "Vérification..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

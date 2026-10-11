"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Section = "username" | "password" | "delete" | null;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/50 font-medium uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-bg border border-white/10 px-3 py-2.5 rounded-xl outline-none text-sm focus:border-accent/60 transition-colors"
    />
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [open, setOpen] = useState<Section>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [username, setUsername] = useState("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [deletePwd, setDeletePwd] = useState("");

  const send = async (action: string, body: object) => {
    setLoading(true); setMsg(null);
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body })
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg({ text: "Modification enregistrée ✓", ok: true });
      setOpen(null);
      if (action === "changeUsername") router.refresh();
    } else {
      setMsg({ text: data.error, ok: false });
    }
  };

  const deleteAccount = async () => {
    if (!confirm("Supprimer définitivement ton compte et toutes tes données ?")) return;
    setLoading(true);
    const res = await fetch("/api/user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePwd })
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) router.push("/login");
    else setMsg({ text: data.error, ok: false });
  };

  const toggle = (s: Section) => { setOpen(open === s ? null : s); setMsg(null); };

  return (
    <div className="max-w-md space-y-4">
      <h2 className="font-display text-2xl font-bold">Profil</h2>

      {msg && (
        <div className={`text-sm px-4 py-3 rounded-xl ${msg.ok ? "bg-accent/15 text-accent" : "bg-red-500/10 text-red-400"}`}>
          {msg.text}
        </div>
      )}

      {/* Changer pseudo */}
      <div className="card p-4">
        <button onClick={() => toggle("username")} className="w-full flex justify-between items-center">
          <div>
            <p className="font-medium text-sm">Changer de pseudo</p>
            <p className="text-xs text-white/40 mt-0.5">Modifie ton nom d'utilisateur</p>
          </div>
          <span className="text-white/30 text-sm">{open === "username" ? "▲" : "▼"}</span>
        </button>
        {open === "username" && (
          <div className="mt-4 space-y-3">
            <Field label="Nouveau pseudo">
              <Input placeholder="min. 3 caractères" value={username} onChange={e => setUsername(e.target.value)} />
            </Field>
            <button onClick={() => send("changeUsername", { username })} disabled={loading || !username} className="btn-accent w-full">
              {loading ? "..." : "Enregistrer"}
            </button>
          </div>
        )}
      </div>

      {/* Changer mdp */}
      <div className="card p-4">
        <button onClick={() => toggle("password")} className="w-full flex justify-between items-center">
          <div>
            <p className="font-medium text-sm">Changer de mot de passe</p>
            <p className="text-xs text-white/40 mt-0.5">Nécessite ton mot de passe actuel</p>
          </div>
          <span className="text-white/30 text-sm">{open === "password" ? "▲" : "▼"}</span>
        </button>
        {open === "password" && (
          <div className="mt-4 space-y-3">
            <Field label="Mot de passe actuel">
              <Input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
            </Field>
            <Field label="Nouveau mot de passe">
              <Input type="password" placeholder="min. 6 caractères" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
            </Field>
            <button onClick={() => send("changePassword", { currentPassword: currentPwd, newPassword: newPwd })} disabled={loading || !currentPwd || !newPwd} className="btn-accent w-full">
              {loading ? "..." : "Changer le mot de passe"}
            </button>
          </div>
        )}
      </div>

      {/* Supprimer compte */}
      <div className="card p-4 border-red-500/20">
        <button onClick={() => toggle("delete")} className="w-full flex justify-between items-center">
          <div>
            <p className="font-medium text-sm text-red-400">Supprimer mon compte</p>
            <p className="text-xs text-white/40 mt-0.5">Action irréversible — toutes les données seront perdues</p>
          </div>
          <span className="text-white/30 text-sm">{open === "delete" ? "▲" : "▼"}</span>
        </button>
        {open === "delete" && (
          <div className="mt-4 space-y-3">
            <Field label="Confirme ton mot de passe">
              <Input type="password" value={deletePwd} onChange={e => setDeletePwd(e.target.value)} />
            </Field>
            <button onClick={deleteAccount} disabled={loading || !deletePwd} className="w-full py-2.5 rounded-xl bg-red-500/15 text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-colors disabled:opacity-40">
              {loading ? "..." : "Supprimer définitivement"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

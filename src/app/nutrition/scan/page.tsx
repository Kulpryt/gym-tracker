"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const BarcodeScanner = dynamic(() => import("@/components/BarcodeScanner"), { ssr: false });

interface Product {
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  kcalPer100: number;
  proteinPer100: number;
  carbsPer100: number;
  fatPer100: number;
}

export default function ScanPage() {
  const router = useRouter();
  const [manualCode, setManualCode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("100");
  const [mealType, setMealType] = useState("déjeuner");

  const lookup = async (code: string) => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/products/${code}`);
    if (!res.ok) {
      setError("Produit introuvable sur OpenFoodFacts. Essaie un autre code ou ajoute-le manuellement.");
      setLoading(false);
      return;
    }
    setProduct(await res.json());
    setLoading(false);
  };

  const save = async () => {
    if (!product) return;
    await fetch("/api/food-logs", {
      method: "POST",
      body: JSON.stringify({
        mealType,
        barcode: product.barcode,
        quantityG: parseFloat(quantity),
        per100: {
          kcal: product.kcalPer100,
          protein: product.proteinPer100,
          carbs: product.carbsPer100,
          fat: product.fatPer100
        }
      })
    });
    router.push("/nutrition");
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold">Scanner un produit</h2>

      {!product && (
        <>
          <BarcodeScanner onDetected={lookup} />
          <div className="flex gap-2">
            <input
              placeholder="ou saisis le code-barres"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 bg-surface card px-3 py-2 outline-none"
            />
            <button onClick={() => lookup(manualCode)} className="btn-accent">Chercher</button>
          </div>
          {loading && <p className="text-white/40 text-sm">Recherche...</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </>
      )}

      {product && (
        <div className="card p-4 space-y-3">
          <p className="font-medium">{product.name}</p>
          {product.brand && <p className="text-white/40 text-sm">{product.brand}</p>}
          <p className="text-xs text-white/50">
            Pour 100g : {Math.round(product.kcalPer100)} kcal · P {Math.round(product.proteinPer100)}g ·
            G {Math.round(product.carbsPer100)}g · L {Math.round(product.fatPer100)}g
          </p>
          <div className="flex gap-2 items-center">
            <label className="text-sm text-white/60">Quantité (g)</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-24 bg-bg px-2 py-1.5 rounded-lg outline-none"
            />
          </div>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="w-full bg-bg px-3 py-2 rounded-lg outline-none"
          >
            <option>petit-déjeuner</option>
            <option>déjeuner</option>
            <option>dîner</option>
            <option>collation</option>
          </select>
          <div className="flex gap-2">
            <button onClick={() => setProduct(null)} className="card px-4 py-2 flex-1">Annuler</button>
            <button onClick={save} className="btn-accent flex-1">Ajouter</button>
          </div>
        </div>
      )}
    </div>
  );
}

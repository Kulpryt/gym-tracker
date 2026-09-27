// Client pour l'API publique OpenFoodFacts (gratuite, sans clé).
// Doc: https://openfoodfacts.github.io/openfoodfacts-server/api/

export interface OFFProduct {
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  kcalPer100: number;
  proteinPer100: number;
  carbsPer100: number;
  fatPer100: number;
}

export async function fetchProductByBarcode(barcode: string): Promise<OFFProduct | null> {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=code,product_name,brands,image_front_small_url,nutriments`,
    { headers: { "User-Agent": "GymTracker - berkan.kulpryt.com" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;

  const p = data.product;
  const n = p.nutriments || {};
  const name = p.product_name?.trim();
  if (!name) return null;

  return {
    barcode,
    name,
    brand: p.brands ? p.brands.split(",")[0].trim() : null,
    imageUrl: p.image_front_small_url || null,
    kcalPer100: n["energy-kcal_100g"] ?? (n["energy_100g"] ? n["energy_100g"] / 4.184 : 0),
    proteinPer100: n["proteins_100g"] ?? 0,
    carbsPer100: n["carbohydrates_100g"] ?? 0,
    fatPer100: n["fat_100g"] ?? 0
  };
}

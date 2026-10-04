export const CATEGORY_TRANSLATIONS: Record<string, string> = {
  "chest": "Poitrine",
  "back": "Dos",
  "shoulders": "Épaules",
  "upper arms": "Bras (haut)",
  "lower arms": "Avant-bras",
  "upper legs": "Cuisses",
  "lower legs": "Mollets",
  "waist": "Abdominaux",
  "cardio": "Cardio",
  "neck": "Cou"
};

export const EQUIPMENT_TRANSLATIONS: Record<string, string> = {
  "barbell": "Barre",
  "dumbbell": "Haltère",
  "body weight": "Poids du corps",
  "cable": "Poulie",
  "machine": "Machine",
  "resistance band": "Élastique",
  "stability ball": "Ballon de stabilité",
  "ez barbell": "Barre EZ",
  "kettlebell": "Kettlebell",
  "smith machine": "Machine Smith",
  "other": "Autre",
  "leverage machine": "Machine à levier",
  "weighted": "Lesté",
  "assisted": "Assisté",
  "medicine ball": "Medecine ball",
  "exercise wheel": "Roue abdo",
  "foam roll": "Rouleau de massage",
  "skierg machine": "SkiErg",
  "sled machine": "Luge",
  "hammer": "Marteau",
  "tire": "Pneu"
};

export const TARGET_TRANSLATIONS: Record<string, string> = {
  "pectorals": "Pectoraux",
  "lats": "Dorsaux",
  "biceps": "Biceps",
  "triceps": "Triceps",
  "quads": "Quadriceps",
  "hamstrings": "Ischio-jambiers",
  "glutes": "Fessiers",
  "calves": "Mollets",
  "abs": "Abdominaux",
  "delts": "Deltoïdes",
  "upper back": "Haut du dos",
  "lower back": "Bas du dos",
  "traps": "Trapèzes",
  "forearms": "Avant-bras",
  "abductors": "Abducteurs",
  "adductors": "Adducteurs",
  "cardiovascular system": "Système cardiovasculaire",
  "spine": "Colonne vertébrale",
  "serratus anterior": "Dentelé antérieur",
  "levator scapulae": " Élévateur de la scapula"
};

export function translateCategory(cat: string): string {
  if (!cat) return "";
  const lower = cat.toLowerCase();
  return CATEGORY_TRANSLATIONS[lower] || cat.charAt(0).toUpperCase() + cat.slice(1);
}

export function translateEquipment(eq: string): string {
  if (!eq) return "";
  const lower = eq.toLowerCase();
  return EQUIPMENT_TRANSLATIONS[lower] || eq.charAt(0).toUpperCase() + eq.slice(1);
}

export function translateTarget(target: string): string {
  if (!target) return "";
  const lower = target.toLowerCase();
  return TARGET_TRANSLATIONS[lower] || target.charAt(0).toUpperCase() + target.slice(1);
}

import { prisma } from "@/lib/prisma";

const RAW_BASE = "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main";

export async function seedExercisesIfEmpty() {
  const count = await prisma.exercise.count();
  if (count > 0) return;

  console.log("[seedExercises] Table vide, import automatique...");
  try {
    const res = await fetch(`${RAW_BASE}/data/exercises.json`);
    if (!res.ok) { console.error("[seedExercises] Échec du téléchargement"); return; }
    const exercises = await res.json();
    for (const ex of exercises) {
      await prisma.exercise.upsert({
        where: { id: ex.id },
        create: {
          id: ex.id, name: ex.name, category: ex.category, bodyPart: ex.body_part,
          equipment: ex.equipment, target: ex.target, muscleGroup: ex.muscle_group,
          secondaryMuscles: ex.secondary_muscles ?? [],
          instructions: ex.instructions?.fr || ex.instructions?.en || "",
          instructionSteps: ex.instruction_steps?.fr ?? ex.instruction_steps?.en ?? [],
          image: `${RAW_BASE}/${ex.image}`, gifUrl: `${RAW_BASE}/${ex.gif_url}`
        },
        update: {}
      });
    }
    console.log(`[seedExercises] ${exercises.length} exercices importés.`);
  } catch (e) {
    console.error("[seedExercises] Erreur:", e);
  }
}

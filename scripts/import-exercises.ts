// Importe les 1324 exercices depuis le repo GitHub hasaneyldrm/exercises-dataset
// Usage: npm run import:exercises
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const RAW_BASE = "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main";
const DATA_URL = `${RAW_BASE}/data/exercises.json`;

interface RawExercise {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  target: string;
  muscle_group: string;
  secondary_muscles: string[];
  instructions: { fr?: string; en?: string };
  instruction_steps: { fr?: string[]; en?: string[] };
  image: string;
  gif_url: string;
}

async function main() {
  console.log(`Téléchargement du dataset depuis ${DATA_URL} ...`);
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`Échec du téléchargement: ${res.status}`);
  const exercises: RawExercise[] = await res.json();
  console.log(`${exercises.length} exercices trouvés, import en cours...`);

  let done = 0;
  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { id: ex.id },
      create: {
        id: ex.id,
        name: ex.name,
        category: ex.category,
        bodyPart: ex.body_part,
        equipment: ex.equipment,
        target: ex.target,
        muscleGroup: ex.muscle_group,
        secondaryMuscles: ex.secondary_muscles ?? [],
        instructions: ex.instructions?.fr || ex.instructions?.en || "",
        instructionSteps: ex.instruction_steps?.fr ?? ex.instruction_steps?.en ?? [],
        image: `${RAW_BASE}/${ex.image}`,
        gifUrl: `${RAW_BASE}/${ex.gif_url}`
      },
      update: {
        name: ex.name,
        category: ex.category,
        bodyPart: ex.body_part,
        equipment: ex.equipment,
        target: ex.target,
        muscleGroup: ex.muscle_group,
        secondaryMuscles: ex.secondary_muscles ?? [],
        instructions: ex.instructions?.fr || ex.instructions?.en || "",
        instructionSteps: ex.instruction_steps?.fr ?? ex.instruction_steps?.en ?? [],
        image: `${RAW_BASE}/${ex.image}`,
        gifUrl: `${RAW_BASE}/${ex.gif_url}`
      }
    });
    done++;
    if (done % 100 === 0) console.log(`${done}/${exercises.length}`);
  }
  console.log(`Import terminé: ${done} exercices.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

export interface SliderCandidate {
  url: string;
  title: string | null;
  category: string | null;
}

const SLOT_TOTAL = 8;
const HOME_CATEGORIES = ["boda", "quince", "empresarial", "revelacion"] as const;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Distribuye SLOT_TOTAL cupos entre las categorías con fotos disponibles
 * (lo más parejo posible) y selecciona imágenes al azar dentro de cada una.
 * Aleatorio por invocación — pensado para llamarse una vez por request.
 */
export function pickRandomSliderImages(images: SliderCandidate[]): SliderCandidate[] {
  const byCategory = new Map<string, SliderCandidate[]>();
  for (const cat of HOME_CATEGORIES) byCategory.set(cat, []);
  for (const img of images) {
    if (img.category && byCategory.has(img.category)) {
      byCategory.get(img.category)!.push(img);
    }
  }

  const activeCats = shuffle(
    HOME_CATEGORIES.filter((c) => (byCategory.get(c)?.length ?? 0) > 0),
  );
  const n = activeCats.length;
  if (n === 0) return [];

  const base = Math.floor(SLOT_TOTAL / n);
  const extra = SLOT_TOTAL % n;
  const quota = new Map<string, number>();
  activeCats.forEach((cat, idx) => {
    quota.set(cat, base + (idx < extra ? 1 : 0));
  });

  let leftover = 0;
  for (const cat of activeCats) {
    const pool = byCategory.get(cat)!.length;
    const want = quota.get(cat)!;
    if (want > pool) {
      leftover += want - pool;
      quota.set(cat, pool);
    }
  }

  let guard = 0;
  while (leftover > 0 && guard < 100) {
    guard++;
    let progressed = false;
    for (const cat of activeCats) {
      if (leftover <= 0) break;
      const pool = byCategory.get(cat)!.length;
      const have = quota.get(cat)!;
      if (have < pool) {
        quota.set(cat, have + 1);
        leftover--;
        progressed = true;
      }
    }
    if (!progressed) break;
  }

  const selected: SliderCandidate[] = [];
  for (const cat of activeCats) {
    const pool = shuffle(byCategory.get(cat)!);
    selected.push(...pool.slice(0, quota.get(cat)!));
  }

  return shuffle(selected).slice(0, SLOT_TOTAL);
}

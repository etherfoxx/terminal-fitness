import type { WorkoutSet } from '../types/workout';

export function calculateWorkoutSummary(
  sets: WorkoutSet[],
  durationMs: number
) {
  const exerciseMap = new Map<
    string,
    {
      sets: number;
      reps: number;
      volume: number;
    }
  >();

  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;

  for (const entry of sets) {
    const entrySets = entry.sets;
    const entryReps = entry.sets * entry.reps;
    const entryVolume = entryReps * entry.weight;

    totalSets += entrySets;
    totalReps += entryReps;
    totalVolume += entryVolume;

    const existing = exerciseMap.get(entry.exercise) ?? {
      sets: 0,
      reps: 0,
      volume: 0,
    };

    existing.sets += entrySets;
    existing.reps += entryReps;
    existing.volume += entryVolume;

    exerciseMap.set(entry.exercise, existing);
  }

  return {
    durationMs,
    totalSets,
    totalReps,
    totalVolume,
    exercises: Array.from(exerciseMap.entries()).map(([exercise, data]) => ({
      exercise,
      ...data,
    })),
  };
}

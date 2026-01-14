type ExerciseSummary = {
  exercise: string;
  sets: number;
  reps: number;
  volume: number;
};

type WorkoutSummary = {
  durationMs: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  exercises: ExerciseSummary[];
};

// types/workout.ts

export type WorkoutSet = {
  exercise: string;
  weight: number;
  sets: number;
  reps: number;
  timestamp: number;
};

export type WorkoutState = {
  startTime: number | null;
  sets: WorkoutSet[];
};

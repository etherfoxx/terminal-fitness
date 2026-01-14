// types/command.ts

import type { WorkoutSet } from './workout';

export type AddSetInput = {
  exercise: string;
  weight: number;
  sets: number;
  reps: number;
};
export type EndWorkoutResult = {
  durationMs: number;
  sets: WorkoutSet[];
};
export type CommandContext = {
  // workout state
  workoutStart: number | null;

  // lifecycle
  startWorkout: () => void;
  endWorkout: () => EndWorkoutResult;

  // actions
  addSet: (set: AddSetInput) => void;

  // terminal
  clear: () => void;
};

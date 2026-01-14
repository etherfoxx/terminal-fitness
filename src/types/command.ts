// types/command.ts

export type AddSetInput = {
  exercise: string;
  weight: number;
  sets: number;
  reps: number;
};

export type CommandContext = {
  // workout state
  workoutStart: number | null;

  // lifecycle
  startWorkout: () => void;
  endWorkout: () => number;

  // actions
  addSet: (set: AddSetInput) => void;

  // terminal
  clear: () => void;
};

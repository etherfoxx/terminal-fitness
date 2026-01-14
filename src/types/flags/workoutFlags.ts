// flags/workoutFlags.ts

import type { FlagDefinition } from './flags';

export const WorkoutFlags = {
  weight: {
    key: 'weight',
    short: '-w',
    long: '--weight',
    required: true,
    parse: Number,
  },
  sets: {
    key: 'sets',
    short: '-s',
    long: '--sets',
    required: true,
    parse: Number,
  },
  reps: {
    key: 'reps',
    short: '-r',
    long: '--reps',
    required: true,
    parse: Number,
  },
} satisfies Record<string, FlagDefinition>;

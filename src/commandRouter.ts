// commandRouter.ts
// ----------------
// Routes normalized terminal commands to domain-specific handlers.
// This file contains PRODUCT LOGIC, not UI or terminal mechanics.

import { formatDuration } from './utils/helpers';

export type CommandContext = {
  // Workout state
  workoutStart: number | null;

  // Mutators
  startWorkout: () => void;
  addSet: (set: {
    exercise: string;
    weight: number;
    sets: number;
    reps: number;
  }) => void;
  endWorkout: () => number; // returns duration in ms
  // Terminal helpers
  clear: () => void;
};

// Normalize input so humans can be sloppy
function normalize(cmd: string): string {
  return cmd.toLowerCase().trim().replace(/[-_]/g, ' ').replace(/\s+/g, ' ');
}

function parseFlags(tokens: string[]) {
  const result: Record<string, string> = {};

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.startsWith('-')) {
      const value = tokens[i + 1];

      if (!value || value.startsWith('-')) {
        throw new Error(`Missing value for ${token}`);
      }

      result[token] = value;
      i++; // skip value
    }
  }

  return result;
}

// ----------------------
// Public router function
// ----------------------
export function routeCommand(
  rawCommand: string,
  ctx: CommandContext
): string | string[] | void {
  const command = rawCommand.trim();
  if (!command) return;

  const normalized = command.toLowerCase();
  const [verb, ...rest] = normalized.split(' ');
  const args = rest.join(' ');

  switch (verb) {
    // -----------------------------
    // WORKOUT LIFECYCLE
    // -----------------------------
    case 'workout':
      return handleWorkoutCommand(args, ctx);

    // -----------------------------
    // ADD (stateful action)
    // -----------------------------
    case 'add':
      return handleWorkoutAdd(args, ctx);

    // -----------------------------
    // NUTRITION (future)
    // -----------------------------
    case 'eat':
      return handleEatCommand(args, ctx);

    // -----------------------------
    // GLOBAL / TERMINAL
    // -----------------------------
    case 'help':
      return showHelp();

    case 'clear':
      ctx.clear();
      return;

    // -----------------------------
    // FALLBACK
    // -----------------------------
    default:
      return `Unknown command: ${rawCommand}`;
  }
}

// ----------------------
// Workout commands
// ----------------------
function handleWorkoutCommand(
  args: string,
  ctx: CommandContext
): string | string[] {
  if (!args) return 'Workout command required.';

  if (args === 'start') return handleWorkoutStart(ctx);
  if (args === 'status') return handleWorkoutStatus(ctx);
  if (args === 'end') return handleWorkoutEnd(ctx);
  return `Unknown workout command: ${args}`;
}

function handleWorkoutStart(ctx: CommandContext): string {
  if (ctx.workoutStart) return 'Workout already in progress.';
  ctx.startWorkout();
  return 'Workout started.';
}

function handleWorkoutStatus(ctx: CommandContext): string {
  if (!ctx.workoutStart) return 'No workout in progress.';
  return 'Workout in progress.';
}

function handleWorkoutEnd(ctx: CommandContext): string {
  if (!ctx.workoutStart) return 'No active workout.';
  const duration = ctx.endWorkout();
  return `Workout complete. Duration: ${duration}ms`;
}
function handleWorkoutAdd(args: string, ctx: CommandContext): string {
  if (!ctx.workoutStart) {
    return 'Start a workout before adding exercises.';
  }

  const tokens = args.split(' ');

  const exercise = tokens[0];
  if (!exercise) return 'Exercise name is required.';

  const flagTokens = tokens.slice(1);

  let flags: Record<string, string>;
  try {
    flags = parseFlags(flagTokens);
  } catch (err) {
    return (err as Error).message;
  }

  const weight = flags['-w'] ?? flags['--weight'];
  const sets = flags['-s'] ?? flags['--sets'];
  const reps = flags['-r'] ?? flags['--reps'];

  if (!weight || !sets || !reps) {
    return 'Missing required flags. Use: -w <weight> -s <sets> -r <reps>';
  }

  ctx.addSet({
    exercise,
    weight: Number(weight),
    sets: Number(sets),
    reps: Number(reps),
  });

  return `Added ${exercise}: ${sets}x${reps} @ ${weight}lbs`;
}

// ----------------------
// Nutrition commands
// ----------------------
function handleEatCommand(args: string, ctx: CommandContext): string {
  // Stub for now — intentionally simple
  // Examples this will support later:
  // eat protein 40g
  // eat calories 600
  // eat apple

  if (!args) {
    return 'What did you eat?';
  }

  return `Nutrition logging not implemented yet (${args})`;
}

// ----------------------
// Help output
// ----------------------
function showHelp(): string[] {
  return [
    'Available commands:',
    '',
    'Workout:',
    '  workout start',
    '  workout status',
    '  workout end',
    '',
    'Nutrition:',
    '  eat <food | calories | protein>',
    '',
  ];
}

// commandRouter.ts
// ----------------
// Routes normalized terminal commands to domain-specific handlers.
// This file contains PRODUCT LOGIC, not UI or terminal mechanics.

import type { CommandContext } from './types/command';
import { WorkoutFlags } from './types/flags/workoutFlags';
import { Helpers } from './utils/helpers';

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
  // args shape:
  // "<exercise> -w <weight> -s <sets> -r <reps>"

  const tokens = args.split(' ').filter(Boolean);

  const exercise = tokens[0];
  if (!exercise) {
    return 'Exercise name is required.';
  }

  const flagTokens = tokens.slice(1);

  let flags;
  try {
    flags = Helpers.parseFlags(flagTokens, WorkoutFlags);
  } catch (err) {
    return (err as Error).message;
  }

  ctx.addSet({
    exercise,
    weight: flags.weight,
    sets: flags.sets,
    reps: flags.reps,
  });

  return `Added ${exercise}: ${flags.sets}x${flags.reps} @ ${flags.weight}`;
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

import { Prompt } from './Prompt';
import type { PromptResult } from './Prompt';

export class CreateWorkoutPrompt extends Prompt {
  start(): string[] {
    if (ctx.workoutStart) return ['Workout already in progress.'];
    ctx.startWorkout();
    return ['Workout started.'];
  }

  handleInput(input: string): PromptResult {
    return {
      done: true,
      output: [`✓ Con`, `✓ Configuration created`, ''],
    };
  }
}

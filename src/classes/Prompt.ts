export type PromptResult = {
  done: boolean;
  output: string[];
};

export abstract class Prompt {
  abstract start(): PromptResult;
  abstract end(): PromptResult;
  abstract add(): PromptResult;
  abstract undo(): PromptResult;
  abstract handleInput(input: string): PromptResult;
}

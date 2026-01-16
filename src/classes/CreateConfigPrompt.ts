import { Prompt } from './Prompt';
import type { PromptResult } from './Prompt';
import type { ConfigurationType } from 'configuration-engine';

export class CreateConfigPrompt extends Prompt {
  start(): string[] {
    return [
      'Creating new configuration',
      '',
      'What type of configuration is this?',
      '  ramp',
      '  stair',
      '  platform',
      '  handrail',
      '  fortress',
      '',
    ];
  }

  handleInput(input: string): PromptResult {
    const value = input.toLowerCase() as ConfigurationType;
    const allowed: ConfigurationType[] = [
      'ramp',
      'stair',
      'platform',
      'handrail',
      'fortress',
    ];

    if (!allowed.includes(value)) {
      return {
        done: false,
        output: [
          `Invalid type: ${input}`,
          'Please choose one of:',
          ...allowed.map((v) => `  ${v}`),
          '',
        ],
      };
    }
    const configId = `${value}-1`;
    return {
      done: true,
      createdConfigId: configId,
      output: [
        `✓ Configuration type set to: ${value}`,
        `✓ Configuration created`,
        '',
      ],
    };
  }
}

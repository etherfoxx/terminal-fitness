import type { FlagDefinition } from '../types/flags/flags';

export class Helpers {
  static formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}m ${seconds}s`;
  }

  static parseFlags<T extends Record<string, FlagDefinition>>(
    tokens: string[],
    definitions: T
  ): {
    [K in keyof T]: ReturnType<T[K]['parse']>;
  } {
    const result: Record<string, any> = {};

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const def = Object.values(definitions).find(
        (d) => d.short === token || d.long === token
      );

      if (!def) continue;

      const value = tokens[i + 1];
      if (!value || value.startsWith('-')) {
        throw new Error(`Missing value for ${token}`);
      }

      result[def.key] = def.parse(value);
      i++;
    }

    // required flag check
    for (const def of Object.values(definitions)) {
      if (def.required && result[def.key] === undefined) {
        throw new Error(`Missing required flag: ${def.short} ${def.long}`);
      }
    }

    return result as any;
  }
  static randomUUID(): string {
    return (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(
      /[018]/g,
      (c: any) =>
        (
          c ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
    );
  }
  static isString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }
}

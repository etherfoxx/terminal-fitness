// types/flags.ts

export type FlagDefinition<T = number> = {
  key: string; // canonical name
  short: string; // -w
  long: string; // --weight
  required: boolean;
  parse: (value: string) => T;
};

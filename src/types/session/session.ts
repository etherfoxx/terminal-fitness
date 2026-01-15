export type SessionEntry =
  | { type: 'input'; text: string; ts: number }
  | { type: 'output'; text: string; ts: number }
  | { type: 'system'; text: string; ts: number };

export type SessionData = {
  id: string;
  startedAt: number;
  lastActiveAt: number;
  transcript: SessionEntry[];
};

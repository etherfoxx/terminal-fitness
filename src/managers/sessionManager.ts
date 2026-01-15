import { SESSION_TIMEOUT_MS, SESSION_STORAGE_KEY } from '../data/constants';
import type { SessionData, SessionEntry } from '../types/session/session';

export class SessionManager {
  static load(): SessionData | null {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    try {
      const session = JSON.parse(raw) as SessionData;
      if (this.isExpired(session)) {
        this.clear();
        return null;
      }
      return session;
    } catch {
      this.clear();
      return null;
    }
  }

  static createNew(): SessionData {
    const now = Date.now();
    const session: SessionData = {
      id: crypto.randomUUID(),
      startedAt: now,
      lastActiveAt: now,
      transcript: [],
    };
    this.save(session);
    return session;
  }

  static save(session: SessionData): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  static clear(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  static isExpired(session: SessionData): boolean {
    return Date.now() - session.lastActiveAt > SESSION_TIMEOUT_MS;
  }

  static append(
    session: SessionData,
    entry: Omit<SessionEntry, 'ts'>
  ): SessionData {
    const updated: SessionData = {
      ...session,
      lastActiveAt: Date.now(),
      transcript: [...session.transcript, { ...entry, ts: Date.now() }],
    };

    this.save(updated);
    return updated;
  }
}

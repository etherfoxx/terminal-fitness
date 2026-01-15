// src/history/HistoryManager.ts

import { HISTORY_MAX_ENTRIES, HISTORY_STORAGE_KEY } from '../data/constants';

export class HistoryManager {
  static load(): string[] {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }

  static save(entries: string[]): void {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
  }

  static add(command: string): string[] {
    const entries = this.load();

    // avoid duplicates back-to-back
    if (entries[entries.length - 1] === command) {
      return entries;
    }

    const updated = [...entries, command].slice(-HISTORY_MAX_ENTRIES);
    this.save(updated);
    return updated;
  }

  static previous(
    entries: string[],
    cursor: number
  ): { value: string; cursor: number } {
    const nextCursor = Math.max(0, cursor - 1);
    return {
      value: entries[nextCursor] ?? '',
      cursor: nextCursor,
    };
  }

  static next(
    entries: string[],
    cursor: number
  ): { value: string; cursor: number } {
    const nextCursor = Math.min(entries.length, cursor + 1);
    return {
      value: entries[nextCursor] ?? '',
      cursor: nextCursor,
    };
  }
}

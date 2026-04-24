import { tokenManager } from "../auth/token-manager";

export interface DraftData {
  formId: number;
  userId: number;
  answers: Record<string, unknown>;
  lastSavedAt: string;
  formVersion: number;
}

const getDraftKey = (formId: number, userId: number) => `draft:${formId}:${userId}`;

export const draftManager = {
  save(formId: number, answers: Record<string, unknown>, formVersion: number = 1): void {
    if (typeof window === "undefined") return;

    const user = tokenManager.getUserFromToken();
    if (!user) return;

    const draft: DraftData = {
      formId,
      userId: user.id,
      answers,
      lastSavedAt: new Date().toISOString(),
      formVersion,
    };

    localStorage.setItem(getDraftKey(formId, user.id), JSON.stringify(draft));
  },

  load(formId: number): DraftData | null {
    if (typeof window === "undefined") return null;

    const user = tokenManager.getUserFromToken();
    if (!user) return null;

    const data = localStorage.getItem(getDraftKey(formId, user.id));
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  clear(formId: number): void {
    if (typeof window === "undefined") return;

    const user = tokenManager.getUserFromToken();
    if (!user) return;

    localStorage.removeItem(getDraftKey(formId, user.id));
  },

  hasDraft(formId: number): boolean {
    return this.load(formId) !== null;
  },

  isDraftValid(formId: number, currentFormVersion: number): boolean {
    const draft = this.load(formId);
    if (!draft) return false;
    return draft.formVersion === currentFormVersion;
  },
};

export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback(...args);
      timeoutId = null;
    }, delay);
  };
}
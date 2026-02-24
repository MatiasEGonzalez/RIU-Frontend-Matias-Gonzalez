import { Injectable, signal, computed } from '@angular/core';

/**
 * LoadingService - Centralized loading state management.
 *
 * Uses a counter instead of a boolean to handle concurrent operations:
 * if two requests start simultaneously, the spinner should only hide
 * when BOTH complete, not when the first one finishes.
 *
 * Exposes a readonly `loading` computed signal for consumers.
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly activeRequests = signal(0);

  /** Whether any operation is currently in progress */
  readonly loading = computed(() => this.activeRequests() > 0);

  /** Signal a new async operation has started */
  start(): void {
    this.activeRequests.update((count) => count + 1);
  }

  /** Signal an async operation has completed */
  stop(): void {
    this.activeRequests.update((count) => Math.max(0, count - 1));
  }
}

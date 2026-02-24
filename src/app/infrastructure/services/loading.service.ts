import { Injectable, signal, computed } from '@angular/core';

/**
 * Counter-based loading state — stays active until all concurrent
 * operations complete, not just the first one.
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly activeRequests = signal(0);
  readonly loading = computed(() => this.activeRequests() > 0);

  start(): void {
    this.activeRequests.update((count) => count + 1);
  }

  stop(): void {
    this.activeRequests.update((count) => Math.max(0, count - 1));
  }
}

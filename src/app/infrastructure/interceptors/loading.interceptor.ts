import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * Functional HTTP interceptor that manages global loading state.
 *
 * Activates LoadingService.start() before each request and
 * LoadingService.stop() when the request completes (success or error).
 *
 * Uses finalize() to guarantee cleanup even on errors or cancellations.
 *
 * Currently the app uses an in-memory service (no HttpClient), so this
 * interceptor is pre-wired for when a real backend is connected.
 * In the meantime, smart components call LoadingService.start()/stop()
 * directly around their in-memory operations.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  loadingService.start();

  return next(req).pipe(
    finalize(() => loadingService.stop())
  );
};

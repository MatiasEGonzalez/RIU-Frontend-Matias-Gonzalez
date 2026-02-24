import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { HeroRepository } from './domain/repositories/hero.repository';
import { HeroService } from './infrastructure/services/hero.service';
import { loadingInterceptor } from './infrastructure/interceptors/loading.interceptor';

/**
 * Application-level providers.
 *
 * provideAnimations() is intentionally omitted — deprecated since Angular 20.2
 * (intent to remove in v23). Angular Material 21 injects ANIMATION_MODULE_TYPE
 * as optional, so it works without the legacy animation renderer. In that case,
 * Material gracefully degrades its animations to CSS transitions.
 * For custom animations, Angular 21 offers per-component template bindings
 * (animate.enter / animate.leave) instead of global providers.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([loadingInterceptor])),
    { provide: HeroRepository, useClass: HeroService },
  ]
};

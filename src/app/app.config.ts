import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { HeroRepository } from './domain/repositories/hero.repository';
import { HeroService } from './infrastructure/services/hero.service';
import { loadingInterceptor } from './infrastructure/interceptors/loading.interceptor';

/** Root-level DI configuration. */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([loadingInterceptor])),
    { provide: HeroRepository, useClass: HeroService },
  ]
};

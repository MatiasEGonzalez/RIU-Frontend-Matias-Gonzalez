import { Routes } from '@angular/router';

/**
 * Application Root Routes
 *
 * Uses lazy loading at the feature level:
 * - The entire heroes feature (list, form) is loaded as a single chunk
 *   only when the user navigates to /heroes.
 * - The wildcard route redirects unknown paths to the hero list.
 */
export const routes: Routes = [
  {
    path: 'heroes',
    loadChildren: () =>
      import('./features/heroes/heroes.routes').then(
        (m) => m.heroesRoutes
      ),
  },
  { path: '', redirectTo: 'heroes', pathMatch: 'full' },
  { path: '**', redirectTo: 'heroes' },
];

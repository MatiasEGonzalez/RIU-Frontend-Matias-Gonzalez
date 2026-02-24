import { Routes } from '@angular/router';

/**
 * Hero Feature Routes
 *
 * Route order matters: static paths ('/new') must come before
 * parameterized paths ('/:id') to avoid 'new' being captured as an ID.
 *
 * All components are lazy-loaded via dynamic import() for optimal code splitting.
 */
export const heroesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/hero-list-page/hero-list-page.component').then(
        (m) => m.HeroListPageComponent
      ),
    title: 'Heroes',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/hero-form-page/hero-form-page.component').then(
        (m) => m.HeroFormPageComponent
      ),
    title: 'New Hero',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/hero-form-page/hero-form-page.component').then(
        (m) => m.HeroFormPageComponent
      ),
    title: 'Edit Hero',
  },
];

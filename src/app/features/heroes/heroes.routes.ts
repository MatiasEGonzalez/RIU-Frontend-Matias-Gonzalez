import { Routes } from '@angular/router';

/** Static paths before parameterized to avoid capturing 'new' as :id. */
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

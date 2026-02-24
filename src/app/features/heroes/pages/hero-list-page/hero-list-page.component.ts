import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * HeroListPageComponent - Smart Component
 *
 * Orchestrates the hero list view:
 * - Injects HeroRepository for data access
 * - Manages pagination, search, and CRUD triggers
 * - Delegates presentation to dumb components
 */
@Component({
  selector: 'app-hero-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Hero List</h2>
    <p>Coming soon...</p>
  `,
})
export class HeroListPageComponent {}

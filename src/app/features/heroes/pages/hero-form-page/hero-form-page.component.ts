import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * HeroFormPageComponent - Smart Component
 *
 * Handles hero creation and editing:
 * - Reads route params to determine mode (create vs edit)
 * - Manages Reactive Form with validations
 * - Delegates save/cancel to HeroRepository
 */
@Component({
  selector: 'app-hero-form-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Hero Form</h2>
    <p>Coming soon...</p>
  `,
})
export class HeroFormPageComponent {}

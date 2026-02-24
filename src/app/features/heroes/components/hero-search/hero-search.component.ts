import { Component, output, ChangeDetectionStrategy } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

/** Presentational search input — emits the current term on every keystroke. */
@Component({
  selector: 'app-hero-search',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field appearance="outline" class="search-field">
      <mat-label>Search heroes</mat-label>
      <input
        matInput
        type="text"
        placeholder="e.g. Spider"
        (input)="onSearch($event)"
      />
      <mat-icon matPrefix>search</mat-icon>
    </mat-form-field>
  `,
  styles: `
    .search-field {
      width: 100%;
    }
  `,
})
export class HeroSearchComponent {
  /** Emits the current search term on every keystroke */
  readonly searchChange = output<string>();

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }
}

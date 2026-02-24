import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Hero } from '../../../../domain/models/hero.model';

/** Presentational table of heroes with edit/delete action buttons. */
@Component({
  selector: 'app-hero-table',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (heroes().length === 0) {
      <p class="no-results">No heroes found.</p>
    } @else {
      <table mat-table [dataSource]="heroes()" class="hero-table">
        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let hero">{{ hero.id }}</td>
        </ng-container>

        <!-- Name Column -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let hero">{{ hero.name }}</td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let hero">
            <button
              mat-icon-button
              matTooltip="Edit"
              (click)="edit.emit(hero)"
            >
              <mat-icon>edit</mat-icon>
            </button>
            <button
              mat-icon-button
              matTooltip="Delete"
              color="warn"
              (click)="delete.emit(hero)"
            >
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    }
  `,
  styles: `
    .hero-table {
      width: 100%;
    }

    .no-results {
      text-align: center;
      padding: 24px;
      color: rgba(0, 0, 0, 0.54);
      font-style: italic;
    }
  `,
})
export class HeroTableComponent {
  readonly heroes = input.required<Hero[]>();
  readonly edit = output<Hero>();
  readonly delete = output<Hero>();
  readonly displayedColumns = ['id', 'name', 'actions'];
}

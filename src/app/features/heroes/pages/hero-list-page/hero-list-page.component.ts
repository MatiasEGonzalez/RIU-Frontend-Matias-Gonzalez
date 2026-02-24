import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';

import { Hero } from '../../../../domain/models/hero.model';
import { HeroRepository } from '../../../../domain/repositories/hero.repository';
import { LoadingService } from '../../../../infrastructure/services/loading.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { HeroSearchComponent } from '../../components/hero-search/hero-search.component';
import { HeroTableComponent } from '../../components/hero-table/hero-table.component';

/** Container component — hero list with search, pagination, and delete confirmation. */
@Component({
  selector: 'app-hero-list-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressBarModule,
    HeroSearchComponent,
    HeroTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loadingService.loading()) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }

    <div class="list-header">
      <h2>Heroes</h2>
      <button mat-flat-button color="primary" (click)="onAdd()">
        <mat-icon>add</mat-icon>
        New Hero
      </button>
    </div>

    <app-hero-search (searchChange)="onSearch($event)" />

    <app-hero-table
      [heroes]="paginatedHeroes()"
      (edit)="onEdit($event)"
      (delete)="onDelete($event)"
    />

    <mat-paginator
      [length]="filteredHeroes().length"
      [pageSize]="pageSize()"
      [pageIndex]="pageIndex()"
      [pageSizeOptions]="[5, 10, 25]"
      (page)="onPageChange($event)"
      showFirstLastButtons
    />
  `,
  styles: `
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .list-header h2 {
      margin: 0;
    }
  `,
})
export class HeroListPageComponent implements OnInit {
  private readonly heroRepository = inject(HeroRepository);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly loadingService = inject(LoadingService);

  /** All heroes from the repository */
  private readonly allHeroes = signal<Hero[]>([]);

  /** Current search term */
  private readonly searchTerm = signal('');

  /** Pagination state */
  readonly pageSize = signal(5);
  readonly pageIndex = signal(0);

  /** Heroes filtered by search term */
  readonly filteredHeroes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const heroes = this.allHeroes();

    if (!term) {
      return heroes;
    }

    return heroes.filter((hero) =>
      hero.name.toLowerCase().includes(term)
    );
  });

  /** Heroes for the current page */
  readonly paginatedHeroes = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredHeroes().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.loadHeroes();
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
  }

  onAdd(): void {
    this.router.navigate(['/heroes', 'new']);
  }

  onEdit(hero: Hero): void {
    this.router.navigate(['/heroes', hero.id, 'edit']);
  }

  onDelete(hero: Hero): void {
    const data: ConfirmDialogData = {
      title: 'Delete hero',
      message: `Are you sure you want to delete "${hero.name}"?`,
    };

    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.executeDelete(hero.id);
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  private loadHeroes(): void {
    this.loadingService.start();
    this.heroRepository.getAll().subscribe({
      next: (heroes) => this.allHeroes.set(heroes),
      complete: () => this.loadingService.stop(),
    });
  }

  private executeDelete(id: string): void {
    this.loadingService.start();
    this.heroRepository.delete(id).subscribe({
      next: () => {
        this.allHeroes.update((heroes) =>
          heroes.filter((h) => h.id !== id)
        );
      },
      complete: () => this.loadingService.stop(),
    });
  }
}

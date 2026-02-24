import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable, map, of } from 'rxjs';

import { HeroRepository } from '../../../../domain/repositories/hero.repository';
import { LoadingService } from '../../../../infrastructure/services/loading.service';
import { UppercaseDirective } from '../../../../shared/directives/uppercase.directive';

/** Container component — hero creation and editing with reactive form validations. */
@Component({
  selector: 'app-hero-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    UppercaseDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loadingService.loading()) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }

    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ isEditMode() ? 'Edit Hero' : 'New Hero' }}</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="heroForm" (ngSubmit)="onSave()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Name</mat-label>
            <input
              matInput
              formControlName="name"
              appUppercase
              placeholder="e.g. Superman"
            />
            @if (heroForm.get('name')?.hasError('required')) {
              <mat-error>Name is required</mat-error>
            }
            @if (heroForm.get('name')?.hasError('minlength')) {
              <mat-error>Name must be at least 2 characters</mat-error>
            }
            @if (heroForm.get('name')?.hasError('duplicateName')) {
              <mat-error>A hero with this name already exists</mat-error>
            }
          </mat-form-field>

          <div class="form-actions">
            <button mat-button type="button" (click)="onCancel()">Cancel</button>
            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="heroForm.invalid || heroForm.pending"
            >
              {{ isEditMode() ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    mat-card {
      max-width: 600px;
      margin: 0 auto;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `,
})
export class HeroFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly heroRepository = inject(HeroRepository);
  readonly loadingService = inject(LoadingService);

  readonly isEditMode = signal(false);
  heroId = '';

  readonly heroForm: FormGroup = this.fb.group({
    name: ['', {
      validators: [Validators.required, Validators.minLength(2)],
      asyncValidators: [this.duplicateNameValidator()],
      updateOn: 'blur',
    }],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.heroId = id;
      this.loadHero(id);
    }
  }

  onSave(): void {
    if (this.heroForm.invalid) {
      return;
    }

    const { name } = this.heroForm.getRawValue();

    if (this.isEditMode()) {
      this.updateHero(name);
    } else {
      this.createHero(name);
    }
  }

  onCancel(): void {
    this.router.navigate(['/heroes']);
  }

  private duplicateNameValidator(): (control: AbstractControl) => Observable<ValidationErrors | null> {
    return (control: AbstractControl) => {
      const name = control.value?.trim();
      if (!name) return of(null);

      return this.heroRepository.searchByName(name).pipe(
        map(heroes => {
          const duplicate = heroes.some(
            h => h.name.toLowerCase() === name.toLowerCase() && h.id !== this.heroId
          );
          return duplicate ? { duplicateName: true } : null;
        })
      );
    };
  }

  private loadHero(id: string): void {
    this.loadingService.start();
    this.heroRepository.getById(id).subscribe({
      next: (hero) => {
        if (hero) {
          this.heroForm.patchValue({ name: hero.name });
        } else {
          this.router.navigate(['/heroes']);
        }
      },
      complete: () => this.loadingService.stop(),
    });
  }

  private createHero(name: string): void {
    this.loadingService.start();
    this.heroRepository
      .create({ name })
      .subscribe({
        next: () => this.router.navigate(['/heroes']),
        error: () => this.loadingService.stop(),
        complete: () => this.loadingService.stop(),
      });
  }

  private updateHero(name: string): void {
    this.loadingService.start();
    this.heroRepository
      .update(this.heroId, { name })
      .subscribe({
        next: () => this.router.navigate(['/heroes']),
        error: () => this.loadingService.stop(),
        complete: () => this.loadingService.stop(),
      });
  }
}

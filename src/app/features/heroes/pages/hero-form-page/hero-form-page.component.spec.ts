import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { HeroFormPageComponent } from './hero-form-page.component';
import { HeroRepository } from '../../../../domain/repositories/hero.repository';
import { Hero } from '../../../../domain/models/hero.model';

const EXISTING_HERO: Hero = {
  id: '1',
  name: 'SUPERMAN',
  description: 'Man of Steel',
  createdAt: new Date(),
};

function createMockHeroRepository() {
  return {
    getAll: vi.fn().mockReturnValue(of([])),
    getById: vi.fn().mockReturnValue(of(EXISTING_HERO)),
    searchByName: vi.fn().mockReturnValue(of([])),
    create: vi.fn().mockReturnValue(of(EXISTING_HERO)),
    update: vi.fn().mockReturnValue(of(EXISTING_HERO)),
    delete: vi.fn().mockReturnValue(of(undefined)),
  };
}

// ─── Create Mode ──────────────────────────────────────────────────────────

describe('HeroFormPageComponent (create mode)', () => {
  let component: HeroFormPageComponent;
  let fixture: ComponentFixture<HeroFormPageComponent>;
  let mockRepo: ReturnType<typeof createMockHeroRepository>;
  let router: Router;

  beforeEach(async () => {
    mockRepo = createMockHeroRepository();

    await TestBed.configureTestingModule({
      imports: [HeroFormPageComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: HeroRepository, useValue: mockRepo },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null } },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(HeroFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in create mode', () => {
    expect(component.isEditMode()).toBe(false);
  });

  it('should not load hero from repository', () => {
    expect(mockRepo.getById).not.toHaveBeenCalled();
  });

  it('should have an empty form initially', () => {
    expect(component.heroForm.get('name')?.value).toBe('');
    expect(component.heroForm.get('description')?.value).toBe('');
  });

  // ─── Validations ────────────────────────────────────────────────────────

  it('should require name field', () => {
    component.heroForm.get('name')?.setValue('');
    expect(component.heroForm.get('name')?.hasError('required')).toBe(true);
    expect(component.heroForm.valid).toBe(false);
  });

  it('should require name to be at least 2 characters', () => {
    component.heroForm.get('name')?.setValue('A');
    expect(component.heroForm.get('name')?.hasError('minlength')).toBe(true);
    expect(component.heroForm.valid).toBe(false);
  });

  it('should accept valid name with 2+ characters', () => {
    component.heroForm.get('name')?.setValue('AB');
    expect(component.heroForm.get('name')?.valid).toBe(true);
  });

  it('should not require description', () => {
    component.heroForm.get('name')?.setValue('Superman');
    expect(component.heroForm.valid).toBe(true);
  });

  // ─── Save ───────────────────────────────────────────────────────────────

  it('should not call create if form is invalid', () => {
    component.onSave();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('should call create with form values', () => {
    component.heroForm.setValue({ name: 'Flash', description: 'Fast' });
    component.onSave();

    expect(mockRepo.create).toHaveBeenCalledWith({
      name: 'Flash',
      description: 'Fast',
    });
  });

  it('should call create with undefined description when empty', () => {
    component.heroForm.setValue({ name: 'Flash', description: '' });
    component.onSave();

    expect(mockRepo.create).toHaveBeenCalledWith({
      name: 'Flash',
      description: undefined,
    });
  });

  it('should navigate to /heroes after successful create', () => {
    component.heroForm.setValue({ name: 'Flash', description: '' });
    component.onSave();

    expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
  });

  // ─── Cancel ─────────────────────────────────────────────────────────────

  it('should navigate to /heroes on cancel', () => {
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
  });
});

// ─── Edit Mode ────────────────────────────────────────────────────────────

describe('HeroFormPageComponent (edit mode)', () => {
  let component: HeroFormPageComponent;
  let fixture: ComponentFixture<HeroFormPageComponent>;
  let mockRepo: ReturnType<typeof createMockHeroRepository>;
  let router: Router;

  beforeEach(async () => {
    mockRepo = createMockHeroRepository();

    await TestBed.configureTestingModule({
      imports: [HeroFormPageComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: HeroRepository, useValue: mockRepo },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(HeroFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be in edit mode', () => {
    expect(component.isEditMode()).toBe(true);
  });

  it('should load hero from repository', () => {
    expect(mockRepo.getById).toHaveBeenCalledWith('1');
  });

  it('should populate form with hero data', () => {
    expect(component.heroForm.get('name')?.value).toBe('SUPERMAN');
    expect(component.heroForm.get('description')?.value).toBe('Man of Steel');
  });

  it('should call update (not create) on save', () => {
    component.heroForm.setValue({ name: 'SUPERMAN II', description: 'Updated' });
    component.onSave();

    expect(mockRepo.update).toHaveBeenCalledWith('1', {
      name: 'SUPERMAN II',
      description: 'Updated',
    });
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('should navigate to /heroes after successful update', () => {
    component.heroForm.setValue({ name: 'SUPERMAN II', description: 'Updated' });
    component.onSave();

    expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { HeroListPageComponent } from './hero-list-page.component';
import { HeroRepository } from '../../../../domain/repositories/hero.repository';
import { Hero } from '../../../../domain/models/hero.model';

const MOCK_HEROES: Hero[] = [
  { id: '1', name: 'Superman' },
  { id: '2', name: 'Batman' },
  { id: '3', name: 'Spiderman' },
  { id: '4', name: 'Wonder Woman' },
  { id: '5', name: 'Flash' },
  { id: '6', name: 'Aquaman' },
];

function createMockHeroRepository() {
  return {
    getAll: vi.fn().mockReturnValue(of(MOCK_HEROES)),
    getById: vi.fn().mockReturnValue(of(undefined)),
    searchByName: vi.fn().mockReturnValue(of([])),
    create: vi.fn().mockReturnValue(of(MOCK_HEROES[0])),
    update: vi.fn().mockReturnValue(of(MOCK_HEROES[0])),
    delete: vi.fn().mockReturnValue(of(undefined)),
  };
}

describe('HeroListPageComponent', () => {
  let component: HeroListPageComponent;
  let fixture: ComponentFixture<HeroListPageComponent>;
  let mockRepo: ReturnType<typeof createMockHeroRepository>;
  let router: Router;
  let mockDialog: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockRepo = createMockHeroRepository();
    mockDialog = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [HeroListPageComponent],
      providers: [
        provideRouter([]),
        { provide: HeroRepository, useValue: mockRepo },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(HeroListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Initialization ───────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load heroes on init', () => {
    expect(mockRepo.getAll).toHaveBeenCalledTimes(1);
  });

  it('should display all heroes initially', () => {
    expect(component.filteredHeroes().length).toBe(6);
  });

  // ─── Search / Filtering ───────────────────────────────────────────────────

  it('should filter heroes by search term', () => {
    component.onSearch('man');
    expect(component.filteredHeroes().length).toBe(5); // Superman, Batman, Spiderman, Wonder Woman, Aquaman
  });

  it('should reset page index when searching', () => {
    component.onSearch('spider');
    expect(component.filteredHeroes().length).toBe(1);
  });

  it('should show all heroes when search is cleared', () => {
    component.onSearch('spider');
    component.onSearch('');
    expect(component.filteredHeroes().length).toBe(6);
  });

  // ─── Pagination ───────────────────────────────────────────────────────────

  it('should show first page of heroes (default pageSize 5)', () => {
    expect(component.paginatedHeroes().length).toBe(5);
  });

  it('should show remaining heroes on second page', () => {
    component.onPageChange({ pageIndex: 1, pageSize: 5, length: 6 });
    expect(component.paginatedHeroes().length).toBe(1);
  });

  it('should update page size', () => {
    component.onPageChange({ pageIndex: 0, pageSize: 10, length: 6 });
    expect(component.paginatedHeroes().length).toBe(6);
  });

  // ─── Navigation ───────────────────────────────────────────────────────────

  it('should navigate to /heroes/new when add is clicked', () => {
    component.onAdd();
    expect(router.navigate).toHaveBeenCalledWith(['/heroes', 'new']);
  });

  it('should navigate to /heroes/:id/edit when edit is triggered', () => {
    component.onEdit(MOCK_HEROES[0]);
    expect(router.navigate).toHaveBeenCalledWith(['/heroes', '1', 'edit']);
  });

  // ─── Delete with Confirmation ─────────────────────────────────────────────

  it('should open confirm dialog when delete is triggered', () => {
    mockDialog.open.mockReturnValue({
      afterClosed: () => of(false),
    });

    component.onDelete(MOCK_HEROES[0]);

    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should call repository delete when dialog is confirmed', () => {
    mockDialog.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    component.onDelete(MOCK_HEROES[0]);

    expect(mockRepo.delete).toHaveBeenCalledWith('1');
  });

  it('should NOT call repository delete when dialog is cancelled', () => {
    mockDialog.open.mockReturnValue({
      afterClosed: () => of(false),
    });

    component.onDelete(MOCK_HEROES[0]);

    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it('should remove hero from list after successful delete', () => {
    mockDialog.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    component.onDelete(MOCK_HEROES[0]);

    expect(component.filteredHeroes().length).toBe(5);
    expect(
      component.filteredHeroes().find((h) => h.id === '1')
    ).toBeUndefined();
  });
});

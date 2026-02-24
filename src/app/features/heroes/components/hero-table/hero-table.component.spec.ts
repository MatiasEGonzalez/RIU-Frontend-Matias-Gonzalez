import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { HeroTableComponent } from './hero-table.component';
import { Hero } from '../../../../domain/models/hero.model';

const MOCK_HEROES: Hero[] = [
  { id: '1', name: 'Superman' },
  { id: '2', name: 'Batman' },
  { id: '3', name: 'Wonder Woman' },
];

describe('HeroTableComponent', () => {
  let fixture: ComponentFixture<HeroTableComponent>;
  let component: HeroTableComponent;
  let componentRef: ComponentRef<HeroTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroTableComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  // ─── Empty State ──────────────────────────────────────────────────────────

  describe('when heroes list is empty', () => {
    beforeEach(() => {
      componentRef.setInput('heroes', []);
      fixture.detectChanges();
    });

    it('should display "No heroes found" message', () => {
      const message = fixture.nativeElement.querySelector('.no-results');
      expect(message).toBeTruthy();
      expect(message.textContent).toContain('No heroes found');
    });

    it('should not render the table', () => {
      const table = fixture.nativeElement.querySelector('table');
      expect(table).toBeNull();
    });
  });

  // ─── With Heroes ─────────────────────────────────────────────────────────

  describe('when heroes are provided', () => {
    beforeEach(() => {
      componentRef.setInput('heroes', MOCK_HEROES);
      fixture.detectChanges();
    });

    it('should render the table', () => {
      const table = fixture.nativeElement.querySelector('table');
      expect(table).toBeTruthy();
    });

    it('should render one row per hero', () => {
      const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
      expect(rows.length).toBe(3);
    });

    it('should display hero names', () => {
      const cells = fixture.nativeElement.querySelectorAll(
        'td.mat-column-name'
      );
      expect(cells[0].textContent?.trim()).toBe('Superman');
      expect(cells[1].textContent?.trim()).toBe('Batman');
      expect(cells[2].textContent?.trim()).toBe('Wonder Woman');
    });

    it('should display hero IDs', () => {
      const cells = fixture.nativeElement.querySelectorAll(
        'td.mat-column-id'
      );
      expect(cells[0].textContent?.trim()).toBe('1');
      expect(cells[1].textContent?.trim()).toBe('2');
      expect(cells[2].textContent?.trim()).toBe('3');
    });

    it('should have edit and delete buttons for each row', () => {
      const actionCells = fixture.nativeElement.querySelectorAll(
        'td.mat-column-actions'
      );
      actionCells.forEach((cell: HTMLElement) => {
        const buttons = cell.querySelectorAll('button');
        expect(buttons.length).toBe(2);
      });
    });

    it('should not display "No heroes found" message', () => {
      const message = fixture.nativeElement.querySelector('.no-results');
      expect(message).toBeNull();
    });
  });

  // ─── Output Events ───────────────────────────────────────────────────────

  describe('output events', () => {
    beforeEach(() => {
      componentRef.setInput('heroes', MOCK_HEROES);
      fixture.detectChanges();
    });

    it('should emit edit event when edit button is clicked', () => {
      let emittedHero: Hero | undefined;
      component.edit.subscribe((hero: Hero) => {
        emittedHero = hero;
      });

      const editButton = fixture.nativeElement.querySelector(
        'td.mat-column-actions button:first-child'
      );
      editButton.click();

      expect(emittedHero).toEqual(MOCK_HEROES[0]);
    });

    it('should emit delete event when delete button is clicked', () => {
      let emittedHero: Hero | undefined;
      component.delete.subscribe((hero: Hero) => {
        emittedHero = hero;
      });

      const deleteButton = fixture.nativeElement.querySelector(
        'td.mat-column-actions button:last-child'
      );
      deleteButton.click();

      expect(emittedHero).toEqual(MOCK_HEROES[0]);
    });
  });
});

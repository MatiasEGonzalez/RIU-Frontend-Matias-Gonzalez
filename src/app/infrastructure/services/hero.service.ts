import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HeroRepository } from '../../domain/repositories/hero.repository';
import { Hero, CreateHeroDto, UpdateHeroDto } from '../../domain/models/hero.model';

/**
 * In-memory HeroRepository implementation backed by Angular Signals.
 * Simulates async latency with RxJS delay for realistic component behavior.
 */
@Injectable({
  providedIn: 'root'
})
export class HeroService extends HeroRepository {

  private readonly INITIAL_HEROES: readonly Hero[] = [
    { id: '1', name: 'Superman' },
    { id: '2', name: 'Spiderman' },
    { id: '3', name: 'Batman' },
  ];

  private readonly heroesSignal = signal<Hero[]>([...this.INITIAL_HEROES]);
  readonly heroes = this.heroesSignal.asReadonly();
  private readonly ASYNC_DELAY = 500;

  getAll(): Observable<Hero[]> {
    return of(this.heroesSignal()).pipe(
      delay(this.ASYNC_DELAY)
    );
  }

  getById(id: string): Observable<Hero | undefined> {
    const hero = this.heroesSignal().find(h => h.id === id);
    return of(hero).pipe(
      delay(this.ASYNC_DELAY)
    );
  }

  searchByName(term: string): Observable<Hero[]> {
    const normalizedTerm = term.toLowerCase().trim();
    
    if (!normalizedTerm) {
      return this.getAll();
    }

    const filtered = this.heroesSignal().filter(hero =>
      hero.name.toLowerCase().includes(normalizedTerm)
    );

    return of(filtered).pipe(
      delay(this.ASYNC_DELAY)
    );
  }

  create(dto: CreateHeroDto): Observable<Hero> {
    const normalized = dto.name.trim().toLowerCase();
    const duplicate = this.heroesSignal().some(
      h => h.name.toLowerCase() === normalized
    );
    if (duplicate) {
      return throwError(() => new Error(`Hero "${dto.name}" already exists`));
    }

    const newHero: Hero = {
      id: this.nextId(),
      name: dto.name.trim(),
    };

    this.heroesSignal.update(heroes => [...heroes, newHero]);

    return of(newHero).pipe(
      delay(this.ASYNC_DELAY)
    );
  }

  update(id: string, dto: UpdateHeroDto): Observable<Hero> {
    const currentHeroes = this.heroesSignal();
    const index = currentHeroes.findIndex(h => h.id === id);

    if (index === -1) {
      return throwError(() => new Error(`Hero with id ${id} not found`));
    }

    if (dto.name) {
      const normalized = dto.name.trim().toLowerCase();
      const duplicate = currentHeroes.some(
        h => h.id !== id && h.name.toLowerCase() === normalized
      );
      if (duplicate) {
        return throwError(() => new Error(`Hero "${dto.name}" already exists`));
      }
    }

    const updatedHero: Hero = {
      ...currentHeroes[index],
      ...dto
    };

    const updatedHeroes = [
      ...currentHeroes.slice(0, index),
      updatedHero,
      ...currentHeroes.slice(index + 1)
    ];

    this.heroesSignal.set(updatedHeroes);

    return of(updatedHero).pipe(
      delay(this.ASYNC_DELAY)
    );
  }

  delete(id: string): Observable<void> {
    const currentHeroes = this.heroesSignal();
    const exists = currentHeroes.some(h => h.id === id);

    if (!exists) {
      return throwError(() => new Error(`Hero with id ${id} not found`));
    }

    this.heroesSignal.update(heroes => heroes.filter(h => h.id !== id));

    return of(void 0).pipe(
      delay(this.ASYNC_DELAY)
    );
  }

  private nextId(): string {
    const maxId = this.heroesSignal().reduce((max, h) => {
      const num = parseInt(h.id, 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return String(maxId + 1);
  }

  /** Resets to seed data for test isolation. */
  resetToInitialState(): void {
    this.heroesSignal.set([...this.INITIAL_HEROES]);
  }
}
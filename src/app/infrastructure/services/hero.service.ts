import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HeroRepository } from '../../domain/repositories/hero.repository';
import { Hero, CreateHeroDto, UpdateHeroDto } from '../../domain/models/hero.model';

/**
 * HeroService - Concrete implementation of HeroRepository
 * 
 * Manages hero state using Angular Signals
 * Simulates async operations with RxJS delay
 * 
 * Storage: In-memory (signal-based)
 * This service is the single source of truth for hero data
 */
@Injectable({
  providedIn: 'root'
})
export class HeroService extends HeroRepository {
  
  /**
   * Private signal holding all heroes
   * Writable only from within this service
   */
  private readonly heroesSignal = signal<Hero[]>([
    // Mock data for development
    {
      id: '1',
      name: 'Superman',
      description: 'Man of Steel',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Spiderman',
      description: 'Your friendly neighborhood Spider-Man',
      createdAt: new Date('2024-01-02')
    },
    {
      id: '3',
      name: 'Batman',
      description: 'The Dark Knight',
      createdAt: new Date('2024-01-03')
    }
  ]);

  /**
   * Public readonly signal for consuming components
   * Exposes heroes in a reactive way
   */
  readonly heroes = this.heroesSignal.asReadonly();

  /**
   * Simulated delay for async operations (in ms)
   */
  private readonly ASYNC_DELAY = 500;

  /**
   * Get all heroes
   * Simulates async call with delay
   */
  getAll(): Observable<Hero[]> {
    return of(this.heroesSignal()).pipe(
      delay(this.ASYNC_DELAY)
    );
  }

  /**
   * Get hero by ID
   * @returns Hero if found, undefined otherwise
   */
  getById(id: string): Observable<Hero | undefined> {
    const hero = this.heroesSignal().find(h => h.id === id);
    return of(hero).pipe(
      delay(this.ASYNC_DELAY)
    );
  }

  /**
   * Search heroes by name (case-insensitive partial match)
   * Example: "man" matches "Superman", "Spiderman", "Manolito"
   */
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

  /**
   * Create a new hero
   * Generates ID and createdAt automatically
   */
  create(dto: CreateHeroDto): Observable<Hero> {
    const newHero: Hero = {
      id: this.generateId(),
      name: dto.name,
      description: dto.description,
      createdAt: new Date()
    };

    // Update signal immutably
    this.heroesSignal.update(heroes => [...heroes, newHero]);

    return of(newHero).pipe(
      delay(this.ASYNC_DELAY)
    );
  }

  /**
   * Update an existing hero (partial update)
   * @returns Updated hero or throws error if not found
   */
  update(id: string, dto: UpdateHeroDto): Observable<Hero> {
    const currentHeroes = this.heroesSignal();
    const index = currentHeroes.findIndex(h => h.id === id);

    if (index === -1) {
      return throwError(() => new Error(`Hero with id ${id} not found`));
    }

    const updatedHero: Hero = {
      ...currentHeroes[index],
      ...dto
    };

    // Update signal immutably
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

  /**
   * Delete a hero
   * @returns void or throws error if not found
   */
  delete(id: string): Observable<void> {
    const currentHeroes = this.heroesSignal();
    const exists = currentHeroes.some(h => h.id === id);

    if (!exists) {
      return throwError(() => new Error(`Hero with id ${id} not found`));
    }

    // Update signal immutably
    this.heroesSignal.update(heroes => heroes.filter(h => h.id !== id));

    return of(void 0).pipe(
      delay(this.ASYNC_DELAY)
    );
  }

  /**
   * Generate unique ID for new heroes
   * Simple implementation: timestamp-based
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Reset service to initial state
   * Used for testing purposes to ensure test isolation
   */
  resetToInitialState(): void {
    this.heroesSignal.set([
      {
        id: '1',
        name: 'Superman',
        description: 'Man of Steel',
        createdAt: new Date('2024-01-01')
      },
      {
        id: '2',
        name: 'Spiderman',
        description: 'Your friendly neighborhood Spider-Man',
        createdAt: new Date('2024-01-02')
      },
      {
        id: '3',
        name: 'Batman',
        description: 'The Dark Knight',
        createdAt: new Date('2024-01-03')
      }
    ]);
  }
}
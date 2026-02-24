import { Observable } from 'rxjs';
import { Hero, CreateHeroDto, UpdateHeroDto } from '../models/hero.model';

/** Abstract contract for hero data access (DIP-compliant). */
export abstract class HeroRepository {
  abstract getAll(): Observable<Hero[]>;
  abstract getById(id: string): Observable<Hero | undefined>;
  abstract searchByName(term: string): Observable<Hero[]>;
  abstract create(dto: CreateHeroDto): Observable<Hero>;
  abstract update(id: string, dto: UpdateHeroDto): Observable<Hero>;
  abstract delete(id: string): Observable<void>;
}
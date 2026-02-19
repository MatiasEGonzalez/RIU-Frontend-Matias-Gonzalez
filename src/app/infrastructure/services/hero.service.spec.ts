import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { HeroService } from './hero.service';
import { CreateHeroDto, UpdateHeroDto } from '../../domain/models/hero.model';

describe('HeroService', () => {
  let service: HeroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeroService);
    // Reset service state before each test to ensure isolation
    service.resetToInitialState();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all heroes', async () => {
      const heroes = await firstValueFrom(service.getAll());
      expect(heroes.length).toBe(3);
      expect(heroes[0].name).toBe('Superman');
      expect(heroes[1].name).toBe('Spiderman');
      expect(heroes[2].name).toBe('Batman');
    });

    it('should return heroes with all required fields', async () => {
      const heroes = await firstValueFrom(service.getAll());
      const hero = heroes[0];
      expect(hero.id).toBeDefined();
      expect(hero.name).toBeDefined();
      expect(hero.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('getById', () => {
    it('should return hero when id exists', async () => {
      const hero = await firstValueFrom(service.getById('1'));
      expect(hero).toBeDefined();
      expect(hero?.id).toBe('1');
      expect(hero?.name).toBe('Superman');
    });

    it('should return undefined when id does not exist', async () => {
      const hero = await firstValueFrom(service.getById('non-existent'));
      expect(hero).toBeUndefined();
    });
  });

  describe('searchByName', () => {
    it('should find heroes containing "man" (case-insensitive)', async () => {
      const heroes = await firstValueFrom(service.searchByName('man'));
      expect(heroes.length).toBe(3); // Superman, Spiderman, Batman
      expect(heroes.every(h => h.name.toLowerCase().includes('man'))).toBe(true);
    });

    it('should find heroes with exact match', async () => {
      const heroes = await firstValueFrom(service.searchByName('Superman'));
      expect(heroes.length).toBe(1);
      expect(heroes[0].name).toBe('Superman');
    });

    it('should return empty array when no match', async () => {
      const heroes = await firstValueFrom(service.searchByName('Ironman'));
      expect(heroes.length).toBe(0);
    });

    it('should return all heroes when term is empty', async () => {
      const heroes = await firstValueFrom(service.searchByName(''));
      expect(heroes.length).toBe(3);
    });

    it('should trim whitespace from search term', async () => {
      const heroes = await firstValueFrom(service.searchByName('  man  '));
      expect(heroes.length).toBe(3);
    });

    it('should be case-insensitive', async () => {
      const heroes = await firstValueFrom(service.searchByName('SUPER'));
      expect(heroes.length).toBe(1);
      expect(heroes[0].name).toBe('Superman');
    });
  });

  describe('create', () => {
    it('should create a new hero with generated id', async () => {
      const dto: CreateHeroDto = {
        name: 'Wonder Woman',
        description: 'Amazon Princess'
      };

      const hero = await firstValueFrom(service.create(dto));
      expect(hero.id).toBeDefined();
      expect(hero.name).toBe('Wonder Woman');
      expect(hero.description).toBe('Amazon Princess');
      expect(hero.createdAt).toBeInstanceOf(Date);
    });

    it('should add hero to the signal state', async () => {
      const dto: CreateHeroDto = {
        name: 'Flash',
        description: 'The Fastest Man Alive'
      };

      await firstValueFrom(service.create(dto));
      const heroes = await firstValueFrom(service.getAll());
      expect(heroes.length).toBe(4); // 3 initial + 1 new
      const flash = heroes.find(h => h.name === 'Flash');
      expect(flash).toBeDefined();
    });

    it('should create hero without description', async () => {
      const dto: CreateHeroDto = {
        name: 'Aquaman'
      };

      const hero = await firstValueFrom(service.create(dto));
      expect(hero.name).toBe('Aquaman');
      expect(hero.description).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update hero name', async () => {
      const dto: UpdateHeroDto = {
        name: 'Clark Kent'
      };

      const hero = await firstValueFrom(service.update('1', dto));
      expect(hero.name).toBe('Clark Kent');
      expect(hero.description).toBe('Man of Steel'); // unchanged
    });

    it('should update hero description', async () => {
      const dto: UpdateHeroDto = {
        description: 'Updated description'
      };

      const hero = await firstValueFrom(service.update('1', dto));
      expect(hero.name).toBe('Superman'); // unchanged
      expect(hero.description).toBe('Updated description');
    });

    it('should update multiple fields', async () => {
      const dto: UpdateHeroDto = {
        name: 'Peter Parker',
        description: 'Teenager with spider powers'
      };

      const hero = await firstValueFrom(service.update('2', dto));
      expect(hero.name).toBe('Peter Parker');
      expect(hero.description).toBe('Teenager with spider powers');
    });

    it('should throw error when hero not found', async () => {
      const dto: UpdateHeroDto = { name: 'Test' };
      
      try {
        await firstValueFrom(service.update('non-existent', dto));
        throw new Error('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('not found');
      }
    });

    it('should persist update in state', async () => {
      const dto: UpdateHeroDto = { name: 'Updated Name' };

      await firstValueFrom(service.update('1', dto));
      const hero = await firstValueFrom(service.getById('1'));
      expect(hero?.name).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('should delete existing hero', async () => {
      await firstValueFrom(service.delete('1'));
      const heroes = await firstValueFrom(service.getAll());
      expect(heroes.length).toBe(2);
      expect(heroes.find(h => h.id === '1')).toBeUndefined();
    });

    it('should throw error when hero not found', async () => {
      try {
        await firstValueFrom(service.delete('non-existent'));
        throw new Error('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('not found');
      }
    });

    it('should not affect other heroes', async () => {
      await firstValueFrom(service.delete('2'));
      const heroes = await firstValueFrom(service.getAll());
      expect(heroes.length).toBe(2);
      expect(heroes.find(h => h.id === '1')).toBeDefined();
      expect(heroes.find(h => h.id === '3')).toBeDefined();
    });
  });

  describe('signal reactivity', () => {
    it('should expose readonly heroes signal', () => {
      const heroes = service.heroes();
      expect(heroes.length).toBe(3);
    });

    it('should update signal when creating hero', async () => {
      const initialCount = service.heroes().length;
      const dto: CreateHeroDto = { name: 'New Hero' };

      await firstValueFrom(service.create(dto));
      expect(service.heroes().length).toBe(initialCount + 1);
    });

    it('should update signal when deleting hero', async () => {
      const initialCount = service.heroes().length;

      await firstValueFrom(service.delete('1'));
      expect(service.heroes().length).toBe(initialCount - 1);
    });
  });
});
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { HeroService } from './hero.service';
import { CreateHeroDto, UpdateHeroDto } from '../../domain/models/hero.model';

describe('HeroService', () => {
  let service: HeroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeroService);
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
      const dto: CreateHeroDto = { name: 'Wonder Woman' };

      const hero = await firstValueFrom(service.create(dto));
      expect(hero.id).toBeDefined();
      expect(hero.name).toBe('Wonder Woman');
    });

    it('should generate sequential numeric ids', async () => {
      const hero = await firstValueFrom(service.create({ name: 'Flash' }));
      expect(hero.id).toBe('4');

      const hero2 = await firstValueFrom(service.create({ name: 'Aquaman' }));
      expect(hero2.id).toBe('5');
    });

    it('should add hero to the signal state', async () => {
      await firstValueFrom(service.create({ name: 'Flash' }));
      const heroes = await firstValueFrom(service.getAll());
      expect(heroes.length).toBe(4);
      expect(heroes.find(h => h.name === 'Flash')).toBeDefined();
    });

    it('should reject duplicate hero names (case-insensitive)', async () => {
      try {
        await firstValueFrom(service.create({ name: 'superman' }));
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('already exists');
      }
    });

    it('should reject duplicate hero names with different casing', async () => {
      try {
        await firstValueFrom(service.create({ name: 'BATMAN' }));
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('already exists');
      }
    });

    it('should trim name before checking duplicates', async () => {
      try {
        await firstValueFrom(service.create({ name: '  Superman  ' }));
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('already exists');
      }
    });
  });

  describe('update', () => {
    it('should update hero name', async () => {
      const dto: UpdateHeroDto = { name: 'Clark Kent' };

      const hero = await firstValueFrom(service.update('1', dto));
      expect(hero.name).toBe('Clark Kent');
    });

    it('should persist update in state', async () => {
      await firstValueFrom(service.update('1', { name: 'Updated Name' }));
      const hero = await firstValueFrom(service.getById('1'));
      expect(hero?.name).toBe('Updated Name');
    });

    it('should throw error when hero not found', async () => {
      try {
        await firstValueFrom(service.update('non-existent', { name: 'Test' }));
        throw new Error('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('not found');
      }
    });

    it('should reject update if name conflicts with another hero', async () => {
      try {
        await firstValueFrom(service.update('1', { name: 'Batman' }));
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('already exists');
      }
    });

    it('should allow update keeping the same name on the same hero', async () => {
      const hero = await firstValueFrom(service.update('1', { name: 'Superman' }));
      expect(hero.name).toBe('Superman');
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
      await firstValueFrom(service.create({ name: 'New Hero' }));
      expect(service.heroes().length).toBe(initialCount + 1);
    });

    it('should update signal when deleting hero', async () => {
      const initialCount = service.heroes().length;
      await firstValueFrom(service.delete('1'));
      expect(service.heroes().length).toBe(initialCount - 1);
    });
  });
});
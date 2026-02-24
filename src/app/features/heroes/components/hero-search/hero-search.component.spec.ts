import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroSearchComponent } from './hero-search.component';

describe('HeroSearchComponent', () => {
  let component: HeroSearchComponent;
  let fixture: ComponentFixture<HeroSearchComponent>;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSearchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    input = fixture.nativeElement.querySelector('input');
  });

  // ─── Rendering ────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a search input', () => {
    expect(input).toBeTruthy();
  });

  it('should have a search icon', () => {
    const icon = fixture.nativeElement.querySelector('mat-icon');
    expect(icon.textContent?.trim()).toBe('search');
  });

  // ─── Output Emission ─────────────────────────────────────────────────────

  it('should emit searchChange when user types', () => {
    let emittedValue = '';
    component.searchChange.subscribe((value: string) => {
      emittedValue = value;
    });

    input.value = 'spider';
    input.dispatchEvent(new Event('input'));

    expect(emittedValue).toBe('spider');
  });

  it('should emit empty string when input is cleared', () => {
    let emittedValue = 'initial';
    component.searchChange.subscribe((value: string) => {
      emittedValue = value;
    });

    input.value = '';
    input.dispatchEvent(new Event('input'));

    expect(emittedValue).toBe('');
  });

  it('should emit on every keystroke', () => {
    const emitted: string[] = [];
    component.searchChange.subscribe((value: string) => {
      emitted.push(value);
    });

    input.value = 'b';
    input.dispatchEvent(new Event('input'));
    input.value = 'ba';
    input.dispatchEvent(new Event('input'));
    input.value = 'bat';
    input.dispatchEvent(new Event('input'));

    expect(emitted).toEqual(['b', 'ba', 'bat']);
  });
});

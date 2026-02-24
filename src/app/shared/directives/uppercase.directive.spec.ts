import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { UppercaseDirective } from './uppercase.directive';

@Component({
  imports: [ReactiveFormsModule, UppercaseDirective],
  template: `
    <form [formGroup]="form">
      <input formControlName="name" appUppercase />
    </form>
  `,
})
class TestHostWithFormComponent {
  form = new FormGroup({
    name: new FormControl(''),
  });
}

@Component({
  imports: [UppercaseDirective],
  template: `<input appUppercase />`,
})
class TestHostWithoutFormComponent {}

describe('UppercaseDirective', () => {

  describe('with Reactive Forms', () => {
    let fixture: ComponentFixture<TestHostWithFormComponent>;
    let input: HTMLInputElement;
    let component: TestHostWithFormComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostWithFormComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(TestHostWithFormComponent);
      component = fixture.componentInstance;
      input = fixture.nativeElement.querySelector('input');
      fixture.detectChanges();
    });

    it('should transform lowercase text to uppercase in the DOM', () => {
      simulateInput(input, 'batman');
      fixture.detectChanges();

      expect(input.value).toBe('BATMAN');
    });

    it('should sync the uppercase value with the FormControl', () => {
      simulateInput(input, 'superman');
      fixture.detectChanges();

      expect(component.form.get('name')?.value).toBe('SUPERMAN');
    });

    it('should handle mixed case text', () => {
      simulateInput(input, 'SpIdErMaN');
      fixture.detectChanges();

      expect(input.value).toBe('SPIDERMAN');
      expect(component.form.get('name')?.value).toBe('SPIDERMAN');
    });

    it('should handle already uppercase text without changes', () => {
      simulateInput(input, 'WOLVERINE');
      fixture.detectChanges();

      expect(input.value).toBe('WOLVERINE');
      expect(component.form.get('name')?.value).toBe('WOLVERINE');
    });

    it('should handle an empty string', () => {
      simulateInput(input, '');
      fixture.detectChanges();

      expect(input.value).toBe('');
      expect(component.form.get('name')?.value).toBe('');
    });

    it('should handle text with numbers and special characters', () => {
      simulateInput(input, 'héroe-123!');
      fixture.detectChanges();

      expect(input.value).toBe('HÉROE-123!');
      expect(component.form.get('name')?.value).toBe('HÉROE-123!');
    });

    it('should handle text with spaces', () => {
      simulateInput(input, 'iron man');
      fixture.detectChanges();

      expect(input.value).toBe('IRON MAN');
      expect(component.form.get('name')?.value).toBe('IRON MAN');
    });

    it('should not emit an extra valueChanges event when transforming', () => {
      let emissionCount = 0;
      component.form.get('name')?.valueChanges.subscribe(() => emissionCount++);

      simulateInput(input, 'flash');
      fixture.detectChanges();

      // Only 1 emission (native), not 2 — setValue uses emitEvent: false
      expect(emissionCount).toBe(1);
    });
  });

  describe('without Reactive Forms', () => {
    let fixture: ComponentFixture<TestHostWithoutFormComponent>;
    let input: HTMLInputElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostWithoutFormComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(TestHostWithoutFormComponent);
      input = fixture.nativeElement.querySelector('input');
      fixture.detectChanges();
    });

    it('should transform text to uppercase in the DOM without a FormControl', () => {
      simulateInput(input, 'aquaman');
      fixture.detectChanges();

      expect(input.value).toBe('AQUAMAN');
    });

    it('should not throw an error when NgControl is absent', () => {
      expect(() => {
        simulateInput(input, 'test');
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
});

function simulateInput(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

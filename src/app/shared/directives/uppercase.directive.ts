import { Directive, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Attribute directive that transforms an input's text to uppercase
 * in real time, synchronizing both the visual value (DOM) and the
 * Reactive Forms model (NgControl).
 *
 * @example
 * ```html
 * <!-- With Reactive Forms -->
 * <input matInput formControlName="name" appUppercase />
 *
 * <!-- Without Reactive Forms (visual transform only) -->
 * <input matInput appUppercase />
 * ```
 *
 * Design decisions:
 * - Uses `host` instead of `@HostListener` (modern Angular 21 pattern)
 * - Injects `NgControl` with `optional: true, self: true` for compatibility
 *   with and without Reactive Forms
 * - Uses `emitEvent: false` in `setValue` to prevent infinite loops
 */
@Directive({
  selector: 'input[appUppercase]',
  host: {
    '(input)': 'onInput($event)',
  },
})
export class UppercaseDirective {

  private readonly el = inject(ElementRef<HTMLInputElement>);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  /**
   * Transforms the input value to uppercase on each input event.
   * Updates both the DOM and the Reactive Forms model (if present).
   */
  protected onInput(_event: Event): void {
    const input = this.el.nativeElement;
    const uppercased = input.value.toUpperCase();

    // Update the visual value in the DOM
    input.value = uppercased;

    // Sync with the FormControl if it exists (Reactive Forms)
    // emitEvent: false prevents setValue from re-triggering valueChanges → infinite loop
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(uppercased, { emitEvent: false });
    }
  }
}

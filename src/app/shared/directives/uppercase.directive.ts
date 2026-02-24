import { Directive, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Transforms input text to uppercase in real time.
 * Syncs both the DOM value and the Reactive Forms model when NgControl is present.
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
   */
  protected onInput(_event: Event): void {
    const input = this.el.nativeElement;
    const uppercased = input.value.toUpperCase();

    input.value = uppercased;

    // emitEvent: false prevents re-triggering valueChanges
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(uppercased, { emitEvent: false });
    }
  }
}

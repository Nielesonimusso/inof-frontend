import { Directive, ElementRef, HostListener, Inject, Optional, Renderer2 } from '@angular/core';
import { NG_VALUE_ACCESSOR, DefaultValueAccessor, COMPOSITION_BUFFER_MODE } from '@angular/forms';
import { trimString } from '../utilities/trim';

/**
 * This trims the input value after the input loses focus or the form is submitted.
 * To use, add it as an attribute in the html to an input element: `<input ... appTrim />`.
 */
@Directive({
  selector: 'input[appTrim]',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: TrimDirective, multi: true }]
})
export class TrimDirective extends DefaultValueAccessor {
  constructor(
    renderer: Renderer2,
    elementRef: ElementRef,
    @Optional() @Inject(COMPOSITION_BUFFER_MODE) compositionMode: boolean) {
    super(renderer, elementRef, compositionMode);
  }

  @HostListener('change', ['$event'])
  inputChanged(e) {
    // Update the model (code) side only.
    this.onChange(trimString(e.target.value));
  }
}

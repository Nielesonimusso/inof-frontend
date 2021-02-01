import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, Validators } from '@angular/forms';

/**
 * Directive to validate the HTML5 `min` attribute, use as you would use the `min` attribute.
 */
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[min]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MinDirective, multi: true }]
})
export class MinDirective implements Validator {
  @Input() min: number;

  validate(control: AbstractControl): { [key: string]: any } {
    return Validators.min(this.min)(control);
  }
}

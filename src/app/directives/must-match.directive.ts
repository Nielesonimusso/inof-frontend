/**
 * Based on https://jasonwatmore.com/post/2018/11/10/angular-7-template-driven-forms-validation-example
 */
import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, ValidationErrors, FormGroup } from '@angular/forms';

/**
 * Directive to check if two fields match, this attribute needs to be on the form tag.
 * Usage: `<form ... [appMustMatch]="['input-field-name-1', 'input-field-name-2']">`
 */
@Directive({
  selector: '[appMustMatch]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MustMatchDirective, multi: true }]
})
export class MustMatchDirective implements Validator {
  @Input()
  appMustMatch: string[] = [];

  validate(formGroup: FormGroup): ValidationErrors {
    return mustMatch(this.appMustMatch[0], this.appMustMatch[1])(formGroup);
  }
}

function mustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    // return null if controls haven't initialised yet
    if (!control || !matchingControl) {
      return null;
    }

    // return null if another validator has already found an error on the matchingControl
    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      return null;
    }

    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  };
}

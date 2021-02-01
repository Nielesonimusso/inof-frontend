import { ErrorStateMatcher } from '@angular/material/core';
import { FormGroupDirective, NgForm, FormControl } from '@angular/forms';

/**
 * ErrorStateMatcher which sets error state immediately instead of on change.
 */
export class ImmediateErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid);
  }
}

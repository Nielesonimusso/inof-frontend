import { ImmediateErrorStateMatcher } from './immediateErrorStateMatcher';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, Validators } from '@angular/forms';

describe('ImmediateErrorStateMatcher', () => {
  it('isErrorState() should return true iff invalid', () => {
    const matcher: ErrorStateMatcher = new ImmediateErrorStateMatcher();
    const controlRequired: FormControl = new FormControl('', Validators.required);
    const controlNotRequired: FormControl = new FormControl('', []);
    const errorState = matcher.isErrorState(controlRequired, null);
    const validState = matcher.isErrorState(controlNotRequired, null);
    expect(errorState).toBeTrue();
    expect(validState).toBeFalse();
  });
});

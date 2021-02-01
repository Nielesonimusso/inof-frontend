import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

/**
 * Adds errors to the form fields corresponding to the names in the error object
 * Expects form field name attribute to equal the name of the property in the model.
 * @param form Form to try and set errors in
 * @param response Server error response
 */
export function addFormServerErrors(form: FormGroup, response: HttpErrorResponse) {
  if (response.status !== 400) {
    return;
  }

  for (const prop in response.error) {
    if (Object.prototype.hasOwnProperty.call(response.error, prop) && form.controls[prop]) {
      let msg = response.error[prop];
      if (Array.isArray(response.error[prop])) {
        msg = response.error[prop][0];
      }
      form.controls[prop].setErrors({ server: msg });
    }
  }
}

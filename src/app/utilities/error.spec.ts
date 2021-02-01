import { FormControl, FormGroup } from '@angular/forms';
import { addFormServerErrors } from './error';
import { HttpErrorResponse } from '@angular/common/http';


describe('addFormServerErrors', () => {
  it('should add an error to the form field based on name', () => {
    // Arrange
    const form = new FormGroup({
      testField: new FormControl()
    });

    const response = new HttpErrorResponse({
      error: { testField: ['Field is invalid.'] },
      status: 400,
    });

    // Act
    addFormServerErrors(form, response);

    // Assert
    expect(form.controls.testField.errors).toEqual({ server: 'Field is invalid.' });
  });

  it('should ignore non validation error responses', () => {
    // Arrange
    const form = new FormGroup({
      testField: new FormControl()
    });

    const response = new HttpErrorResponse({
      error: { testField: ['Field is invalid.'] },
      status: 404,
    });

    // Act
    addFormServerErrors(form, response);

    // Assert
    expect(form.controls.testField.errors).toBe(null);
  });
});

import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Service to display error messages through the snack bar.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Displays an error message in the snack bar.
   */
  showError(error: { msg?: string } | string) {
    if (typeof error === 'string') {
      error = { msg: error };
    }
    if (!error.msg) {
      error.msg = 'Something went wrong.';
    }
    this.snackBar.open(error.msg, null, {
      panelClass: 'snackbar-error',
      duration: 5000
    });
  }
}

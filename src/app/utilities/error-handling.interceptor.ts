import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { catchError, mergeMap } from 'rxjs/operators';
import { ErrorService, AuthService } from '../services';
import { throwError, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class ErrorHandlingInterceptor implements HttpInterceptor {
  constructor(private router: Router, private errorService: ErrorService, private authService: AuthService) {}

  /**
   * Identifies and handles a given HTTP request.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Return the request to the next injector or the executer
    return next.handle(req).pipe(
      catchError((err) => {
        // Redirect on authorization error
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigateByUrl('/login');
        }
        // If there is an error message and it is not a validation error, show an error message to the user
        else if (err.status !== 400) {
          this.errorService.showError(err.error ?? {});
        } else if (err.status === 400 && err.error && err.error.code === 400 && err.error.description) {
          this.errorService.showError(err.error.description);
        } else if (err.status === 400 && typeof err.error === 'string') {
          this.errorService.showError(err.error);
        }
        return throwError(err);
      })
    );
  }
}

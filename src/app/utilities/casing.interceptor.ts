import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { keysToSnake } from 'src/app/utilities/camel-to-snake';
import { map, catchError } from 'rxjs/operators';
import { keysToCamel } from 'src/app/utilities/snake-to-camel';
import { Observable, throwError } from 'rxjs';

@Injectable()
export class CasingInterceptor implements HttpInterceptor {
  /**
   * Identifies and handles a given HTTP request.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the current request, and convert the request body to snake case.
    req = req.clone({
      body: keysToSnake(req.body)
    });

    // Return the request to the next injector or the executer
    return next.handle(req).pipe(
      // For every response, convert the response body to camel case.
      map(event => {
        if (event instanceof HttpResponse) {
          // Clone the response and adjust the body.
          return event.clone({ body: keysToCamel(event.body) });
        }
      }),
      // In case of an error response, adjust the error and rethrow.
      catchError((error: HttpErrorResponse) => {
        const modEvent = new HttpErrorResponse({
          error: keysToCamel(error.error),
          headers: error.headers,
          status: error.status,
          statusText: error.statusText,
          url: error.url || undefined
        });
        return throwError(modEvent);
      })
    );
  }
}

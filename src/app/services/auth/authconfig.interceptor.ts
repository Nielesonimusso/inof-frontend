import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Receive the authentication token from the service
    const authToken = this.authService.getAccessToken();

    // Clone the current request, and inject the token into the HTTP header
    req = req.clone({
      setHeaders: {
        // Prefix with 'Bearer', as the backend requires
        Authorization: 'Bearer ' + authToken,
      },
    });

    // Return the request to the next injector or the executer
    return next.handle(req);
  }
}

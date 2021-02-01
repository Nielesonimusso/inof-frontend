import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserRegistration, UserLogin, Company, ResetPassword } from '../../models';
import { Observable } from 'rxjs';

const API_ROOT = environment.API_ROOT;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpClient: HttpClient) {}

  logoutEvent = new EventEmitter();

  /**
   * Executes a HTTP request to the REST API to request a access token
   * On success: save the token to localstorage
   */
  login(login: UserLogin) {
    return this.httpClient.post<string>(`${API_ROOT}/api/auth_token`, login).pipe(
      tap((res) => {
        localStorage.setItem('access_token', res);
      })
    );
  }

  /**
   * Request the REST API to register a new user
   * On success: request the backend for an access token
   */
  register(registration: UserRegistration) {
    return this.httpClient.post<{ access_token: string }>(`${API_ROOT}/api/user/register`, registration);
  }

  /**
   * Request the REST API to register a new user
   * On success: request the backend for an access token
   */
  companies() {
    return this.httpClient.get<Company[]>(`${API_ROOT}/api/companies`);
  }

  /**
   * Request the REST API to send a forgot password email
   * to the provided email.
   * Success is true if status code is 200, and thus if email exists, false otherwise
   */
  forgot(email: string): Observable<HttpResponse<object>> {
    return this.httpClient.post(`${API_ROOT}/api/user/request_password_reset`, { email }, { observe: 'response' });
  }

  /**
   * Request to the REST API to reset the password of the user after they forgot it.
   * @see AuthService.forgot
   * @param resetPassword the new password
   */
  reset(resetPassword: ResetPassword): Observable<HttpResponse<object>> {
    return this.httpClient.post<any>(`${API_ROOT}/api/user/reset_password`, resetPassword, { observe: 'response' });
  }

  /**
   * Remove the access token from the localStorage, such
   * that the user cannot make authenticated requests anymore
   */
  logout() {
    localStorage.removeItem('access_token');
    this.logoutEvent.emit();
  }

  /**
   * Checks wether the user has a stored token available
   */
  public isLoggedIn(): boolean {
    return this.getAccessToken() !== null;
  }

  /**
   * Returns the access token from localstorage
   */
  public getAccessToken(): string {
    return localStorage.getItem('access_token');
  }
}

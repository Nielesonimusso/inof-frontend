import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserProfile, UserProfileUpdate, ChangePassword } from '../../models';
import { Observable, of } from 'rxjs';
import { AuthService } from '../auth';

const API_ROOT = environment.API_ROOT;

/**
 * Service to interact with the backend for user related functionality.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  user: UserProfile = null;

  constructor(private httpClient: HttpClient, private authService: AuthService) {
    this.authService.logoutEvent.subscribe(() => this.clearCache());
  }

  /**
   * Get User profile
   */
  getUserProfile(): Observable<UserProfile> {
    if (this.user === null) {
      return this.httpClient
        .get<UserProfile>(`${API_ROOT}/api/own_profile`)
        .pipe(tap((profile) => (this.user = profile)));
    } else {
      return of(this.user);
    }
  }

  updateUserProfile(profile: UserProfileUpdate): Observable<UserProfileUpdate> {
    return this.httpClient.put<UserProfileUpdate>(`${API_ROOT}/api/own_profile`, profile).pipe(
      tap((updated) => {
        if (this.user) {
          // Update stored user param
          this.user = { ...this.user, email: updated.email, fullName: updated.fullName };
        }
      })
    );
  }

  changePassword(changePassword: ChangePassword): Observable<ChangePassword> {
    return this.httpClient.post<ChangePassword>(`${API_ROOT}/api/user/change_password`, changePassword);
  }

  clearCache() {
    this.user = null;
  }
}

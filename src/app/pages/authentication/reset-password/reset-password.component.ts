import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { LoadingButtonComponent } from '../../../components';
import { finalize } from 'rxjs/operators';

/**
 * Reset password page
 */
@Component({
  selector: 'app-reset-password',
  styleUrls: ['reset-password.component.scss'],
  templateUrl: 'reset-password.component.html',
})
export class ResetPasswordComponent {
  @ViewChild(LoadingButtonComponent)
  button: LoadingButtonComponent;

  newPassword: string;
  repeatedNewPassword: string;

  constructor(private service: AuthService, private router: Router) {}

  /**
   * Check whether provided passwords match. If so, delegate the database update
   * to a service and redirect to login page. Otherwise, alert user.
   */
  resetPassword(): void {
    this.service.reset({ email: '', newPassword: this.newPassword, resetCode: '' })
      .pipe(finalize(() => this.button.completeLoading()))
      .subscribe(
      (response) => {
        this.router.navigate(['login']);
      },
      (err) => {
      }
    );
  }
}

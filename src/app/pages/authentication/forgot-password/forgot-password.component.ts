import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { LoadingButtonComponent } from '../../../components';
import { ErrorService } from 'src/app/services';
import { finalize } from 'rxjs/operators';

/**
 * Forgot password page
 */
@Component({
  selector: 'app-forgot-password',
  styleUrls: ['forgot-password.component.scss'],
  templateUrl: 'forgot-password.component.html',
})
export class ForgotPasswordComponent {
  /** Send mail button */
  @ViewChild(LoadingButtonComponent)
  button: LoadingButtonComponent;

  email: string;

  constructor(private router: Router, private service: AuthService, private errorService: ErrorService) {}

  /**
   * Checks if provided email exists. If so, navigate back to login page
   * while calling service to handle the sending of an email with instructions.
   * Otherwise, alert the user about the non-existant email.
   */
  forgotPassword(): void {
    this.service.forgot(this.email)
      .pipe(finalize(() => this.button.completeLoading()))
      .subscribe(
      (response) => {
        this.router.navigate(['login']);
      },
      (err) => {
        if (err.status === 404) {
          this.errorService.showError('No user with that email found');
        }
      }
    );
  }
}

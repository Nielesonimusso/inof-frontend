import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserLogin } from '../../../models';
import { AuthService } from '../../../services/auth';
import { LoadingButtonComponent } from '../../../components';
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';

/**
 * Login page
 */
@Component({
  selector: 'app-login',
  styleUrls: ['login.component.scss'],
  templateUrl: 'login.component.html',
})
export class LoginComponent {
  @ViewChild('ngForm')
  form: NgForm;

  @ViewChild(LoadingButtonComponent)
  loginButton: LoadingButtonComponent;

  model: UserLogin = {
    username: '',
    password: '',
  };

  /** Boolean for the backend error */
  wrongPasswordEntered: boolean;

  constructor(private router: Router, private authService: AuthService) {}

  /**
   * Delegate the credential checks to a service. Upon success, redirect to home page.
   * Otherwise, alert the user via a message.
   */
  login(): void {
    this.authService.login(this.model)
      .pipe(finalize(() => this.loginButton.completeLoading()))
      .subscribe(
      (token) => {
        if (token) {
          this.router.navigate(['']);
        }
      },
      (err) => {
        if (err.status === 401) {
          this.wrongPasswordEntered = true;
        }
      }
    );
  }
}

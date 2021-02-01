import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { UserRegistration, Company } from '../../../models';
import { LoadingButtonComponent } from '../../../components';
import { addFormServerErrors } from 'src/app/utilities/error';
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Registration page
 */
@Component({
  selector: 'app-register',
  styleUrls: ['register.component.scss'],
  templateUrl: 'register.component.html',
})
export class RegisterComponent implements OnInit {
  @ViewChild('ngForm')
  form: NgForm;

  model: UserRegistration = { username: '', password: '', fullName: '', companyId: null, email: '' };
  repeatedPassword: string;
  companies: Company[];

  @ViewChild(LoadingButtonComponent) button: LoadingButtonComponent;

  constructor(private router: Router, private authService: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    // Initialize a predefined list of company names to be used in the dropdown list
    this.authService.companies().subscribe((companies) => {
      this.companies = companies;
    });
  }

  clearServerError() {
    this.form.controls.reason.setErrors(null);
  }

  /**
   * Delegate the input sanitation + credential conflict checking to a service
   * and inform the user respectively. Upon success, redirect to login page.
   */
  register(): void {
    // Call the authentication service to register the user
    this.authService
      .register(this.model)
      .pipe(finalize(() => this.button.completeLoading()))
      .subscribe(
        (object) => {
          this.snackBar.open('registration has been completed successfully', '', { duration: 2000 });
          this.router.navigate(['login']);
        },
        (err) => {
          addFormServerErrors(this.form.form, err);
        }
      );
  }
}

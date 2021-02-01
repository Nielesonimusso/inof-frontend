import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserProfile } from '../../models';
import { UserService } from 'src/app/services';
import { LoadingButtonComponent } from '../../components';
import { Router } from '@angular/router';
import { NgModel, NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';

/**
 * Profile Page
 */
@Component({
  selector: 'app-profile',
  styleUrls: ['profile.component.scss'],
  templateUrl: 'profile.component.html',
})
export class ProfileComponent implements OnInit {
  @ViewChild('saveButton') saveButton: LoadingButtonComponent;
  @ViewChild('changePasswordButton') changePasswordButton: LoadingButtonComponent;
  @ViewChild('ngCurrentPassword') currentPasswordModel: NgModel;
  @ViewChild('ngEmail') emailModel: NgModel;
  @ViewChild('ngForm') changePasswordForm: NgForm;

  @Input()
  userProfile: UserProfile = null;

  currentPassword: string;
  newPassword: string;
  newPasswordRepeat: string;

  constructor(private router: Router, private userService: UserService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadProfile();
  }

  /**
   * Save profile changes
   */
  saveProfile() {
    this.userService
      .updateUserProfile(this.userProfile)
      .pipe(finalize(() => this.saveButton.completeLoading()))
      .subscribe(
        () => {
          this.snackBar.open('Profile information updated', '', { duration: 2000 });
          this.loadProfile();
        },
        (error) => {
          this.emailModel.control.setErrors({ alreadyInUse: true });
        }
      );
  }

  /**
   * Send request to change password and update the UI afterwards
   */
  changePassword() {
    this.userService
      .changePassword({
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .pipe(finalize(() => this.changePasswordButton.completeLoading()))
      .subscribe(
        () => {
          this.snackBar.open('Password changed', '', { duration: 2000 });
          this.loadProfile();
          this.changePasswordForm.resetForm();
        },
        (_) => {
          this.currentPasswordModel.control.setErrors({ wrongPassword: true });
        }
      );
  }

  /**
   * Load profile from the backend
   */
  private loadProfile() {
    this.userService.getUserProfile().subscribe(
      (profile) => {
        this.userProfile = profile;
      },
      (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
    );
  }
}

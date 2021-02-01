import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';

/**
 * Component to route to to logout
 */
@Component({
  template: '',
})
export class LogoutComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Logout the user using the authentication service
    this.authService.logout();
    // Redirect to login page
    this.router.navigate(['login']);
  }
}

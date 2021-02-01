import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AuthGuard', () => {
  let service: AuthGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthGuard],
    });

    service = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should redirect if not logged in', () => {
    // Arrange
    spyOn(authService, 'isLoggedIn').and.returnValue(false);
    spyOn(router, 'navigate');

    // Act
    const canActivate = service.canActivate(null, null);

    // Assert
    expect(router.navigate).toHaveBeenCalledWith(['login']);
    expect(canActivate).toBeFalse();
  });

  it('should continue if logged in', () => {
    // Arrange
    spyOn(authService, 'isLoggedIn').and.returnValue(true);
    spyOn(router, 'navigate');

    // Act
    const canActivate = service.canActivate(null, null);

    // Assert
    expect(router.navigate).toHaveBeenCalledTimes(0);
    expect(canActivate).toBeTrue();
  });
});

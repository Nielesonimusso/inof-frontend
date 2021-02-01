import { LogoutComponent } from './logout.component';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from 'src/app/services';
import { Router } from '@angular/router';
import { EmptyComponent } from 'src/app/testing/empty.component';

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;
  let router: Router;
  let service: AuthService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'login', component: EmptyComponent }]),
        HttpClientTestingModule,
      ],
      declarations: [LogoutComponent],
      providers: [AuthService],
    });

    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    service = TestBed.inject(AuthService);
  });

  it('should create', () => {
    // Assert
    expect(component).toBeDefined();
  });

  it('should logout and redirect to login on init', () => {
    // Arrange
    spyOn(service, 'logout');
    spyOn(router, 'navigate');

    // Act
    fixture.detectChanges();

    // Assert
    expect(service.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['login']);
  });
});

import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { Company } from 'src/app/models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Create mock version of localstorage
    // First we define a store to put all key/values
    let store = {};

    // Afterwards we define all methods that can be used
    const mockLocalStorage = {
      getItem: (key: string): string => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };

    // When methods of localstorage are called in the service,
    // we use the mockLocalstorage in the testing environment
    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    const url = `${environment.API_ROOT}/api/auth_token`;

    it('should make call to http client', () => {
      service.login({ username: 'Test', password: 'pwd' }).subscribe((_) => {
        expect(service.getAccessToken()).toBe('token');
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('POST');
      request.flush('token');
    });
  });

  describe('register', () => {
    const url = `${environment.API_ROOT}/api/user/register`;

    it('should make call to http client', () => {
      spyOn(service, 'login');

      service
        .register({ username: 'Test', fullName: 'Full Name', companyId: '1', email: 'regi@gmail.com', password: 'pwd' })
        .subscribe((_) => { });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('POST');
      request.flush('token');
    });
  });

  describe('companies', () => {
    const url = `${environment.API_ROOT}/api/companies`;
    it('should make call to http client', () => {
      const expected: Company = { id: '1', name: 'Company 1' };

      service.companies().subscribe((products) => {
        expect(products).toEqual([expected]);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('GET');
      request.flush([expected]);
    });
  });

  describe('getAccessToken', () => {
    it('should return stored token from localStorage', () => {
      localStorage.setItem('access_token', 'anothertoken');
      expect(service.getAccessToken()).toEqual('anothertoken');
    });
  });

  describe('loggedIn', () => {
    it('should return true when access token is present', () => {
      localStorage.setItem('access_token', 'anothertoken');
      expect(service.isLoggedIn()).toEqual(true);
    });
    it('should return false when access token is not present', () => {
      localStorage.removeItem('access_token');
      expect(service.isLoggedIn()).toEqual(false);
    });
  });

  describe('logout', () => {
    it('should remove stored token from localStorage', () => {
      localStorage.setItem('access_token', 'anothertoken');
      service.logout();
      expect(localStorage.getItem('access_token')).toEqual(null);
    });
    it('should emit logout event', () => {
      const eventSpy = spyOn(service.logoutEvent, 'emit');

      service.logout();
      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('forgot', () => {
    const url = `${environment.API_ROOT}/api/user/request_password_reset`;

    it('should make call to http client', () => {
      service.forgot('johndoe@gmail.com').subscribe();

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('POST');
      request.flush('');
    });
  });

  describe('reset', () => {
    const url = `${environment.API_ROOT}/api/user/reset_password`;

    it('should make call to http client', () => {
      service.reset({ email: 'a.b@gmail.com', newPassword: '123456', resetCode: 'rscode' }).subscribe();

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('POST');
      request.flush('');
    });
  });
});

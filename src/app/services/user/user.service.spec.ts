import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { UserProfile, ChangePassword, UserProfileUpdate } from '../../models';
import { AuthService } from '..';

describe('UserService', () => {
  let service: UserService;
  let auth: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, AuthService],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(UserService);
    auth = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserProfile', () => {
    const url = `${environment.API_ROOT}/api/own_profile`;
    it('should make call to http client if not cached', () => {
      const expected: UserProfile = getUserProfile();

      service.getUserProfile().subscribe((profile) => {
        expect(profile).toEqual(expected);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(expected);
    });

    it('should return cached object', () => {
      const expected: UserProfile = getUserProfile();

      service.getUserProfile().subscribe((profile) => {
        expect(profile).toEqual(expected);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(expected);

      service.getUserProfile().subscribe((profile) => {
        expect(profile).toEqual(expected);
      });

      httpMock.expectNone(url, 'expects no request after cache');
    });
  });

  describe('updateUserProfile', () => {
    const url = `${environment.API_ROOT}/api/own_profile`;
    it('should make request', () => {
      const expected = getTestUpdate();

      service.updateUserProfile(expected).subscribe((update) => {
        expect(update).toEqual(expected);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.body).toEqual(expected);
      expect(req.request.method).toBe('PUT');
      req.flush(expected);
    });

    it('should update cache if cache is set', () => {
      const expectedUpdate = getTestUpdate();
      const expectedProfile = getUserProfile();
      const expectedUpdatedProfile: UserProfile = {
        ...expectedProfile,
        ...expectedUpdate,
      };

      service.getUserProfile().subscribe((profile) => {
        expect(profile).toEqual(expectedProfile);
      });

      const getReq = httpMock.expectOne(url);
      expect(getReq.request.method).toBe('GET');
      getReq.flush(expectedProfile);

      service.updateUserProfile(expectedUpdate).subscribe((update) => {
        expect(update).toEqual(expectedUpdate);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.body).toEqual(expectedUpdate);
      expect(req.request.method).toBe('PUT');
      req.flush(expectedUpdate);

      service.getUserProfile().subscribe((profile) => {
        expect(profile).toEqual(expectedUpdatedProfile);
      });

      httpMock.expectNone(url, 'expects no request after cache');
    });
  });

  describe('changePassword', () => {
    const url = `${environment.API_ROOT}/api/user/change_password`;
    it('should make change password request', () => {
      const expected: ChangePassword = {
        currentPassword: '1234',
        newPassword: '12345',
      };

      service.changePassword(expected).subscribe((change) => {
        expect(change).toEqual(expected);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.body).toEqual(expected);
      expect(req.request.method).toBe('POST');
      req.flush(req.request.body);
    });
  });

  it('should clear cache on logoutEvent', () => {
    auth.logout();

    expect(service.user).toBeNull();
  });
});

function getUserProfile(): UserProfile {
  return {
    fullName: 'Full Name',
    username: 'username123',
    email: 'valid-email@tue.nl',
    companyId: '12',
    company: {
      id: '12',
      name: 'TU/e',
      address: 'Den Dolech 2',
    },
  };
}

function getTestUpdate(): UserProfileUpdate {
  return {
    email: 'newEmail@tue.nl',
    fullName: 'John Doe',
  };
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProfileComponent } from './profile.component';
import { UserService } from 'src/app/services';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { HarnessLoader, ComponentHarness } from '@angular/cdk/testing';
import { Type } from '@angular/core';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { UserProfile, ChangePassword } from 'src/app/models';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { LoadingButtonComponent } from '../../components';
import { MatButtonModule } from '@angular/material/button';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

/**
 * The Page helper class gives easy access to parts of the page relevant to testing such as input fields or buttons.
 * https://angular.io/guide/testing#use-a-page-object
 */
class Page {
  get companyName() {
    return this.query<HTMLElement>('#company-name');
  }
  get companyAddress() {
    return this.query<HTMLElement>('#company-address');
  }
  get saveButton() {
    return this.queryHarness(MatButtonHarness, '#save');
  }
  get changePasswordButton() {
    return this.queryHarness(MatButtonHarness, '#change-password');
  }
  get fullNameInput() {
    return this.queryHarness(MatInputHarness, '#full-name');
  }
  get emailInput() {
    return this.queryHarness(MatInputHarness, '#email');
  }
  get currentPasswordInput() {
    return this.queryHarness(MatInputHarness, '#current-password');
  }
  get newPasswordInput() {
    return this.queryHarness(MatInputHarness, '#new-password');
  }
  get newPasswordRepeatInput() {
    return this.queryHarness(MatInputHarness, '#new-password-repeat');
  }

  constructor(private fixture: ComponentFixture<ProfileComponent>, private loader: HarnessLoader) {}

  /**
   * Helper method to shorten the getters, this gets the Angular Material Harness with type (T) based on the selector
   * https://material.angular.io/guide/using-component-harnesses
   */
  private queryHarness<T extends ComponentHarness>(t: Type<T>, selector: string): Promise<T> {
    // @ts-ignore
    return this.loader.getHarness(t.with({ selector }));
  }

  private query<T>(selector: string): T {
    return this.fixture.nativeElement.querySelector(selector);
  }
}

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let loader: HarnessLoader;
  let page: Page;
  let router: Router;
  let userService: UserService;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatInputModule,
        FormsModule,
        MatFormFieldModule,
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        MatSnackBarModule,
      ],
      declarations: [ProfileComponent, LoadingButtonComponent],
      providers: [MatSnackBar, UserService],
    });

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    userService = TestBed.inject(UserService);
    snackBar = TestBed.inject(MatSnackBar);
    loader = TestbedHarnessEnvironment.loader(fixture);
    page = new Page(fixture, loader);
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should load profile from service', () => {
    // Arrange
    const profileSpy = spyOn(userService, 'getUserProfile').and.returnValue(of(getTestProfile()));

    // Act
    fixture.detectChanges();

    // Assert
    expect(profileSpy).toHaveBeenCalled();
    expect(component.userProfile).toEqual(getTestProfile());
  });

  it('should navigate to error page when loading profile fails', () => {
    // Arrange
    const profileSpy = spyOn(userService, 'getUserProfile').and.returnValue(throwError({}));
    const navigateByUrlSpy = spyOn(router, 'navigateByUrl');

    // Act
    fixture.detectChanges();

    // Assert
    expect(profileSpy).toHaveBeenCalled();
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/error', { skipLocationChange: true });
  });

  it('should show users full name, company name, company address and email', async () => {
    // Arrange
    const expectedProfile = getTestProfile();
    spyOn(userService, 'getUserProfile').and.returnValue(of(expectedProfile));

    // Act
    fixture.detectChanges();

    // Assert
    expect(await (await page.fullNameInput).getValue()).toBe(expectedProfile.fullName);
    expect(page.companyName.textContent).toBe(expectedProfile.company.name);
    expect(page.companyAddress.textContent).toBe(expectedProfile.company.address);
    expect(await (await page.emailInput).getValue()).toBe(expectedProfile.email);
  });

  it('should call the backend when saving profile', async () => {
    // Arrange
    const expectedProfile = getTestProfile();
    spyOn(userService, 'getUserProfile').and.returnValue(of(expectedProfile));
    const updateSpy = spyOn(userService, 'updateUserProfile').and.returnValue(of(expectedProfile));
    const snackBarSpy = spyOn(snackBar, 'open');

    // Detect changes before save button is loaded
    fixture.detectChanges();
    const completeLoadingSpy = spyOn(component.saveButton, 'completeLoading');

    // Act
    await (await page.saveButton).click();
    await fixture.whenStable();

    // Assert
    expect(updateSpy).toHaveBeenCalled();
    expect(snackBarSpy).toHaveBeenCalledWith('Profile information updated', '', { duration: 2000 });
    expect(completeLoadingSpy).toHaveBeenCalled();
  });

  it('should call the backend when updating the password', async () => {
    // Arrange
    // Set spy's
    const expectedProfile = getTestProfile();
    spyOn(userService, 'getUserProfile').and.returnValue(of(expectedProfile));
    const updateSpy = spyOn(userService, 'changePassword').and.returnValue(
      of({ currentPassword: '', newPassword: '' })
    );
    const snackBarSpy = spyOn(snackBar, 'open');

    // Detect changes before changePasswordButton is loaded
    fixture.detectChanges();
    const completeLoadingSpy = spyOn(component.changePasswordButton, 'completeLoading');
    // Set update
    const update: ChangePassword = {
      currentPassword: 'current',
      newPassword: 'newPassword',
    };

    // Act
    await (await page.currentPasswordInput).setValue(update.currentPassword);
    await (await page.newPasswordInput).setValue(update.newPassword);
    await (await page.newPasswordRepeatInput).setValue(update.newPassword);
    await (await page.changePasswordButton).click();
    await fixture.whenStable();

    // Assert
    expect(updateSpy).toHaveBeenCalledWith(update);
    expect(snackBarSpy).toHaveBeenCalledWith('Password changed', '', { duration: 2000 });
    expect(completeLoadingSpy).toHaveBeenCalled();
  });

  it('should complete spinning when update profile fails', async () => {
    // Arrange
    const expectedProfile = getTestProfile();
    spyOn(userService, 'getUserProfile').and.returnValue(of(expectedProfile));
    const serviceSpy = spyOn(userService, 'updateUserProfile').and.returnValue(throwError({}));

    // Detect changes before save button is loaded
    fixture.detectChanges();
    const completeLoadingSpy = spyOn(component.saveButton, 'completeLoading');

    // Act
    await (await page.saveButton).click();
    await fixture.whenStable();

    // Assert
    expect(serviceSpy).toHaveBeenCalled();
    expect(completeLoadingSpy).toHaveBeenCalled();
  });

  it('should complete spinning when change password fails', async () => {
    // Arrange
    const expectedProfile = getTestProfile();
    spyOn(userService, 'getUserProfile').and.returnValue(of(expectedProfile));
    const serviceSpy = spyOn(userService, 'changePassword').and.returnValue(throwError({}));

    fixture.detectChanges();
    const completeLoadingSpy = spyOn(component.changePasswordButton, 'completeLoading');
    const update: ChangePassword = {
      currentPassword: 'current',
      newPassword: 'newPassword',
    };

    // Act
    await (await page.currentPasswordInput).setValue(update.currentPassword);
    await (await page.newPasswordInput).setValue(update.newPassword);
    await (await page.newPasswordRepeatInput).setValue(update.newPassword);
    await (await page.changePasswordButton).click();
    await fixture.whenStable();

    // Assert
    expect(serviceSpy).toHaveBeenCalled();
    expect(component.currentPasswordModel.invalid).toBeTrue();
    expect(completeLoadingSpy).toHaveBeenCalled();
  });
});

function getTestProfile(): UserProfile {
  return {
    username: 'johhnyboi11',
    fullName: 'John Cena',
    email: 'j.cena@gmail.com',
    companyId: '1',
    company: { id: '1', name: 'Company 1', address: 'Building 1, Eindhoven' },
  };
}

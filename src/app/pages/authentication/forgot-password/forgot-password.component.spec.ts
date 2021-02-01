import { ForgotPasswordComponent } from './forgot-password.component';

import { Type } from '@angular/core';
import { HarnessLoader, ComponentHarness } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../services/auth';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { LoadingButtonComponent } from '../../../components';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ErrorService } from 'src/app/services';
/**
 * The Page helper class gives easy access to parts of the page relevant to testing such as input fields or buttons.
 * https://angular.io/guide/testing#use-a-page-object
 */
class Page {
  get cancelButton() {
    return this.queryHarness(MatButtonHarness, '#cancel-button');
  }
  get sendButton() {
    return this.queryHarness(MatButtonHarness, '#send-button');
  }
  get emailInput() {
    return this.queryHarness(MatInputHarness, '#email');
  }

  constructor(private loader: HarnessLoader) {}

  /**
   * Helper method to shorten the getters, this gets the Angular Material Harness with type (T) based on the selector
   * https://material.angular.io/guide/using-component-harnesses
   */
  private queryHarness<T extends ComponentHarness>(t: Type<T>, selector: string): Promise<T> {
    // @ts-ignore
    return this.loader.getHarness(t.with({ selector }));
  }
}

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let loader: HarnessLoader;
  let page: Page;
  let router: Router;
  let service: AuthService;
  let errorService: ErrorService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        NoopAnimationsModule,
        FormsModule,
        MatSnackBarModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatCardModule,
      ],
      declarations: [ForgotPasswordComponent, LoadingButtonComponent],
      providers: [AuthService, ErrorService],
    });

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    component.button = jasmine.createSpyObj('LoadingButtonComponent', ['completeLoading']);
    loader = TestbedHarnessEnvironment.loader(fixture);
    page = new Page(loader);
    router = TestBed.inject(Router);
    service = TestBed.inject(AuthService);
    errorService = TestBed.inject(ErrorService);
    fixture.detectChanges();
  });

  it('should create', () => {
    // Assert
    expect(component).toBeDefined();
  });

  it('should display empty fields', async () => {
    // Arrange
    const emailInput = await page.emailInput;

    // Assert
    expect(await emailInput.getValue()).toEqual('');
  });

  it('should display inputted email', async () => {
    // Arrange
    const email = 'example@admin.com';
    const emailInput = await page.emailInput;

    // Act
    await emailInput.setValue(email);
    fixture.detectChanges();

    // Assert
    expect(component.email).toEqual(email);
  });

  it('should go to login after sending request and email exists', async () => {
    // Arrange
    const spy = spyOn(component.button, 'completeLoading');
    const expectedEmail = 'email@domain.com';
    const routerSpy = spyOn(router, 'navigate');
    const serviceSpy = spyOn(service, 'forgot').and.returnValue(of(null));

    const input = await page.emailInput;
    const button = await page.sendButton;

    // Act
    await input.setValue(expectedEmail);
    fixture.detectChanges();
    await button.click();

    // Assert
    expect(spy).toHaveBeenCalled();
    expect(serviceSpy).toHaveBeenCalledWith(expectedEmail);
    expect(routerSpy).toHaveBeenCalledWith(['login']);
  });

  it('should show alert after sending request and email does not exists', async () => {
    // Arrange
    const expectedEmail = 'email@domain.com';
    const routerSpy = spyOn(router, 'navigate');
    const serviceSpy = spyOn(service, 'forgot').and.callFake((email) => {
      expect(email).toBe(expectedEmail);
      return throwError({});
    });
    const input = await page.emailInput;
    const button = await page.sendButton;

    // Act
    await input.setValue(expectedEmail);
    fixture.detectChanges();
    await button.click();

    // Assert
    expect(routerSpy).not.toHaveBeenCalled();
    expect(serviceSpy).toHaveBeenCalledWith(expectedEmail);
  });

  it('should show error message when error status is 404 not found', async () => {
    // Arrange
    const serviceSpy = spyOn(service, 'forgot').and.returnValue(throwError({ status: 404 }));
    spyOn(errorService, 'showError');

    const expectedEmail = 'email@domain.com';
    const input = await page.emailInput;
    const button = await page.sendButton;

    // Act
    await input.setValue(expectedEmail);
    fixture.detectChanges();
    await button.click();

    // Assert
    expect(serviceSpy).toHaveBeenCalledWith(expectedEmail);
    expect(errorService.showError).toHaveBeenCalledWith('No user with that email found');
  });
});

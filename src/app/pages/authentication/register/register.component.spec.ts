import { RegisterComponent } from './register.component';

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
import { Observable, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { UserRegistration, Company } from '../../../models';
import { LoadingButtonComponent } from '../../../components';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
/**
 * The Page helper class gives easy access to parts of the page relevant to testing such as input fields or buttons.
 * https://angular.io/guide/testing#use-a-page-object
 */
class Page {
  get button() {
    return this.queryHarness(MatButtonHarness, '.register-button');
  }

  get usernameInput() {
    return this.queryHarness(MatInputHarness, '#username');
  }

  get fullnameInput() {
    return this.queryHarness(MatInputHarness, '#fullname');
  }

  get emailInput() {
    return this.queryHarness(MatInputHarness, '#email');
  }

  get companySelect() {
    return this.queryHarness(MatSelectHarness, '#company');
  }

  get passwordInput() {
    return this.queryHarness(MatInputHarness, '#password');
  }

  get repeatedPasswordInput() {
    return this.queryHarness(MatInputHarness, '#repeatedPassword');
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

const companies: Company[] = [
  {
    id: '1',
    name: 'company1',
    address: 'A1',
  },
  {
    id: '2',
    name: 'company2',
    address: 'A2',
  },
  {
    id: '3',
    name: 'Company 3',
    address: 'A3',
  },
];

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let loader: HarnessLoader;
  let page: Page;
  let router: Router;
  let service: AuthService;
  let snackBar: MatSnackBar;
  let companySpy: jasmine.Spy;
  let snackBarSpy: jasmine.Spy;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatInputModule,
        FormsModule,
        MatFormFieldModule,
        MatCardModule,
        MatSelectModule,
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        MatSnackBarModule
      ],
      providers: [AuthService],
      declarations: [RegisterComponent, LoadingButtonComponent],
    });

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    component.button = jasmine.createSpyObj('LoadingButtonComponent', ['completeLoading']);
    loader = TestbedHarnessEnvironment.loader(fixture);
    page = new Page(loader);
    router = TestBed.inject(Router);
    service = TestBed.inject(AuthService);
    snackBar = TestBed.inject(MatSnackBar);
    snackBarSpy = spyOn(snackBar, 'open');
    companySpy = spyOn(service, 'companies').and.returnValue(
      new Observable((subscriber) => {
        // Return login succeeds
        subscriber.next(companies);
        return {
          unsubscribe() {},
        };
      })
    );
  });

  it('should create', () => {
    // Assert
    expect(component).toBeDefined();
  });

  it('should display empty fields', async () => {
    // Arrange
    const usernameInput = await page.usernameInput;
    const fullnameInput = await page.fullnameInput;
    const emailInput = await page.emailInput;
    const companySelect = await page.companySelect;
    const passwordInput = await page.passwordInput;
    const repeatedPasswordInput = await page.repeatedPasswordInput;

    // Assert
    expect(await usernameInput.getValue()).toEqual('');
    expect(await fullnameInput.getValue()).toEqual('');
    expect(await emailInput.getValue()).toEqual('');
    expect(await companySelect.getValueText()).toEqual('');
    expect(await passwordInput.getValue()).toEqual('');
    expect(await repeatedPasswordInput.getValue()).toEqual('');
    expect(companySpy).toHaveBeenCalled();
  });

  it('should display inputs', async () => {
    // Arrange
    const model: UserRegistration = getTestModel();
    const repeatedPassword = 'repeated';
    const usernameInput = await page.usernameInput;
    const fullnameInput = await page.fullnameInput;
    const emailInput = await page.emailInput;
    const companySelect = await page.companySelect;
    const passwordInput = await page.passwordInput;
    const repeatedPasswordInput = await page.repeatedPasswordInput;

    // Act
    await usernameInput.setValue(model.username);
    await fullnameInput.setValue(model.fullName);
    await emailInput.setValue(model.email);
    await companySelect.clickOptions({ text: 'company2' });
    await passwordInput.setValue(model.password);
    await repeatedPasswordInput.setValue(repeatedPassword);
    fixture.detectChanges();

    // Assert
    expect(component.model).toEqual(model);
    expect(component.repeatedPassword).toBe(repeatedPassword);
    expect(companySpy).toHaveBeenCalled();
  });

  it('should go to login after registration succeeds', async () => {
    // Arrange
    const model: UserRegistration = getTestModel();
    const routerSpy = spyOn(router, 'navigate');
    const registerSpy = spyOn(service, 'register').and.returnValue(
      new Observable((subscriber) => {
        // Return registration succeeds
        subscriber.next({ access_token: 'token' });
        return {
          unsubscribe() {},
        };
      })
    );

    const usernameInput = await page.usernameInput;
    const fullnameInput = await page.fullnameInput;
    const emailInput = await page.emailInput;
    const companySelect = await page.companySelect;
    const passwordInput = await page.passwordInput;
    const repeatedPasswordInput = await page.repeatedPasswordInput;
    const button = await page.button;

    // Act
    await usernameInput.setValue(model.username);
    await fullnameInput.setValue(model.fullName);
    await emailInput.setValue(model.email);
    await companySelect.clickOptions({ text: 'company2' });
    await passwordInput.setValue(model.password);
    await repeatedPasswordInput.setValue(model.password);
    fixture.detectChanges();
    await button.click();

    // Assert
    expect(snackBarSpy).toHaveBeenCalledWith('registration has been completed successfully', '', { duration: 2000 });
    expect(routerSpy).toHaveBeenCalledWith(['login']);
    expect(registerSpy).toHaveBeenCalledWith(model);
    expect(companySpy).toHaveBeenCalled();
  });

  it('should not navigate after registration fails', async () => {
    // Arrange
    const model: UserRegistration = getTestModel();
    const routerSpy = spyOn(router, 'navigate');
    const registerSpy = spyOn(service, 'register').and.returnValue(throwError({}));

    const usernameInput = await page.usernameInput;
    const fullnameInput = await page.fullnameInput;
    const emailInput = await page.emailInput;
    const companySelect = await page.companySelect;
    const passwordInput = await page.passwordInput;
    const repeatedPasswordInput = await page.repeatedPasswordInput;
    const button = await page.button;

    // Act
    await usernameInput.setValue(model.username);
    await fullnameInput.setValue(model.fullName);
    await emailInput.setValue(model.email);
    await companySelect.clickOptions({ text: 'company2' });
    await passwordInput.setValue(model.password);
    await repeatedPasswordInput.setValue(model.password);
    fixture.detectChanges();
    await button.click();

    // Assert
    expect(routerSpy).not.toHaveBeenCalled();
    expect(registerSpy).toHaveBeenCalledWith(model);
    expect(companySpy).toHaveBeenCalled();
  });
});

function getTestModel(): UserRegistration {
  return {
    username: 'username',
    password: 'password',
    fullName: 'fullName',
    companyId: '2',
    email: 'email@domain.com',
  };
}

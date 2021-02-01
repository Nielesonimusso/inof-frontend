import { LoginComponent } from './login.component';
import { Type } from '@angular/core';
import { HarnessLoader, ComponentHarness } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { UserLogin } from '../../../models';
import { LoadingButtonComponent } from '../../../components';

/**
 * The Page helper class gives easy access to parts of the page relevant to testing such as input fields or buttons.
 * https://angular.io/guide/testing#use-a-page-object
 */
class Page {
  get button() {
    return this.queryHarness(MatButtonHarness, '.login-button');
  }

  get usernameInput() {
    return this.queryHarness(MatInputHarness, '#username');
  }

  get passwordInput() {
    return this.queryHarness(MatInputHarness, '#password');
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

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loader: HarnessLoader;
  let page: Page;
  let router: Router;
  let service: AuthService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatInputModule,
        FormsModule,
        MatFormFieldModule,
        MatCardModule,
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
      ],
      providers: [AuthService],
      declarations: [LoginComponent, LoadingButtonComponent],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    component.loginButton = jasmine.createSpyObj('LoadingButtonComponent', ['completeLoading']);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    page = new Page(loader);
    router = TestBed.inject(Router);
    service = TestBed.inject(AuthService);
  });

  it('should create', () => {
    // Assert
    expect(component).toBeDefined();
  });

  it('should display empty fields', async () => {
    // Arrange
    const usernameInput = await page.usernameInput;
    const passwordInput = await page.passwordInput;

    // Assert
    expect(await usernameInput.getValue()).toEqual('');
    expect(await passwordInput.getValue()).toEqual('');
  });

  it('should display inputs', async () => {
    // Arrange
    const model: UserLogin = getTestModel();
    const usernameInput = await page.usernameInput;
    const passwordInput = await page.passwordInput;

    // Act
    await usernameInput.setValue(model.username);
    await passwordInput.setValue(model.password);
    fixture.detectChanges();

    // Assert
    expect(component.model).toEqual(model);
  });

  it('should go to home after login succeeds', async () => {
    // Arrange
    const model = getTestModel();
    const routerSpy = spyOn(router, 'navigate');
    const serviceSpy = spyOn(service, 'login').and.returnValue(
      new Observable((subscriber) => {
        // Return login succeeds
        subscriber.next('token');
        return {
          unsubscribe() {},
        };
      })
    );

    const usernameInput = await page.usernameInput;
    const passwordInput = await page.passwordInput;
    const button = await page.button;

    // Act
    await usernameInput.setValue(model.username);
    await passwordInput.setValue(model.password);
    fixture.detectChanges();
    await button.click();

    // Assert
    expect(routerSpy).toHaveBeenCalledWith(['']);
    expect(serviceSpy).toHaveBeenCalledWith(model);
  });

  it('should not navigate after login fails', async () => {
    // Arrange
    const model = getTestModel();
    const routerSpy = spyOn(router, 'navigate');
    const serviceSpy = spyOn(service, 'login').and.returnValue(throwError({}));

    const usernameInput = await page.usernameInput;
    const passwordInput = await page.passwordInput;
    const button = await page.button;

    // Act
    await usernameInput.setValue(model.username);
    await passwordInput.setValue(model.password);
    fixture.detectChanges();
    await button.click();

    // Assert
    expect(routerSpy).not.toHaveBeenCalledWith(['']);
    expect(serviceSpy).toHaveBeenCalledWith(model);
  });

  it('should set wrongPasswordEntered when error status is 401', async () => {
    // Arrange
    const model = getTestModel();
    const serviceSpy = spyOn(service, 'login').and.returnValue(throwError({ status: 401 }));
    const usernameInput = await page.usernameInput;
    const passwordInput = await page.passwordInput;
    const button = await page.button;

    // Act
    await usernameInput.setValue(model.username);
    await passwordInput.setValue(model.password);
    fixture.detectChanges();
    await button.click();

    // Assert
    expect(serviceSpy).toHaveBeenCalled();
    expect(component.wrongPasswordEntered).toBeTrue();
  });
});

function getTestModel(): UserLogin {
  return { username: 'username', password: 'somepassword' };
}

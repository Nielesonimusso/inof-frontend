import { ResetPasswordComponent } from './reset-password.component';

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
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { MustMatchDirective, TrimDirective, MinDirective } from '../../../directives';
import { LoadingButtonComponent } from '../../../components';
/**
 * The Page helper class gives easy access to parts of the page relevant to testing such as input fields or buttons.
 * https://angular.io/guide/testing#use-a-page-object
 */
class Page {
  get button() {
    return this.queryHarness(MatButtonHarness, '#button');
  }

  get repeatedPasswordInput() {
    return this.queryHarness(MatInputHarness, '#repeated-new-password');
  }

  get passwordInput() {
    return this.queryHarness(MatInputHarness, '#new-password');
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

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
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
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
      ],
      providers: [AuthService],
      declarations: [ResetPasswordComponent, MustMatchDirective, MinDirective, LoadingButtonComponent],
    });

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    component.button = jasmine.createSpyObj('LoadingButtonComponent', ['completeLoading']);
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
    const passwordInput = await page.passwordInput;
    const repeatedInput = await page.repeatedPasswordInput;

    // Assert
    expect(await repeatedInput.getValue()).toEqual('');
    expect(await passwordInput.getValue()).toEqual('');
  });

  it('should display inputs', async () => {
    // Arrange
    const model = getTestModel();
    const passwordInput = await page.passwordInput;
    const repeatedInput = await page.repeatedPasswordInput;

    // Act
    await repeatedInput.setValue(model.repeated);
    await passwordInput.setValue(model.password);
    fixture.detectChanges();

    // Assert
    expect(component.newPassword).toBe(model.password);
    expect(component.repeatedNewPassword).toBe(model.repeated);
  });

  it('should go to login after reset succeeds', async () => {
    // Arrange
    const model = getTestModel();
    const routerSpy = spyOn(router, 'navigate');
    const serviceSpy = spyOn(service, 'reset').and.returnValue(of(null));

    const passwordInput = await page.passwordInput;
    const repeatedInput = await page.repeatedPasswordInput;
    const button = await page.button;

    // Act
    await passwordInput.setValue(model.password);
    await repeatedInput.setValue(model.password);
    fixture.detectChanges();
    await button.click();

    // Assert
    expect(routerSpy).toHaveBeenCalledWith(['login']);
    expect(serviceSpy).toHaveBeenCalledWith({ email: '', newPassword: model.password, resetCode: '' });
  });

  it('should not navigate after reset fails', async () => {
    // Arrange
    const model = getTestModel();
    const routerSpy = spyOn(router, 'navigate');
    const serviceSpy = spyOn(service, 'reset').and.returnValue(throwError({}));

    const passwordInput = await page.passwordInput;
    const repeatedInput = await page.repeatedPasswordInput;
    const button = await page.button;

    // Act
    await repeatedInput.setValue(model.password);
    await passwordInput.setValue(model.password);
    fixture.detectChanges();
    await button.click();

    // Assert
    expect(routerSpy).not.toHaveBeenCalledWith(['login']);
    expect(serviceSpy).toHaveBeenCalledWith({ email: '', newPassword: model.password, resetCode: '' });
  });

  it('should not call service when passwords do not match', async () => {
    // Arrange
    const model = getTestModel();
    const serviceSpy = spyOn(service, 'reset');

    const passwordInput = await page.passwordInput;
    const repeatedInput = await page.repeatedPasswordInput;
    const button = await page.button;

    // Act
    await passwordInput.setValue(model.password);
    await repeatedInput.setValue(model.repeated);
    fixture.detectChanges();

    // Assert
    // LoadingButton is disabled
    expect(serviceSpy).not.toHaveBeenCalled();
  });
});

function getTestModel() {
  return { repeated: 'somethingElse', password: 'somepassword' };
}

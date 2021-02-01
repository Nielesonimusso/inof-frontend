import { Model, EmptyModel, UserProfile, Company, ModelPermissionType } from '../../../models';
import { AddEditModelComponent } from './add-edit-model.component';
import { DebugElement, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader, ComponentHarness } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService, ModelService, UserService } from '../../../services';
import { of, throwError } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmptyComponent } from '../../../testing/empty.component';
import { LoadingButtonComponent, CancelEditsDialogAction } from '../../../components';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatTableModule } from '@angular/material/table';

/**
 * The Page helper class gives easy access to parts of the page relevant to testing such as input fields or buttons.
 * https://angular.io/guide/testing#use-a-page-object
 */
class Page {
  get cancelButton() {
    return this.queryHarness(MatButtonHarness, '#cancel');
  }
  get saveButton() {
    return this.queryHarness(MatButtonHarness, '#save');
  }
  get nameInput() {
    return this.queryHarness(MatInputHarness, '#name');
  }
  get descriptionInput() {
    return this.queryHarness(MatInputHarness, '#description');
  }
  get priceInput() {
    return this.queryHarness(MatInputHarness, '#price');
  }
  get gatewayUrlInput() {
    return this.queryHarness(MatInputHarness, '#gateway-url');
  }
  get isConnectedCheckbox() {
    return this.queryHarness(MatCheckboxHarness, '#is-connected');
  }
  get companiesDropDownMatSelect() {
    return this.queryHarness(MatSelectHarness, '#all-companies');
  }
  get table() {
    return this.queryHarness(MatTableHarness, '.width-100');
  }

  getDeleteSelectedCompaniesButton(i) {
    return this.queryHarness(MatButtonHarness, '#selected-company-delete-button-' + i);
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

describe('AddEditModelComponent', () => {
  let component: AddEditModelComponent;
  let fixture: ComponentFixture<AddEditModelComponent>;
  let loader: HarnessLoader;
  let page: Page;
  let service: ModelService;
  let router: Router;
  let route: ActivatedRoute;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let authService: jasmine.SpyObj<AuthService>;
  let userProfileService: jasmine.SpyObj<UserService>;
  let el: DebugElement;

  beforeEach(async () => {
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    authService = jasmine.createSpyObj('AuthService', ['companies']);
    authService.companies.and.returnValue(of(getTestCompanies()));
    userProfileService = jasmine.createSpyObj('UserService', ['getUserProfile']);
    userProfileService.getUserProfile.and.returnValue(of(getTestUser()));

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        FormsModule,
        MatCheckboxModule,
        MatButtonModule,
        MatInputModule,
        RouterTestingModule.withRoutes([{ path: 'inspect/:id', component: EmptyComponent }]),
        HttpClientTestingModule,
        MatDialogModule,
        MatSelectModule,
        MatTableModule,
      ],
      declarations: [AddEditModelComponent, LoadingButtonComponent],
      providers: [
        { provide: MatSnackBar, useValue: snackBar },
        { provide: AuthService, useValue: authService },
        { provide: UserService, useValue: userProfileService },
      ],
    });

    service = TestBed.inject(ModelService);
    spyOn(service, 'updatePermissions').and.returnValue(of(null));
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);

    fixture = TestBed.createComponent(AddEditModelComponent);
    component = fixture.componentInstance;
    component.saveButton = jasmine.createSpyObj('LoadingButtonComponent', ['completeLoading']);
    loader = TestbedHarnessEnvironment.loader(fixture);
    page = new Page(loader);
  });

  describe('getModelPermissions', () => {
    it('should map permissions from backend to frontend', async () => {
      // arrange
      component.model = getTestModel();
      spyOn(service, 'getPermissions').and.returnValue(
        of([
          {
            company: {
              id: '555',
              name: 'company A',
            },
            companyId: '555',
            modelInfo: null,
            modelInfoId: '1111',
            permissionType: ModelPermissionType.execute,
          },
          {
            company: {
              id: '999',
              name: 'company B',
            },
            companyId: '555',
            modelInfo: null,
            modelInfoId: '1111',
            permissionType: ModelPermissionType.view,
          },
        ])
      );
      const expectedReturn: [Company, boolean][] = [
        [{ id: '555', name: 'company A' }, true],
        [{ id: '999', name: 'company B' }, false],
      ];
      component.getModelPermissions();
      // Assert
      expect(component.companyPermission).toEqual(expectedReturn);
      expect(component.selectedCompanies).toEqual(expectedReturn.map((x) => x[0]));
    });
  });

  describe('Add', () => {
    beforeEach(async () => {
      el = fixture.debugElement;
    });

    it('should create', () => {
      // Assert
      expect(component).toBeDefined();
    });

    it('should display empty fields after createComponent', async () => {
      // Arrange
      const nameInput = await page.nameInput;
      const descriptionInput = await page.descriptionInput;
      const priceInput = await page.priceInput;
      const gatewayUrlInput = await page.gatewayUrlInput;
      const isConnectedCheckbox = await page.isConnectedCheckbox;
      const companyDropDownMatSelect = await page.companiesDropDownMatSelect;

      // Assert
      expect(await nameInput.getValue()).toEqual('');
      expect(await descriptionInput.getValue()).toEqual('');
      expect(await priceInput.getValue()).toEqual('0');
      expect(await gatewayUrlInput.getValue()).toEqual('');
      expect(await isConnectedCheckbox.isChecked()).toBeFalse();
      expect(await companyDropDownMatSelect.getOptions()).toEqual([]);
    });

    it('should display the selected companies in the table', async () => {
      // Arrange
      const expectedCompanies = [getTestCompanies()[1]];
      component.companyPermission = getTestCompanyPermission().slice(0, 2);

      fixture.detectChanges();

      await fixture.whenStable();
      const selectedCompaniesList = el.query(By.css('#selected-companies'));
      expect(selectedCompaniesList.nativeElement.textContent).toContain(expectedCompanies[0].name);
      expect(selectedCompaniesList.nativeElement.textContent).not.toContain(getTestCompanies()[2].name);
    });

    it('should remove the the company where you click X next to and check that it is unselected from the dropdown', async () => {
      fixture.detectChanges();
      component.selectedCompanies = getTestCompanies().slice(1, 3);
      component.companyPermission = getTestCompanyPermission().slice(1, 3);
      component.companies = getTestCompanies();
      fixture.detectChanges();

      await fixture.whenStable();
      /**
       * Check if the companies that get removed from the list are also unselected from the dropdown.
       */
      await (await page.getDeleteSelectedCompaniesButton(0)).click();
      // after the click of the deletion button the selectedCompanies is empty in this case and thus is in the dropdown as well
      await (await page.companiesDropDownMatSelect).open();
      const options = await (await page.companiesDropDownMatSelect).getOptions();
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < options.length; i++) {
        if (component.selectedCompanies.find((company, _, __) => company.id === component.companies[i].id)) {
          expect(await options[i].isSelected()).toBeTrue();
        } else {
          expect(await options[i].isSelected()).toBeFalse();
        }
      }
    });

    it('should only show the selectedCompanies as selected in the dropdown', async () => {
      fixture.detectChanges();
      component.selectedCompanies = getTestCompanies().slice(1, 3);
      component.companyPermission = getTestCompanyPermission().slice(1, 3);
      component.companies = getTestCompanies();
      fixture.detectChanges();

      await fixture.whenStable();

      await (await page.companiesDropDownMatSelect).open();
      const options = await (await page.companiesDropDownMatSelect).getOptions();

      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < options.length; i++) {
        if (component.selectedCompanies.find((company, _, __) => company.id === component.companies[i].id)) {
          expect(await options[i].isSelected()).toBeTrue();
        } else {
          expect(await options[i].isSelected()).toBeFalse();
        }
      }
      await (await page.companiesDropDownMatSelect).close();
    });

    it('should display provided model', async () => {
      // Arrange
      const newModel: Model = getTestModel();
      const expected = getTestModel();
      const nameInput = await page.nameInput;
      const descriptionInput = await page.descriptionInput;
      const priceInput = await page.priceInput;
      const gatewayUrlInput = await page.gatewayUrlInput;
      const isConnectedCheckbox = await page.isConnectedCheckbox;

      // Act
      component.model = newModel;
      fixture.detectChanges();

      // Assert
      expect(await nameInput.getValue()).toEqual(expected.name);
      expect(await descriptionInput.getValue()).toEqual(expected.description);
      expect(await priceInput.getValue()).toEqual(expected.price.toString());
      expect(await gatewayUrlInput.getValue()).toBe(expected.gatewayUrl.toString());
      expect(await isConnectedCheckbox.isChecked()).toEqual(expected.isConnected);
    });

    it('should attempt to save new model', async () => {
      // Arrange
      // return that it failed, otherwise router gets called, and we don't intercept here
      // We test whether the routing logic is correct in other tests
      const spy = spyOn(service, 'create').and.returnValue(of(getTestModel('4565645')));
      const expected = getTestModel();
      fixture.detectChanges();
      component.model = getTestModel();

      // Act
      fixture.detectChanges();
      component.saveModel();

      // Assert
      expect(spy).toHaveBeenCalledWith(expected);
      expect(snackBar.open).toHaveBeenCalledWith('Model saved successfully', '', Object({ duration: 2000 }));
    });

    it('should redirect to route.parents page after cancellation by user', async () => {
      // Arrange
      const expectedParentRoute = new ActivatedRoute();
      expectedParentRoute.url = of([new UrlSegment('parent', {})]);
      const routerSpy = spyOn(router, 'navigate');
      const routeSpy = spyOnProperty(route, 'parent').and.returnValue(expectedParentRoute);
      const cancelButton = await page.cancelButton;

      // Act
      await cancelButton.click();

      // Assert
      expect(routerSpy).toHaveBeenCalledWith(['parent']);
    });

    it('should not populate data if no id param', async () => {
      // Arrange
      fixture.detectChanges();

      // Assert
      expect(component.model).toEqual(EmptyModel());
    });
  });

  describe('Edit', () => {
    let getSpy: jasmine.Spy;
    const expectedID = 'id1234';
    const providedModel = getTestModel(expectedID);

    beforeEach(async () => {
      route.params = of({ id: expectedID });
      getSpy = spyOn(service, 'get').and.returnValue(of(providedModel));
    });

    it('should create', () => {
      // Assert
      fixture.detectChanges();
      expect(component).toBeTruthy();
      expect(getSpy).toHaveBeenCalledWith(expectedID);
    });

    it('should display provided model after createComponent', async () => {
      // Arrange
      const nameInput = await page.nameInput;
      const descriptionInput = await page.descriptionInput;
      const priceInput = await page.priceInput;
      const gatewayUrlInput = await page.gatewayUrlInput;
      const isConnectedCheckbox = await page.isConnectedCheckbox;

      // Assert
      expect(await nameInput.getValue()).toEqual(providedModel.name);
      expect(await descriptionInput.getValue()).toEqual(providedModel.description);
      expect(await priceInput.getValue()).toEqual(providedModel.price.toString());
      expect(await gatewayUrlInput.getValue()).toBe(providedModel.gatewayUrl.toString());
      expect(await isConnectedCheckbox.isChecked()).toEqual(providedModel.isConnected);
    });

    it('should update existing model', async () => {
      const expected = providedModel;
      expected.name = 'New Name';
      expected.isConnected = false;
      expected.gatewayUrl = 'http://www.google.com';
      expected.description = 'new description';
      expected.price = 10;
      const updateSpy = spyOn(service, 'update').and.returnValue(of(getTestModel(expectedID)));
      const nameInput = await page.nameInput;
      const descriptionInput = await page.descriptionInput;
      const priceInput = await page.priceInput;
      const gatewayUrlInput = await page.gatewayUrlInput;
      const isConnectedCheckbox = await page.isConnectedCheckbox;
      const sendbutton = await page.saveButton;

      // Act
      await nameInput.setValue(expected.name);
      await descriptionInput.setValue(expected.description);
      await priceInput.setValue(expected.price.toString());
      await gatewayUrlInput.setValue(expected.gatewayUrl.toString());
      await (expected.isConnected ? isConnectedCheckbox.check() : isConnectedCheckbox.uncheck());
      fixture.detectChanges();
      await sendbutton.click();

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(expected);
      expect(snackBar.open).toHaveBeenCalledWith('Model saved successfully', '', Object({ duration: 2000 }));
    });

    describe('Cancellation', () => {
      it('should show dialog CLOSE', async () => {
        // Arrange
        fixture.detectChanges();
        const expected = component.model;
        expected.name = 'Different';

        // Router
        const routerSpy = spyOn(router, 'navigate');

        // Dialog
        const dialogRefSpyObj = jasmine.createSpyObj({
          afterClosed: of(CancelEditsDialogAction.CLOSE_DIALOG),
          close: null,
        });
        dialogRefSpyObj.componentInstance = { body: '' };
        const openDialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);

        // Service
        const serviceSpy = spyOn(service, 'update');
        // UI
        const nameInput = await page.nameInput;
        const cancelButton = await page.cancelButton;

        // Act
        await nameInput.setValue(expected.name);
        fixture.detectChanges();
        await cancelButton.click();

        // Assert
        expect(openDialogSpy).toHaveBeenCalled();
        expect(serviceSpy).not.toHaveBeenCalledWith(expected);
        expect(routerSpy).not.toHaveBeenCalled();
      });

      it('should show dialog NO SAVE', async () => {
        // Arrange
        fixture.detectChanges();
        const expected = component.model;
        expected.name = 'Different';

        // Router
        const expectedParentRoute = new ActivatedRoute();
        const routerSpy = spyOn(router, 'navigate');
        spyOnProperty(route, 'parent').and.returnValue(expectedParentRoute);

        // Dialog
        const dialogRefSpyObj = jasmine.createSpyObj({
          afterClosed: of(CancelEditsDialogAction.NO_SAVE),
          close: null,
        });
        dialogRefSpyObj.componentInstance = { body: '' };
        const openDialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);

        // Service
        const serviceSpy = spyOn(service, 'update');
        // UI
        const nameInput = await page.nameInput;
        const cancelButton = await page.cancelButton;

        // Act
        await nameInput.setValue(expected.name);
        fixture.detectChanges();
        await cancelButton.click();

        // Assert
        expect(openDialogSpy).toHaveBeenCalled();
        expect(serviceSpy).not.toHaveBeenCalledWith(expected);
        expect(routerSpy).toHaveBeenCalledWith(['inspect', providedModel.id], {
          relativeTo: expectedParentRoute,
          fragment: component.tabIndex.toString(),
        });
      });

      it('should redirect to inspect page after cancellation by user', async () => {
        // Arrange
        const expectedParentRoute = new ActivatedRoute();
        const routerSpy = spyOn(router, 'navigate');
        spyOnProperty(route, 'parent').and.returnValue(expectedParentRoute);
        const cancelButton = await page.cancelButton;

        // Act
        await cancelButton.click();

        // Assert
        expect(routerSpy).toHaveBeenCalledWith(['inspect', providedModel.id], {
          relativeTo: expectedParentRoute,
          fragment: component.tabIndex.toString(),
        });
      });

      it('should not take action on cancel while loading', async () => {
        // Arrange
        fixture.detectChanges();
        const cancelButton = await page.cancelButton;
        const routerSpy = spyOn(router, 'navigate');

        // Act
        component.model = null;
        fixture.detectChanges();
        await cancelButton.click();

        // Assert
        expect(routerSpy).not.toHaveBeenCalled();
      });
    });

    it('should call service.get if id param is set', async () => {
      // Arrange
      fixture.detectChanges();

      // Assert
      expect(component.model).toEqual(providedModel);
      expect(getSpy).toHaveBeenCalledWith(expectedID);
    });

    it('should redirect to the error page if getting model fails', () => {
      // Arrange
      const navigateByUrlSpy = spyOn(router, 'navigateByUrl');
      getSpy.and.returnValue(throwError({}));

      // Act
      fixture.detectChanges();

      // Assert
      expect(getSpy).toHaveBeenCalled();
      expect(navigateByUrlSpy).toHaveBeenCalledWith('/error', { skipLocationChange: true });
    });
  });
});

function getTestUser(): UserProfile {
  return {
    companyId: '555',
    fullName: 'Full Name',
    username: 'username123',
    company: {
      id: '555',
      name: 'Company D',
    },
    email: 'email@domain.com',
  };
}

function getTestCompanyPermission(): [Company, boolean][] {
  return [
    [{ id: '1', name: 'Company A' }, true],
    [{ id: '2', name: 'Company B' }, false],
    [{ id: '3', name: 'Company C' }, true],
  ];
}

function getTestCompanies(): Company[] {
  return [
    { id: '1', name: 'Company A' },
    { id: '2', name: 'Company B' },
    { id: '3', name: 'Company C' },
  ];
}

function getTestModel(id?: string): Model {
  return {
    id,
    owner: {
      id: '555',
      name: 'someComp',
      address: 'my street 123',
    },
    createdBy: {
      username: 'username123',
      fullName: 'Full Name',
    },
    name: 'Test Model',
    description: 'Test Model Description',
    price: 12,
    gatewayUrl: 'http://localhost/gateway',
    isConnected: true,
    inputDescriptions: [], // These are tested in add-edit-modelparameters component
    outputDescriptions: [], // These are tested in add-edit-modelparameters component
  };
}

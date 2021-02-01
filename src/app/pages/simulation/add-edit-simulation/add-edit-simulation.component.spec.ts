import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddEditSimulationComponent } from './add-edit-simulation.component';
import { MatInputHarness } from '@angular/material/input/testing';
import { HarnessLoader, ComponentHarness } from '@angular/cdk/testing';
import { Type } from '@angular/core';
import { SimulationService, FoodProductService, ModelService, UserService } from '../../../services';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Simulation, SimulationWithExecutions, Model, FoodProduct, UserProfile } from '../../../models';
import { of, throwError } from 'rxjs';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent, CancelEditsDialogAction } from 'src/app/components';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

/**
 * The Page helper class gives easy access to parts of the page relevant to testing such as input fields or buttons.
 * https://angular.io/guide/testing#use-a-page-object
 */
class Page {
  // General info tab
  get descriptionInput() {
    return this.queryHarness(MatInputHarness, '#description');
  }

  get nameInput() {
    return this.queryHarness(MatInputHarness, '#name');
  }

  get cancelButton() {
    return this.queryHarness(MatButtonHarness, '#cancel');
  }

  get saveButton() {
    return this.queryHarness(MatButtonHarness, '#save');
  }

  get saveRunButton() {
    return this.queryHarness(MatButtonHarness, '#save-and-run');
  }

  get deleteFoodProductButton() {
    return this.queryHarness(MatButtonHarness, '#foodproduct-delete-button');
  }

  get inspectFoodProductButton() {
    return this.queryHarness(MatButtonHarness, '#foodproduct-inspect-button');
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

describe('AddEditSimulationComponent', () => {
  let component: AddEditSimulationComponent;
  let fixture: ComponentFixture<AddEditSimulationComponent>;
  let page: Page;
  let simulationService: SimulationService;
  let foodProductService: FoodProductService;
  let modelService: ModelService;
  let router: Router;
  let route: ActivatedRoute;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    const userService = jasmine.createSpyObj('UserService', ['getUserProfile']);
    const profileSpy = userService.getUserProfile.and.returnValue(of(getTestUser()));

    TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        NoopAnimationsModule,
        MatInputModule,
        MatButtonModule,
        MatFormFieldModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      declarations: [AddEditSimulationComponent, LoadingButtonComponent],
      providers: [
        SimulationService,
        FoodProductService,
        ModelService,
        { provide: MatSnackBar, useValue: snackBar },
        { provide: UserService, useValue: userService },
      ],
    });

    router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
    route = TestBed.inject(ActivatedRoute);
    modelService = TestBed.inject(ModelService);
    foodProductService = TestBed.inject(FoodProductService);
    simulationService = TestBed.inject(SimulationService);

    fixture = TestBed.createComponent(AddEditSimulationComponent);
    component = fixture.componentInstance;
    const loader = TestbedHarnessEnvironment.loader(fixture);
    page = new Page(loader);
  });

  it('should navigate to the error page when retrieving models fails', () => {
    // Arrange
    const availableModelsSpy = spyOn(modelService, 'availableModels').and.returnValue(throwError({}));

    // Act
    fixture.detectChanges();

    // Assert
    expect(availableModelsSpy).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/error', { skipLocationChange: true });
  });

  it('should navigate to the error page when retrieving food products fails', () => {
    // Arrange
    const getAvailableSpy = spyOn(foodProductService, 'getAvailable').and.returnValue(throwError({}));

    // Act
    fixture.detectChanges();

    // Assert
    expect(getAvailableSpy).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/error', { skipLocationChange: true });
  });

  describe('Add', () => {
    beforeEach(async () => {
      route.params = of({});
    });

    it('should create', () => {
      // Assert
      expect(component).toBeDefined();
    });

    it('should show empty values if no simulation is set', async () => {
      // Arrange
      const descriptionInput = await page.descriptionInput;
      const nameInput = await page.nameInput;

      const chooseFoodProduct = fixture.debugElement.query(By.css('.choose-food-product'));

      // Assert
      expect(await descriptionInput.getValue()).toBe('');
      expect(await nameInput.getValue()).toBe('');
      expect(chooseFoodProduct).toBeTruthy('expects no food product to be selected');
    });

    it('should display simulation', async () => {
      // Arrange
      const newSimulation = getTestSimulation();
      const expected = getTestSimulation();
      const descriptionInput = await page.descriptionInput;
      const nameInput = await page.nameInput;

      // Act
      component.simulation = newSimulation;
      component.onFoodProductAdded(newSimulation.foodProduct);
      fixture.detectChanges();
      const selectedFoodProduct = fixture.debugElement.query(By.css('.selected-food-product'));

      // Assert
      expect(await nameInput.getValue()).toEqual(expected.name);
      expect(await descriptionInput.getValue()).toEqual(expected.description);
      expect(selectedFoodProduct).toBeTruthy();
    });

    it('should attempt to save simulation', async () => {
      // Arrange
      const expected = getTestSimulation();
      // Test whether spy is called with correct values
      const spy = spyOn(simulationService, 'create').and.callFake((simulation) => {
        expect(simulation.name).toBe(expected.name);
        expect(simulation.description).toBe(expected.description);
        expect(simulation.foodProductId).toBe(expected.foodProductId);
        expect(simulation.modelIds).toEqual(expected.modelIds);
        return of(simulation);
      });
      const nameInput = await page.nameInput;
      const descriptionInput = await page.descriptionInput;
      const saveButton = await page.saveButton;

      // Act
      await nameInput.setValue(expected.name);
      await descriptionInput.setValue(expected.description);
      component.onFoodProductAdded(expected.foodProduct);
      for (const model of expected.models) {
        component.onModelAdded(model);
      }

      fixture.detectChanges();
      await saveButton.click();

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('Simulation created successfully', '', Object({ duration: 2000 }));
    });

    // TODO: Fix test
    xit('should attempt to run simulation', async () => {
      // Arrange
      const simulation = getTestSimulation();
      const saveSpy = spyOn(simulationService, 'create').and.returnValue(of(simulation));
      const runSpy = spyOn(simulationService, 'runById').and.returnValue(of(null));

      // Act
      fixture.detectChanges();
      await (await page.saveRunButton).click();
      await fixture.whenStable();

      // Assert
      expect(saveSpy).toHaveBeenCalled();
      expect(runSpy).toHaveBeenCalledWith(simulation.id);
      expect(snackBar.open).toHaveBeenCalledWith('Simulation created successfully and a run request is made', '', {
        duration: 2000,
      });
    });

    it('should not populate data if no id param', async () => {
      // Arrange
      fixture.detectChanges();

      // Assert
      expect(component.simulation).toEqual({
        name: '',
        description: '',
        foodProduct: null,
        foodProductId: '',
        modelIds: [],
        models: [],
      });
    });
  });

  describe('Edit', () => {
    let getSpy: jasmine.Spy;
    const expectedID = '124';
    const providedSimulation = getTestSimulationWithExecutions(expectedID);

    beforeEach(async () => {
      route.params = of({ id: expectedID });
      getSpy = spyOn(simulationService, 'getById').and.returnValue(of(providedSimulation));
    });

    it('should create', () => {
      // Assert
      fixture.detectChanges();
      expect(component).toBeDefined();
      expect(getSpy).toHaveBeenCalledWith(expectedID);
    });

    it('should display provided simulation after createComponent', async () => {
      // Arrange
      const nameInput = await page.nameInput;
      const descriptionInput = await page.descriptionInput;

      // Act
      fixture.detectChanges();
      const selectedFoodProduct = fixture.debugElement.query(By.css('.selected-food-product'));

      // Assert
      expect(await nameInput.getValue()).toEqual(providedSimulation.name);
      expect(await descriptionInput.getValue()).toEqual(providedSimulation.description);
      expect(selectedFoodProduct).toBeTruthy();
      expect(selectedFoodProduct.nativeElement.textContent).toContain(providedSimulation.foodProduct.name);
      expect(selectedFoodProduct.nativeElement.textContent).toContain(providedSimulation.foodProduct.companyCode);
      expect(selectedFoodProduct.nativeElement.textContent).toContain(providedSimulation.foodProduct.standardCode);
    });

    it('should update existing simulation', async () => {
      const expected: SimulationWithExecutions = {
        ...providedSimulation,
        name: 'New Name',
        foodProductId: 'newID',
        modelIds: [],
        description: 'new description',
      };
      const updateSpy = spyOn(simulationService, 'update').and.returnValue(of(expected));
      const runSpy = spyOn(simulationService, 'runById');
      fixture.detectChanges();
      const nameInput = await page.nameInput;
      const descriptionInput = await page.descriptionInput;
      const sendbutton = await page.saveButton;

      // Act
      await nameInput.setValue(expected.name);
      await descriptionInput.setValue(expected.description);
      component.onFoodProductAdded({ ...expected.foodProduct, id: expected.foodProductId });
      component.deleteModel(0);
      component.deleteModel(0);
      fixture.detectChanges();
      await sendbutton.click();

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(expected);
      expect(runSpy).not.toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('Simulation saved successfully', '', Object({ duration: 2000 }));
    });

    it('should save and run existing simulation', async () => {
      const expected: SimulationWithExecutions = {
        ...providedSimulation,
        name: 'New Name',
        foodProductId: 'newID',
        modelIds: [],
        description: 'new description',
      };
      const updateSpy = spyOn(simulationService, 'update').and.returnValue(of(expected));
      const runSpy = spyOn(simulationService, 'runById').and.returnValue(of(null));
      const nameInput = await page.nameInput;
      const descriptionInput = await page.descriptionInput;
      const sendbutton = await page.saveRunButton;

      // Act
      await nameInput.setValue(expected.name);
      await descriptionInput.setValue(expected.description);
      component.onFoodProductAdded({ ...expected.foodProduct, id: expected.foodProductId });
      component.deleteModel(0);
      component.deleteModel(0);
      fixture.detectChanges();
      await sendbutton.click();
      await fixture.whenStable();

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(expected);
      expect(runSpy).toHaveBeenCalledWith(expected.id);
      expect(snackBar.open).toHaveBeenCalledWith('Simulation saved successfully and a run request is made', '', {
        duration: 2000,
      });
    });

    it('should delete food product when respective button is pressed', async () => {
      // Arrange
      fixture.detectChanges();
      const button = await page.deleteFoodProductButton;

      // Act
      await button.click();

      // Assert
      expect(component.selectedFoodProduct).toBeNull();
      expect(component.simulation.foodProductId).toBeNull();
    });

    it('should inspect food product when respective button is pressed', async () => {
      // Arrange
      fixture.detectChanges();
      const button = await page.inspectFoodProductButton;
      const expectedURL = 'url';
      const routerSpy = spyOn(router, 'serializeUrl').and.returnValue(expectedURL);
      const routerSpy2 = spyOn(router, 'createUrlTree').and.callThrough();
      const windowSpy = spyOn(window, 'open');

      // Act
      await button.click();

      // Assert
      expect(windowSpy).toHaveBeenCalledWith(expectedURL, '_blank');
      expect(routerSpy2).toHaveBeenCalledWith(['available-products', 'inspect', providedSimulation.foodProduct.id]);
      expect(routerSpy).toHaveBeenCalled();
    });

    it('should set available models if call successfull', async () => {
      component.simulation = getTestSimulation();
      const modelServiceSpy = spyOn(modelService, 'availableModels').and.returnValue(of(getAvailableModels()));
      const componentSpy = spyOn(component, 'updateAvailableModelsNotSelected').and.callThrough();
      const productServiceSpy = spyOn(foodProductService, 'getAvailable').and.returnValue(of(getAvailableProducts()));
      route.params = of({});

      fixture.detectChanges();
      await fixture.whenStable();

      expect(modelServiceSpy).toHaveBeenCalled();
      expect(componentSpy).toHaveBeenCalled();
      expect(component.availableModelsNotSelected.length).toBe(1);
      expect(component.availableModelsNotSelected[0].name).toBe('name');
    });

    it('should set available models if call unsuccessful', async () => {
      const modelServiceSpy = spyOn(modelService, 'availableModels').and.returnValue(throwError({}));
      const componentSpy = spyOn(component, 'updateAvailableModelsNotSelected').and.callThrough();

      fixture.detectChanges();
      await fixture.whenStable();

      expect(modelServiceSpy).toHaveBeenCalled();
      expect(componentSpy).toHaveBeenCalled();
      expect(component.availableModelsNotSelected.length).toBe(0);
    });

    it('should set available products', async () => {
      const expectedProducts = getAvailableProducts();
      const productServiceSpy = spyOn(foodProductService, 'getAvailable').and.returnValue(of(expectedProducts));

      fixture.detectChanges();

      expect(productServiceSpy).toHaveBeenCalled();
      expect(component.availableFoodProducts).toEqual(expectedProducts);
    });

    it('should call service.get if id param is set', () => {
      // Act
      fixture.detectChanges();

      // Assert
      expect(component.simulation).toEqual(providedSimulation);
      expect(getSpy).toHaveBeenCalledWith(expectedID);
    });

    it('should navigate to the error page when service.get fails', () => {
      // Arrange
      getSpy.and.returnValue(throwError({}));

      // Act
      fixture.detectChanges();

      // Assert
      expect(getSpy).toHaveBeenCalledWith(expectedID);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/error', { skipLocationChange: true });
    });

    describe('Cancellation', () => {
      it('show dialog CLOSE', async () => {
        // Arrange
        fixture.detectChanges();
        navigateSpy.calls.reset();
        const expected = component.simulation;
        expected.name = 'Different';

        // Dialog
        const dialogRefSpyObj = jasmine.createSpyObj({
          afterClosed: of(CancelEditsDialogAction.CLOSE_DIALOG),
          close: null,
        });
        dialogRefSpyObj.componentInstance = { body: '' };
        const openDialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);

        // Service
        const serviceSpy = spyOn(simulationService, 'update');
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
        expect(router.navigate).not.toHaveBeenCalled();
      });

      it('show dialog NO SAVE', async () => {
        // Arrange
        fixture.detectChanges();
        const expected = component.simulation;
        expected.name = 'Different';

        // Router
        const expectedParentRoute = new ActivatedRoute();
        spyOnProperty(route, 'parent').and.returnValue(expectedParentRoute);

        // Dialog
        const dialogRefSpyObj = jasmine.createSpyObj({
          afterClosed: of(CancelEditsDialogAction.NO_SAVE),
          close: null,
        });
        dialogRefSpyObj.componentInstance = { body: '' };
        const openDialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);

        // Service
        const serviceSpy = spyOn(simulationService, 'update');
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
        expect(router.navigate).toHaveBeenCalledWith(['inspect', providedSimulation.id], {
          relativeTo: expectedParentRoute,
          fragment: component.tabIndex.toString(),
        });
      });

      it('should redirect to inspect page after cancellation by user', async () => {
        // Arrange
        const expectedParentRoute = new ActivatedRoute();
        spyOnProperty(route, 'parent').and.returnValue(expectedParentRoute);
        const cancelButton = await page.cancelButton;

        // Act
        await cancelButton.click();

        // Assert
        expect(router.navigate).toHaveBeenCalledWith(['inspect', providedSimulation.id], {
          relativeTo: expectedParentRoute,
          fragment: component.tabIndex.toString(),
        });
      });

      it('should not take action on cancel while loading', async () => {
        // Arrange
        fixture.detectChanges();
        navigateSpy.calls.reset();
        const cancelButton = await page.cancelButton;

        // Act
        component.simulation = null;
        fixture.detectChanges();
        await cancelButton.click();

        // Assert
        expect(router.navigate).not.toHaveBeenCalled();
      });
    });
  });
});

function getTestSimulation(): Simulation {
  return {
    id: '111',
    name: 'ssss',
    description: 'ffffff',
    foodProduct: {
      companyCode: 'fsafsa',
      id: '4344bfa7-4bdc-48a7-8567-0e950d6e6f3e',
      name: 'Chicken Soup',
      owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
      standardCode: 'saffasf',
    },
    foodProductId: '4344bfa7-4bdc-48a7-8567-0e950d6e6f3e',
    modelIds: ['fec35815-d0a0-41af-a2cf-ef71c4b83147', 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29'],
    models: [
      {
        canExecute: true,
        id: 'fec35815-d0a0-41af-a2cf-ef71c4b83147',
        name: 'Test1',
        owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
        description: 'fsafsa',
      },
      {
        canExecute: true,
        id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29',
        name: 'Test1',
        owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
        description: 'fsafsa',
      },
    ],
  };
}

function getTestSimulationWithExecutions(id: string): SimulationWithExecutions {
  return {
    id,
    name: 'ssss',
    createdBy: { fullName: 'Full Name', username: 'username' },
    createdOn: 'May 4th',
    executions: [],
    description: 'ffffff',
    foodProduct: {
      companyCode: 'fsafsa',
      id: '4344bfa7-4bdc-48a7-8567-0e950d6e6f3e',
      name: 'Chicken Soup',
      owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
      standardCode: 'saffasf',
    },
    foodProductId: '4344bfa7-4bdc-48a7-8567-0e950d6e6f3e',
    modelIds: ['fec35815-d0a0-41af-a2cf-ef71c4b83147', 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29'],
    models: [
      {
        canExecute: true,
        id: 'fec35815-d0a0-41af-a2cf-ef71c4b83147',
        name: 'Test1',
        owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
        description: 'fsafsa',
      },
      {
        canExecute: true,
        id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29',
        name: 'Test1',
        owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
        description: 'fsafsa',
      },
    ],
  };
}

function getAvailableModels(): Model[] {
  return [
    {
      id: 'test',
      name: 'SHOULD_NOT_INCLUDE BECAUSE IT IS NOT CONNECTED',
      isConnected: false,
      description: '',
      price: 0,
      gatewayUrl: '',
      inputDescriptions: [],
      outputDescriptions: [],
    },
    {
      id: 'fec35815-d0a0-41af-a2cf-ef71c4b83147',
      name: 'SHOULD_NOT_INCLUDE ALREADY SELECTED',
      isConnected: true,
      description: '',
      price: 0,
      gatewayUrl: '',
      inputDescriptions: [],
      outputDescriptions: [],
    },
    {
      id: 'fec35815-d0a0-41af-a2cf-ef71c4b83148',
      name: 'name',
      isConnected: true,
      description: '',
      price: 0,
      gatewayUrl: '',
      inputDescriptions: [],
      outputDescriptions: [],
    },
  ];
}

function getAvailableProducts(): FoodProduct[] {
  return [
    {
      name: 'name',
      dosage: 0,
      dosageUnit: 'g',
      companyCode: 'fsafsa',
      id: '4344bfa7-4bdc-48a7-8567-0e950d6e6f3e',
      owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
      standardCode: 'saffasf',
      ingredients: [],
      packagings: [],
      processingSteps: [],
      foodProductProperties: [],
    },
    {
      name: 'name2',
      dosage: 20,
      dosageUnit: 'g',
      companyCode: 'fsafsa',
      id: '4444bfa7-4bdc-48a7-8567-0e950d6e6f3e',
      owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
      standardCode: 'saffasf',
      ingredients: [],
      packagings: [],
      processingSteps: [],
      foodProductProperties: [],
    },
  ];
}

function getTestUser(): UserProfile {
  return {
    companyId: '1',
    fullName: 'Full Name',
    username: 'username',
    company: {
      id: '1',
      name: 'Company A',
    },
    email: 'email@domain.com',
  };
}

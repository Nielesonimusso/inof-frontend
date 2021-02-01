import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InspectSimulationComponent } from './inspect-simulation.component';
import { RouterTestingModule } from '@angular/router/testing';
import { FoodProductService, SimulationService, UserService } from '../../../services';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement, Type } from '@angular/core';
import { By } from '@angular/platform-browser';
import {
  ExecutedSimulation,
  Model,
  SimulationWithExecutions,
  SimulationResults,
  ModelStatus,
  UserProfile,
} from '../../../models';
import { of, throwError } from 'rxjs';
import { MatButtonHarness } from '@angular/material/button/testing';
import { ComponentHarness, HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { routes } from '../../../routes';
import { CustomDateTimePipe } from '../../../utilities/custom-dateTime-pipe';
import { MatTableModule } from '@angular/material/table';
import { ModelStatusesPipe } from '../../../utilities/model-statuses-pipe';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { LoadingButtonComponent } from '../../../components';

/**
 * The Page helper class gives easy access to parts of the page relevant to testing such as input fields or buttons.
 * https://angular.io/guide/testing#use-a-page-object
 */
class Page {
  get runButton() {
    return this.queryHarness(MatButtonHarness, '#run');
  }

  get openFoodProductInspectButton() {
    return this.queryHarness(MatButtonHarness, '#open-food-product');
  }

  openModelInspectButton(i) {
    return this.queryHarness(MatButtonHarness, '#open-model-' + i);
  }

  get editButton() {
    return this.queryHarness(MatButtonHarness, '#edit');
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

describe('InspectSimulationComponent', () => {
  let component: InspectSimulationComponent;
  let fixture: ComponentFixture<InspectSimulationComponent>;
  let simulationService: jasmine.SpyObj<SimulationService>;
  let router: Router;
  let page: Page;
  let route: ActivatedRoute;
  let el: DebugElement;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    simulationService = jasmine.createSpyObj('SimulationService', ['getById', 'runById', 'getResultById']);
    simulationService.runById.and.returnValue(of(getTestExecutedSimulation()));
    simulationService.getResultById.and.returnValue(of(getTestResult()));
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    const userService = jasmine.createSpyObj('UserService', ['getUserProfile']);
    const profileSpy = userService.getUserProfile.and.returnValue(of(getTestUser()));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes), HttpClientTestingModule, MatTableModule, MatButtonModule],
      declarations: [InspectSimulationComponent, CustomDateTimePipe, ModelStatusesPipe, LoadingButtonComponent],
      providers: [
        { provide: SimulationService, useValue: simulationService },
        FoodProductService,
        { provide: UserService, useValue: userService },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InspectSimulationComponent);
    component = fixture.componentInstance;
    component.runButton = jasmine.createSpyObj('LoadingButtonComponent', ['completeLoading']);
    component.runTable = jasmine.createSpyObj('MatTable', ['renderRows']);
    router = TestBed.inject(Router);
    el = fixture.debugElement;
    const loader = TestbedHarnessEnvironment.loader(fixture);
    page = new Page(loader);
    route = TestBed.inject(ActivatedRoute);
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should show loading indicator if no simulation is set', async () => {
    // Arrange
    fixture.detectChanges();

    const loadingContainer = el.query(By.css('.loading-container'));

    // Assert
    expect(loadingContainer).toBeTruthy();
  });

  it('should show values correctly if a simulation is set', async () => {
    // Arrange
    const expected = getTestSimulationWithExecution();

    // Act
    component.simulationWithExecutions = expected;
    fixture.detectChanges();

    const foodProductCardActual = el.query(By.css('#simulationCardFoodProduct'));

    // Assert
    expect(foodProductCardActual.nativeElement.textContent).toContain(expected.foodProduct.name);
    expect(foodProductCardActual.nativeElement.textContent).toContain(expected.foodProduct.companyCode);
    expect(foodProductCardActual.nativeElement.textContent).toContain(expected.foodProduct.standardCode);
    for (let i = 0; i < expected.models.length; i++) {
      const modelCardActual = el.query(By.css('#simulationCardModel-' + i));
      expect(modelCardActual.nativeElement.textContent).toContain(expected.models[i].name);
      expect(modelCardActual.nativeElement.textContent).toContain(expected.models[i].description);
      expect(modelCardActual.nativeElement.textContent).toContain(expected.models[i].price);
    }
  });

  it('should attempt to run simulation', async () => {
    // Arrange
    fixture.detectChanges();
    const expected = getTestSimulationWithExecution();
    simulationService.runById.and.returnValue(of(getTestExecutedSimulation()));
    const runButton = await page.runButton;

    // Act
    component.simulationWithExecutions = expected;
    fixture.detectChanges();
    await fixture.whenStable();
    await runButton.click();

    // Assert
    expect(simulationService.runById).toHaveBeenCalledWith(expected.id);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Simulation run has been requested successfully',
      '',
      Object({ duration: 4000 })
    );
  });

  it('should attempt to open the inspect food product page', async () => {
    spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));
    component.simulationWithExecutions = getTestSimulationWithExecution();
    component.selectedFoodProduct = component.simulationWithExecutions.foodProduct;
    fixture.detectChanges();
    // Arrange
    const openButton = await page.openFoodProductInspectButton;
    const expectedURL = '/available-products/inspect/' + component.simulationWithExecutions.foodProduct.id;
    const windowSpy = spyOn(window, 'open');

    // Act
    await openButton.click();

    // Assert
    expect(windowSpy).toHaveBeenCalledWith(expectedURL, '_blank');
  });

  it('should attempt to open the inspect model page', async () => {
    spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));
    component.simulationWithExecutions = getTestSimulationWithExecution();
    component.selectedFoodProduct = component.simulationWithExecutions.foodProduct;
    fixture.detectChanges();
    // Arrange
    const openButton = await page.openModelInspectButton(0);
    const expectedURL = '/available-models/inspect/' + component.simulationWithExecutions.models[0].id;
    const windowSpy = spyOn(window, 'open');

    // Act
    await openButton.click();

    // Assert
    expect(windowSpy).toHaveBeenCalledWith(expectedURL, '_blank');
  });

  it('should attempt to open the edit simulation page', async () => {
    component.simulationWithExecutions = getTestSimulationWithExecution();
    fixture.detectChanges();
    // Arrange
    const editButton = fixture.debugElement.query(By.css('#edit'));

    // Assert
    expect(editButton.nativeElement.href).toContain(`edit/${component.simulationWithExecutions.id}`);
  });

  it('should get the Simulation from the service', () => {
    // Arrange
    spyOnProperty(route, 'paramMap').and.returnValue(of(convertToParamMap({ id: '1' })));
    simulationService.getById.and.returnValue(of(getTestSimulationWithExecution()));

    // Act
    fixture.detectChanges();

    // Assert
    expect(simulationService.getById).toHaveBeenCalledWith('1');
    expect(component.simulationWithExecutions).toEqual(getTestSimulationWithExecution());
  });

  it('should navigate to the error page if getting simulation fails', () => {
    // Arrange
    spyOnProperty(route, 'paramMap').and.returnValue(of(convertToParamMap({ id: '1' })));
    simulationService.getById.and.returnValue(throwError({}));
    spyOn(router, 'navigateByUrl');

    // Act
    fixture.detectChanges();

    // Assert
    expect(simulationService.getById).toHaveBeenCalledWith('1');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/error', { skipLocationChange: true });
  });
});

function getTestSimulationWithExecution(): SimulationWithExecutions {
  return {
    createdBy: { fullName: 'daanH', username: 'dh' },
    createdOn: '12:23 29/5/2020',
    description: 'ffffff',
    executions: [
      {
        createdBy: { fullName: 'Someone Else', username: 'someone' },
        createdOn: '2020-06-02T09:22:52.675638',
        simulationExecutionId: 'id-execution',
        simulation: {
          name: 'SimName',
          id: 'id-sim',
          owner: {
            name: 'Company ABC',
            id: 'id-company',
            address: 'ABC Street 12',
          },
        },
        executedModels: [
          {
            clientRunId: '4444',
            model: {
              id: 'fec35815-d0a0-41af-a2cf-ef71c4b83147',
              name: 'Test1',
              owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
            },
            modelExecutionId: '5678',
          },
        ],
      },
    ],
    foodProduct: {
      companyCode: 'fsafsa',
      id: '4344bfa7-4bdc-48a7-8567-0e950d6e6f3e',
      name: 'Chicken Soup',
      owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
      standardCode: 'saffasf',
    },
    foodProductId: 'e0883dba-81ab-47d2-8027-bdcc65957a56',
    id: '555',
    modelIds: ['111', '222'],
    models: [
      {
        canExecute: true,
        id: 'fec35815-d0a0-41af-a2cf-ef71c4b83147',
        name: 'Test1',
        owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
        description: 'ssa',
        price: 10,
      },
    ],
    name: 'ssss',
  };
}

function getTestModels(): Model[] {
  return [
    {
      name: 'Model 1',
      description: 'Description 1',
      price: 10,
      useCount: 0,
      createdBy: { username: 'admin', fullName: 'Full Name' },
      gatewayUrl: 'http://www.google.com',
      isConnected: true,
      inputDescriptions: [],
      outputDescriptions: [],
    },
    {
      name: 'Model 2',
      description: 'Description 2',
      price: 11,
      useCount: 1,
      createdBy: { username: 'admin 2', fullName: 'Full Name 2' },
      gatewayUrl: 'http://www.tue.nl',
      isConnected: false,
      inputDescriptions: [],
      outputDescriptions: [],
    },
    {
      name: 'Model 3',
      description: 'Description 2',
      price: 11,
      useCount: 1,
      createdBy: { username: 'admin 2', fullName: 'Full Name 2' },
      gatewayUrl: 'http://www.tue.nl',
      isConnected: false,
      inputDescriptions: [],
      outputDescriptions: [],
    },
  ];
}

function getTestExecutedSimulation(): ExecutedSimulation {
  return {
    createdBy: { fullName: 'daanH', username: 'dh' },
    createdOn: '12:23 29/5/2020',
    executedModels: [
      {
        clientRunId: '4444',
        model: {
          canExecute: true,
          id: 'fec35815-d0a0-41af-a2cf-ef71c4b83147',
          name: 'Test1',
          owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
        },
        modelExecutionId: '696969',
      },
    ],
    simulation: {
      name: 'abcd',
      id: 'aaa',
      owner: { name: 'ABXY', id: 'company-id', address: 'TU/e Campus' },
    },
    simulationExecutionId: 'ssss',
  };
}

function getTestResult(): SimulationResults {
  return {
    ...getTestExecutedSimulation(),
    results: [
      {
        createdOn: 'June 2nd, 2020',
        modelId: 'fec35815-d0a0-41af-a2cf-ef71c4b83147',
        modelName: 'Test1',
        ranOn: 'June 3rd, 2020',
        result: { a: 'res-a', b: 'res-b' },
        status: ModelStatus.success,
      },
    ],
  };
}

function getTestUser(): UserProfile {
  return {
    companyId: '1',
    fullName: 'Full Name',
    username: 'dh',
    company: {
      id: '1',
      name: 'Company A',
    },
    email: 'email@domain.com',
  };
}

import { SimulationsTableComponent } from './simulations-table.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader, ComponentHarness } from '@angular/cdk/testing';
import { Type, DebugElement } from '@angular/core';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { MatTableModule } from '@angular/material/table';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { SimulationService, UserService } from '../../services';
import { Simulation, ExecutedSimulation, UserProfile } from '../../models';
import { MatButtonHarness } from '@angular/material/button/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpResponse } from '@angular/common/http';

/**
 * The Page helper class gives easy access to parts of the page relevant to testing such as input fields or buttons.
 * https://angular.io/guide/testing#use-a-page-object
 */
class Page {
  get table() {
    return this.queryHarness(MatTableHarness, '.simulations-table-container');
  }

  get paginator() {
    return this.queryHarness(MatPaginatorHarness, '.mat-paginator');
  }

  getDeleteSimulationButton(i) {
    return this.queryHarness(MatButtonHarness, '#delete-button-' + i);
  }

  getRunSimulationButton(i) {
    return this.queryHarness(MatButtonHarness, '#run-button-' + i);
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

describe('SimulationsTableComponent', () => {
  let component: SimulationsTableComponent;
  let fixture: ComponentFixture<SimulationsTableComponent>;
  let loader: HarnessLoader;
  let page: Page;
  let el: DebugElement;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let deleteSimulationSpy: jasmine.Spy;
  let runSimulationSpy: jasmine.Spy;

  beforeEach(async () => {
    const simulationService = jasmine.createSpyObj(
      'SimulationService',
      ['deleteById', 'runById']
    ) as jasmine.SpyObj<SimulationService>;
    deleteSimulationSpy = simulationService.deleteById.and.returnValue(of(new HttpResponse({ status: 200 })));
    runSimulationSpy = simulationService.runById.and.returnValue(of(getTestExecutedSimulation()));
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    const userService = jasmine.createSpyObj('UserService', ['getUserProfile']);
    const profileSpy = userService.getUserProfile.and.returnValue(of(getTestUser()));

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatDialogModule,
        RouterTestingModule,
      ],
      declarations: [SimulationsTableComponent],
      providers: [
        { provide: SimulationService, useValue: simulationService },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: UserService, useValue: userService },
      ],
    });

    fixture = TestBed.createComponent(SimulationsTableComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    page = new Page(loader);
    el = fixture.debugElement;
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
    const table = await page.table;
    expect(table).toBeTruthy();
  });

  it('should show all columns', async (done) => {

    fixture.detectChanges();

    // Get header rows
    const table = await page.table;
    const headerRows = await table.getHeaderRows();
    expect(headerRows.length).toBe(1, 'expects one header row');

    const expectedColumnNames: string[] = ['Name', 'Owner', 'Food Product', 'Created By', 'Actions'];

    // Get text of first header row
    const text = await headerRows[0].getCellTextByIndex();
    // Check if it matches the expected columns count
    expect(text.length).toBe(expectedColumnNames.length, 'expects header to have same amount of columns');
    // For each column, check if it matches the expected value
    text.forEach((value, idx) => {
      expect(value).toBe(expectedColumnNames[idx], 'expects column names to match expected value');
    });
    done();
  });

  it('should display no rows if no rows are set', async () => {
    const table = await page.table;
    const rows = await table.getRows();
    expect(rows.length).toBe(0, 'expects 0 rows if no input is set');
  });

  it('should show all entries correctly', async () => {
    // Set the row
    const expectedSimulation = getTestSimulation();
    component.rows = [getTestSimulation()];

    // detect changes
    fixture.detectChanges();

    // Get regular data rows
    const table = await page.table;
    const rows = await table.getRows();
    expect(rows.length).toBe(1);

    for (const row of rows) {
      const text = await row.getCellTextByIndex();
      expect(text[0]).toBe(expectedSimulation.name);
      expect(text[1]).toBe(expectedSimulation.owner.name);
      expect(text[2]).toBe(expectedSimulation.foodProduct.name);
      expect(text[3]).toBe(expectedSimulation.createdBy.fullName);
    }
  });

  it('should show correct search bar placeholder', async () => {
    const searchBar = el.query(By.css('#searchBar'));
    expect(searchBar.nativeElement.textContent).toContain('Search Simulation');
  });

  it('should delete item when delete is pressed in the delete dialog', async () => {
    // Arrange
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null });
    dialogRefSpyObj.componentInstance = { body: '' };
    const openDialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    component.rows = [getTestSimulation()];
    // Act
    fixture.detectChanges();
    await (await page.getDeleteSimulationButton(0)).click();

    // Assert
    expect(openDialogSpy).toHaveBeenCalled();
    expect(deleteSimulationSpy).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Simulation deleted successfully', '', Object({ duration: 2000 }));
  });

  it('should not delete item when cancel is pressed in the delete dialog', async () => {
    // Arrange
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false), close: null });
    dialogRefSpyObj.componentInstance = { body: '' };
    const openDialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);

    component.rows = [getTestSimulation()];

    // Act
    fixture.detectChanges();
    await (await page.getDeleteSimulationButton(0)).click();

    // Assert
    expect(openDialogSpy).toHaveBeenCalled();
    expect(deleteSimulationSpy).not.toHaveBeenCalled();
  });

  it('should attempt to run', async () => {
    // Arrange

    component.rows = [getTestSimulation()];

    // Act
    fixture.detectChanges();
    await (await page.getRunSimulationButton(0)).click();

    // Assert
    expect(runSimulationSpy).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Simulation run has been requested successfully', '', {
      duration: 4000,
    });
  });

  it('should filter on name and company', async () => {
    // Set the rows
    component.rows = [
      // Matches name and company
      {
        name: 'Model A',
        owner: { id: '0', name: 'A', address: 'XYZ' },
        createdBy: { username: 'username', fullName: 'string' },
        description: 'DESCRIPTION A',
        foodProductId: 'f0',
        foodProduct: {
          name: 'A Product',
          companyCode: 'ABC124',
        },
        modelIds: [],
      },
      // Matches name
      {
        name: 'Model ABC',
        owner: { id: '0', name: 'B', address: 'XYZ' },
        createdBy: { username: 'username', fullName: 'string' },
        description: 'DESCRIPTION A',
        foodProductId: 'f0',
        foodProduct: {
          name: 'A Product',
          companyCode: 'ABC124',
        },
        modelIds: [],
      },
      // Matches Company
      {
        name: 'Model B',
        owner: { id: '0', name: 'A', address: 'XYZ' },
        createdBy: { username: 'username', fullName: 'string' },
        description: 'DESCRIPTION A',
        foodProductId: 'f0',
        foodProduct: {
          name: 'A Product',
          companyCode: 'ABC124',
        },
        modelIds: [],
      },
      // Matches none
      {
        name: 'Model D',
        owner: { id: '0', name: 'B', address: 'XYZ' },
        createdBy: { username: 'username', fullName: 'string' },
        description: 'DESCRIPTION A',
        foodProductId: 'f0',
        foodProduct: {
          name: 'A Product',
          companyCode: 'ABC124',
        },
        modelIds: [],
      },
    ];
    // Disable the sorting in non-sorting related tests as it introduces strange behaviour otherwise.
    component.sort = null;

    // detect changes, load rows
    fixture.detectChanges();
    // apply filter
    component.applyFilter('A');

    fixture.detectChanges();

    // Get regular data rows
    const table = await page.table;
    const rows = await table.getRows();
    const expectedModelNames = ['Model A', 'Model ABC', 'Model B'];
    expect(rows.length).toBe(expectedModelNames.length, 'expects amount of rows to match expectedModelNames count');

    for (let i = 0; i < rows.length; i++) {
      const values = await rows[i].getCellTextByIndex();
      expect(values[0]).toBe(expectedModelNames[i]);
    }
  });

  it('should paginate correctly', async () => {
    // Declare test model (to be repeated)
    const simulation: Simulation = getTestSimulation();

    // Set the rows of the table
    component.rows = [
      simulation,
      simulation,
      simulation,
      simulation,
      simulation,
      {
        id: '111',
        name: 'ssss2',
        description: 'ffffff',
        createdBy: { username: 'username', fullName: 'string' },
        owner: {
          id: 'string',
          name: 'string',
          address: 'string',
        },
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
      },
    ];

    component.sort = null;

    // Trigger change detection
    fixture.detectChanges();

    // Verify that there are 6 rows at default page size 10
    const table = await page.table;
    let rows = await table.getRows();
    expect(rows.length).toBe(6, 'expects 6 rows at default page size of 10');

    // Verify that 'ssss2' row is shown at index 5., and 'ssss' at index 0-4.
    const expectedSimulationNames = ['ssss', 'ssss', 'ssss', 'ssss', 'ssss', 'ssss2'];
    for (let i = 0; i < rows.length; i++) {
      const values = await rows[i].getCellTextByIndex();
      expect(values[0]).toBe(
        expectedSimulationNames[i],
        'expects simualtion names to match at default page size of 10'
      );
    }

    // Set page size to 5
    const paginator = await page.paginator;
    const pageSize = 5;
    await paginator.setPageSize(pageSize);

    // Trigger change detection
    fixture.detectChanges();

    // Verify that there are 5 rows at page size 5
    rows = await table.getRows();
    expect(rows.length).toBe(pageSize, 'expects 5 rows at first page with page size of 5');

    // Verify that the rows at first page with page size 5 all are 'Product 1'
    for (let i = 0; i < rows.length; i++) {
      const values = await rows[i].getCellTextByIndex();
      expect(values[0]).toBe(
        expectedSimulationNames[i],
        'expects simulation names to match at first page with page size of 5'
      );
    }

    // Go to next page
    await paginator.goToNextPage();

    // Trigger change detection
    fixture.detectChanges();

    // Verify that there is 1 row at second page with page size 5;
    rows = await table.getRows();
    expect(rows.length).toBe(1, 'expects 1 row at second page with page size of 5');

    // Verify that the row matches 'ssss2'
    for (let i = 0; i < rows.length; i++) {
      const values = await rows[i].getCellTextByIndex();
      expect(values[0]).toBe(
        expectedSimulationNames[pageSize + i],
        'expects product names to match at second page with page size of 5'
      );
    }
  });
});

function getTestSimulation(): Simulation {
  return {
    id: '111',
    name: 'ssss',
    description: 'ffffff',
    createdBy: { username: 'username', fullName: 'string' },
    owner: {
      id: 'string',
      name: 'string',
      address: 'string',
    },
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

function getTestExecutedSimulation(): ExecutedSimulation {
  return null;
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

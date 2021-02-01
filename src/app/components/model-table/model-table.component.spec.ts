import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader, ComponentHarness } from '@angular/cdk/testing';
import { Type, DebugElement } from '@angular/core';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { ModelTableComponent } from './model-table.component';
import { MatTableModule } from '@angular/material/table';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Model, UserProfile } from '../../models';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModelService, UserService } from '../../services';
import { of } from 'rxjs';
import { MatButtonHarness } from '@angular/material/button/testing';

/**
 * The Page helper class gives easy access to parts of the page relevant to testing such as input fields or buttons.
 * https://angular.io/guide/testing#use-a-page-object
 */
class Page {
  get table() {
    return this.queryHarness(MatTableHarness, '.model-table-container');
  }

  get paginator() {
    return this.queryHarness(MatPaginatorHarness, '.mat-paginator');
  }

  getDeleteModelButton(i) {
    return this.queryHarness(MatButtonHarness, '#delete-button-' + i);
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

describe('ModelTableComponent', () => {
  let component: ModelTableComponent;
  let fixture: ComponentFixture<ModelTableComponent>;
  let loader: HarnessLoader;
  let page: Page;
  let el: DebugElement;
  let snackBar: MatSnackBar;
  let modelService: any;
  let userService: any;

  beforeEach(async () => {
    modelService = jasmine.createSpyObj('ModelService', ['delete']);
    modelService.delete.and.returnValue(of({ status: 200 }));

    userService = jasmine.createSpyObj('UserService', ['getUserProfile']);

    userService.getUserProfile.and.returnValue(of(getTestUser()));

    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        MatDialogModule,
      ],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: ModelService, useValue: modelService },
        { provide: MatSnackBar, useValue: snackBar },
      ],
      declarations: [ModelTableComponent],
    });

    fixture = TestBed.createComponent(ModelTableComponent);
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

    const expectedColumnNames: string[] = [
      '',
      'Model name',
      'Description',
      'Price',
      'Usage',
      'Owner',
      'Creator',
      'Actions',
    ];

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
    const testModel: Model = {
      name: 'Model 1',
      description: 'Description 1',
      owner: { id: '1', name: 'Company ABC.XYZ', address: 'TU/e Campus' },
      createdBy: { fullName: 'Daan Hegger', username: 'dhegger' },
      price: 10,
      useCount: 22,
      gatewayUrl: 'http://localhost:8000',
      isConnected: true,
      inputDescriptions: [],
      outputDescriptions: [],
    };
    // Set the row
    component.rows = [testModel];

    // detect changes
    fixture.detectChanges();

    // Get regular data rows
    const table = await page.table;
    const rows = await table.getRows();
    expect(rows.length).toBe(1);

    for (const row of rows) {
      const text = await row.getCellTextByIndex();
      expect(text[0]).toBe('');
      expect(text[1]).toBe(testModel.name);
      expect(text[2]).toBe(testModel.description);
      expect(text[3]).toBe(`${testModel.price} €/call`);
      expect(text[4]).toBe(`${testModel.useCount} calls`);
      expect(text[5]).toBe(testModel.owner.name);
      expect(text[6]).toBe(testModel.createdBy.fullName);
    }
  });

  it('should filter on name and company', async () => {
    // Set the rows
    component.rows = [
      // Matches name and company
      {
        name: 'Model A',
        description: 'Description 1',
        owner: { name: 'Company Z', id: '1', address: 'TU/e Campus' },
        createdBy: { fullName: 'Daan Hegger', username: 'dhegger' },
        price: 10,
        useCount: 22,
        gatewayUrl: 'http://localhost:8000',
        isConnected: true,
        inputDescriptions: [],
        outputDescriptions: [],
      },
      // Matches name
      {
        name: 'Model ABC',
        description: 'Description 1',
        owner: { name: 'Z', id: '1', address: 'TU/e Campus' },
        createdBy: { fullName: 'Daan Hegger', username: 'dhegger' },
        price: 10,
        useCount: 22,
        gatewayUrl: 'http://localhost:8000',
        isConnected: true,
        inputDescriptions: [],
        outputDescriptions: [],
      },
      // Matches Company
      {
        name: 'Model B',
        description: 'Description 1',
        owner: { name: 'Company A', id: '1', address: 'TU/e Campus' },
        createdBy: { fullName: 'Daan Hegger', username: 'dhegger' },
        price: 10,
        useCount: 22,
        gatewayUrl: 'http://localhost:8000',
        isConnected: true,
        inputDescriptions: [],
        outputDescriptions: [],
      },
      // Matches none
      {
        name: 'Model C',
        description: 'Description 1',
        owner: { name: 'Y', id: '1', address: 'TU/e Campus' },
        createdBy: { fullName: 'Daan Hegger', username: 'dhegger' },
        price: 10,
        useCount: 22,
        gatewayUrl: 'http://localhost:8000',
        isConnected: true,
        inputDescriptions: [],
        outputDescriptions: [],
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
      expect(values[1]).toBe(expectedModelNames[i]);
    }
  });

  it('should paginate correctly', async () => {
    // Declare test model (to be repeated)
    const product: Model = {
      name: 'Model A',
      description: 'Description 1',
      owner: { id: '1', name: 'Company Z', address: 'TU/e Campus' },
      createdBy: { fullName: 'Daan Hegger', username: 'dhegger' },
      price: 10,
      useCount: 22,
      gatewayUrl: 'http://localhost:8000',
      isConnected: true,
      inputDescriptions: [],
      outputDescriptions: [],
    };

    // Set the rows of the table
    component.rows = [
      product,
      product,
      product,
      product,
      product,
      {
        name: 'Model B',
        description: 'Description 1',
        owner: { name: 'Company Z', id: '2', address: 'TU/e Campus' },
        createdBy: { fullName: 'Daan Hegger', username: 'dhegger' },
        price: 10,
        useCount: 22,
        gatewayUrl: 'http://localhost:8000',
        isConnected: true,
        inputDescriptions: [],
        outputDescriptions: [],
      },
    ];

    component.sort = null;

    // Trigger change detection
    fixture.detectChanges();

    // Verify that there are 6 rows at default page size 10
    const table = await page.table;
    let rows = await table.getRows();
    expect(rows.length).toBe(6, 'expects 6 rows at default page size of 10');

    // Verify that 'Model B' row is shown at index 5., and 'Model A' at index 0-4.
    const expectedModelNames = ['Model A', 'Model A', 'Model A', 'Model A', 'Model A', 'Model B'];
    for (let i = 0; i < rows.length; i++) {
      const values = await rows[i].getCellTextByIndex();
      expect(values[1]).toBe(expectedModelNames[i], 'expects model names to match at default page size of 10');
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

    // Verify that the rows at first page with page size 5 all are 'Model A'
    for (let i = 0; i < rows.length; i++) {
      const values = await rows[i].getCellTextByIndex();
      expect(values[1]).toBe(expectedModelNames[i], 'expects model names to match at first page with page size of 5');
    }

    // Go to next page
    await paginator.goToNextPage();

    // Trigger change detection
    fixture.detectChanges();

    // Verify that there is 1 row at second page with page size 5;
    rows = await table.getRows();
    expect(rows.length).toBe(1, 'expects 1 row at second page with page size of 5');

    // Verify that the row matches 'Model B'
    for (let i = 0; i < rows.length; i++) {
      const values = await rows[i].getCellTextByIndex();
      expect(values[1]).toBe(
        expectedModelNames[pageSize + i],
        'expects model names to match at second page with page size of 5'
      );
    }
  });

  it('should delete item when delete is pressed in the delete dialog', async () => {
    // Arrange
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null });
    dialogRefSpyObj.componentInstance = { body: '' };
    const openDialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);

    component.rows = [
      {
        name: 'Model A',
        description: 'Description 1',
        owner: { id: '1', name: 'Company Z', address: 'TU/e Campus' },
        createdBy: { fullName: 'Daan Hegger', username: 'dhegger' },
        price: 10,
        useCount: 22,
        gatewayUrl: 'http://localhost:8000',
        isConnected: true,
        inputDescriptions: [],
        outputDescriptions: [],
      },
    ];

    // Act
    fixture.detectChanges();
    await (await page.getDeleteModelButton(0)).click();

    // Assert
    expect(openDialogSpy).toHaveBeenCalled();
    expect(modelService.delete).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Model deleted successfully', '', Object({ duration: 2000 }));
  });

  it('should not delete item when cancel is pressed in the delete dialog', async () => {
    // Arrange
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false), close: null });
    dialogRefSpyObj.componentInstance = { body: '' };
    const openDialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);

    component.rows = [
      {
        name: 'Model A',
        description: 'Description 1',
        owner: { id: '1', name: 'Company Z', address: 'TU/e Campus' },
        createdBy: { fullName: 'Daan Hegger', username: 'dhegger' },
        price: 10,
        useCount: 22,
        gatewayUrl: 'http://localhost:8000',
        isConnected: true,
        inputDescriptions: [],
        outputDescriptions: [],
      },
    ];

    // Act
    fixture.detectChanges();
    await (await page.getDeleteModelButton(0)).click();

    // Assert
    expect(openDialogSpy).toHaveBeenCalled();
    expect(modelService.delete).not.toHaveBeenCalled();
  });

  it('should show correct search bar placeholder', async () => {
    const searchBar = el.query(By.css('#searchBar'));
    expect(searchBar.nativeElement.textContent).toContain('Search Model');
  });
});

function getTestUser(): UserProfile {
  return {
    companyId: '1',
    fullName: 'Full Name',
    username: 'dhegger',
    company: {
      id: '1',
      name: 'Company A',
    },
    email: 'email@domain.com',
  };
}

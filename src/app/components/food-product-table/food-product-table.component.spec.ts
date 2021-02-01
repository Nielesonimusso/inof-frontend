import { of } from 'rxjs';
import { Type, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader, ComponentHarness } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTableModule } from '@angular/material/table';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FoodProductTableComponent } from './food-product-table.component';
import { FoodProduct, UserProfile } from '../../models';
import { FoodProductService, UserService } from 'src/app/services';
import { MatButtonHarness } from '@angular/material/button/testing';
import { By } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * The Page helper class gives easy access to parts of the page relevant to testing such as input fields or buttons.
 * https://angular.io/guide/testing#use-a-page-object
 */
class Page {
  get table() {
    return this.queryHarness(MatTableHarness, '.foodproduct-table-container');
  }

  get paginator() {
    return this.queryHarness(MatPaginatorHarness, '.mat-paginator');
  }

  getDeleteFoodProductButton(i) {
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

describe('FoodProductTableComponent', () => {
  let component: FoodProductTableComponent;
  let fixture: ComponentFixture<FoodProductTableComponent>;
  let loader: HarnessLoader;
  let page: Page;
  let deleteFoodProductSpy: jasmine.Spy;
  let el: DebugElement;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const foodProductService = jasmine.createSpyObj('FoodProductService', ['delete']);
    deleteFoodProductSpy = foodProductService.delete.and.returnValue(of({ status: 200 }));

    const userService = jasmine.createSpyObj('UserService', ['getUserProfile']);
    const profileSpy = userService.getUserProfile.and.returnValue(of(getTestUser()));

    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatDialogModule,
      ],
      declarations: [FoodProductTableComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: FoodProductService, useValue: foodProductService },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });

    fixture = TestBed.createComponent(FoodProductTableComponent);
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

    const expectedColumnNames: string[] = ['Product Name', 'Company Code', 'Standard Code', 'Dosage', 'Actions'];

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
    const expectedProduct = getTestProduct();
    component.rows = [getTestProduct()];

    // detect changes
    fixture.detectChanges();

    // Get regular data rows
    const table = await page.table;
    const rows = await table.getRows();
    expect(rows.length).toBe(1);

    for (const row of rows) {
      const text = await row.getCellTextByIndex();
      expect(text[0]).toBe(expectedProduct.name);
      expect(text[1]).toBe(expectedProduct.companyCode);
      expect(text[2]).toBe(expectedProduct.standardCode);
      expect(text[3]).toBe(`${expectedProduct.dosage} ${expectedProduct.dosageUnit}`);
    }
  });

  it('should filter on name and company', async () => {
    // Set the rows
    component.rows = [
      // Matches name and companyCode
      {
        name: 'Product 6',
        companyCode: 'NL9876',
        standardCode: 'STANDAARD',
        dosage: 40,
        dosageUnit: 'mL',
        packagings: [],
        foodProductProperties: [],
        ingredients: [],
        processingSteps: [],
      },
      // Matches companyCode
      {
        name: 'Product 7',
        companyCode: 'NL6789',
        standardCode: 'STANDAARD',
        dosage: 40,
        dosageUnit: 'mL',
        packagings: [],
        foodProductProperties: [],
        ingredients: [],
        processingSteps: [],
      },
      // Matches name
      {
        name: 'Product 16',
        companyCode: 'NL1234',
        standardCode: 'STANDAARD',
        dosage: 40,
        dosageUnit: 'mL',
        packagings: [],
        foodProductProperties: [],
        ingredients: [],
        processingSteps: [],
      },
      // Matches none
      {
        name: 'Product 17',
        companyCode: 'NL1234',
        standardCode: 'STANDAARD',
        dosage: 40,
        dosageUnit: 'mL',
        packagings: [],
        foodProductProperties: [],
        ingredients: [],
        processingSteps: [],
      },
    ];

    // Disable the sorting in non-sorting related tests as it introduces strange behaviour otherwise.
    component.sort = null;

    // detect changes, load rows
    fixture.detectChanges();
    // apply filter '6'
    component.applyFilter('6');
    // detect changes, process filter
    fixture.detectChanges();

    // Get regular data rows
    const table = await page.table;
    const rows = await table.getRows();
    const expectedProductNames = ['Product 6', 'Product 7', 'Product 16'];
    expect(rows.length).toBe(
      expectedProductNames.length,
      'expects amount of rows to match length of expectedProductNames'
    );

    for (let i = 0; i < rows.length; i++) {
      const values = await rows[i].getCellTextByIndex();
      expect(values[0]).toBe(expectedProductNames[i], 'expects text of filtered rows to match certain product names');
    }
  });

  it('should paginate correctly', async () => {
    // Declare test model (to be repeated)
    const product: FoodProduct = getTestProduct();

    // Set the rows of the table
    component.rows = [
      product,
      product,
      product,
      product,
      product,
      {
        name: 'Product 2',
        companyCode: 'NL9876',
        standardCode: 'BE2',
        dosage: 40,
        dosageUnit: 'mL',
        packagings: [],
        foodProductProperties: [],
        ingredients: [],
        processingSteps: [],
      },
    ];
    component.sort = null;

    // Trigger change detection
    fixture.detectChanges();

    // Verify that there are 6 rows at default page size 10
    const table = await page.table;
    let rows = await table.getRows();
    expect(rows.length).toBe(6, 'expects 6 rows at default page size of 10');

    // Verify that 'Product 2' row is shown at index 5., and 'Product 1' at index 0-4.
    const expectedProductNames = ['Product 1', 'Product 1', 'Product 1', 'Product 1', 'Product 1', 'Product 2'];
    for (let i = 0; i < rows.length; i++) {
      const values = await rows[i].getCellTextByIndex();
      expect(values[0]).toBe(expectedProductNames[i], 'expects product names to match at default page size of 10');
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
        expectedProductNames[i],
        'expects product names to match at first page with page size of 5'
      );
    }

    // Go to next page
    await paginator.goToNextPage();

    // Trigger change detection
    fixture.detectChanges();

    // Verify that there is 1 row at second page with page size 5;
    rows = await table.getRows();
    expect(rows.length).toBe(1, 'expects 1 row at second page with page size of 5');

    // Verify that the row matches 'Product 2'
    for (let i = 0; i < rows.length; i++) {
      const values = await rows[i].getCellTextByIndex();
      expect(values[0]).toBe(
        expectedProductNames[pageSize + i],
        'expects product names to match at second page with page size of 5'
      );
    }
  });

  it('should delete item when delete is pressed in the delete dialog', async () => {
    // Arrange
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null });
    dialogRefSpyObj.componentInstance = { body: '' };
    const openDialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);

    component.rows = [getTestProduct()];

    // Act
    fixture.detectChanges();
    await (await page.getDeleteFoodProductButton(0)).click();

    // Assert
    expect(openDialogSpy).toHaveBeenCalled();
    expect(deleteFoodProductSpy).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Food Product deleted successfully', '', Object({ duration: 2000 }));
  });

  it('should not delete item when cancel is pressed in the delete dialog', async () => {
    // Arrange
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false), close: null });
    dialogRefSpyObj.componentInstance = { body: '' };
    const openDialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);

    component.rows = [getTestProduct()];

    // Act
    fixture.detectChanges();
    await (await page.getDeleteFoodProductButton(0)).click();

    // Assert
    expect(openDialogSpy).toHaveBeenCalled();
    expect(deleteFoodProductSpy).not.toHaveBeenCalled();
  });

  it('should show correct search bar placeholder', async () => {
    const searchBar = el.query(By.css('#searchBar'));
    expect(searchBar.nativeElement.textContent).toContain('Search Food Product');
  });
});

function getTestProduct(): FoodProduct {
  return {
    name: 'Product 1',
    createdBy: { fullName: 'Full Name', username: 'username123' },
    companyCode: 'NL9876',
    standardCode: 'BE2',
    dosage: 40,
    dosageUnit: 'mL',
    owner: { id: '1', name: 'Company 1', address: 'IDK' },
    packagings: [],
    foodProductProperties: [],
    processingSteps: [],
    ingredients: [],
  };
}

function getTestUser(): UserProfile {
  return {
    companyId: '1',
    fullName: 'Full Name',
    username: 'username123',
    company: {
      id: '1',
      name: 'Company A',
    },
    email: 'email@domain.com',
  };
}

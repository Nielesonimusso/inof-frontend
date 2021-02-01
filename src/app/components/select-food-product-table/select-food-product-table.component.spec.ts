import { SelectFoodProductTableComponent } from './select-food-product-table.component';
import { Type, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader, ComponentHarness } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTableModule } from '@angular/material/table';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { FoodProduct } from '../../models';

/**
 * The Page helper class gives easy access to parts of the page relevant to testing such as input fields or buttons.
 * https://angular.io/guide/testing#use-a-page-object
 */
class Page {
  get table() {
    return this.queryHarness(MatTableHarness, '#table');
  }

  get paginator() {
    return this.queryHarness(MatPaginatorHarness, '.mat-paginator');
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

describe('SelectFoodProductTableComponent', () => {
  let component: SelectFoodProductTableComponent;
  let fixture: ComponentFixture<SelectFoodProductTableComponent>;
  let loader: HarnessLoader;
  let page: Page;
  let el: DebugElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatDialogModule,
      ],
      declarations: [SelectFoodProductTableComponent],
      providers: [],
    });

    fixture = TestBed.createComponent(SelectFoodProductTableComponent);
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

  it('should show correct search bar placeholder', async () => {
    const searchBar = el.query(By.css('#searchBar'));
    expect(searchBar.nativeElement.textContent).toContain('Search Food Product');
  });

  it('should filter on name', async () => {
    // Set the rows
    component.rows = getTestFoodProduct();
    // Set displayed columns
    component.displayedColumns = ['name', 'companyCode', 'standardCode', 'select'];

    // detect changes, load rows
    fixture.detectChanges();
    // apply filter
    component.applyFilter('A');

    fixture.detectChanges();

    // Get regular data rows
    const table = await page.table;
    const rows = await table.getRows();
    const expectedFoodProductNames = ['name', 'does it matter what the name is really'];
    expect(rows.length).toBe(
      expectedFoodProductNames.length,
      'expects amount of rows to match expectedFoodProductNames count'
    );

    for (let i = 0; i < rows.length; i++) {
      const values = await rows[i].getCellTextByIndex();
      expect(values[0]).toBe(expectedFoodProductNames[i]);
    }
  });
});

function getTestFoodProduct(): FoodProduct[] {
  return [
    {
      name: 'name',
      companyCode: '83279',
      standardCode: '23857',
      dosage: 650,
      dosageUnit: 'g',
      packagings: [
        {
          name: 'packaging name',
          companyCode: '28973',
          standardCode: 'standard name',
          shape: 'box',
          thickness: 100,
          thicknessUnit: 'mm',
        },
        {
          name: 'packaging name 2',
          companyCode: '34578',
          standardCode: '29589',
          shape: 'box',
          thickness: 10,
          thicknessUnit: 'cm',
        },
      ],
      ingredients: [
        {
          name: 'Product 6',
          companyCode: 'NL9876',
          standardCode: 'STANDAARD',
          amount: 234,
          amountUnit: 'kg',
        },
      ],
      processingSteps: [
        {
          name: 'process',
          equipment: 'equipment',
          properties: [
            {
              name: 'propertyName',
              value: 389,
              unit: 'g',
            },
            {
              name: 'propertyName2',
              value: 72,
              unit: 'cg',
            },
            {
              name: 'propertyName3',
              value: 438,
              unit: 'mg',
            },
          ],
        },
        {
          name: 'process2',
          equipment: 'equipment2',
          properties: [
            {
              name: 'propertyName4',
              value: 39,
              unit: 'kg',
            },
          ],
        },
      ],
      foodProductProperties: [
        {
          name: 'Test Prop',
          value: 3,
          unit: 'kg',
          method: '?',
        },
      ],
    },
    {
      name: 'does it matter what the name is really',
      companyCode: '83279',
      standardCode: '23857',
      dosage: 650,
      dosageUnit: 'g',
      packagings: [
        {
          name: 'packaging name',
          companyCode: '28973',
          standardCode: 'standard name',
          shape: 'box',
          thickness: 100,
          thicknessUnit: 'mm',
        },
        {
          name: 'packaging name 2',
          companyCode: '34578',
          standardCode: '29589',
          shape: 'box',
          thickness: 10,
          thicknessUnit: 'cm',
        },
      ],
      ingredients: [
        {
          name: 'Product 6',
          companyCode: 'NL9876',
          standardCode: 'STANDAARD',
          amount: 234,
          amountUnit: 'kg',
        },
      ],
      processingSteps: [
        {
          name: 'process',
          equipment: 'equipment',
          properties: [
            {
              name: 'propertyName',
              value: 389,
              unit: 'g',
            },
            {
              name: 'propertyName2',
              value: 72,
              unit: 'cg',
            },
            {
              name: 'propertyName3',
              value: 438,
              unit: 'mg',
            },
          ],
        },
        {
          name: 'process2',
          equipment: 'equipment2',
          properties: [
            {
              name: 'propertyName4',
              value: 39,
              unit: 'kg',
            },
          ],
        },
      ],
      foodProductProperties: [
        {
          name: 'Test Prop',
          value: 3,
          unit: 'kg',
          method: '?',
        },
      ],
    },
  ];
}

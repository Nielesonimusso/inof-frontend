import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectIngredientsTableComponent } from './select-ingredients-table.component';
import { ComponentHarness, HarnessLoader } from '@angular/cdk/testing';
import { Type, DebugElement } from '@angular/core';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { IngredientMinimal } from 'src/app/models';
import { By } from '@angular/platform-browser';

class Page {
  get table() {
    return this.queryHarness(MatTableHarness, '#table');
  }

  get searchBar() {
    return this.queryHarness(MatFormFieldHarness, '#searchBar');
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

describe('SelectIngredientsTableComponent', () => {
  let component: SelectIngredientsTableComponent;
  let fixture: ComponentFixture<SelectIngredientsTableComponent>;
  let loader: HarnessLoader;
  let page: Page;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        NoopAnimationsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSortModule,
        MatPaginatorModule,
      ],
      declarations: [SelectIngredientsTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectIngredientsTableComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    page = new Page(loader);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show all columns', async () => {
    // Arrange
    const expectedColumnNames: string[] = ['Name', 'Company Code', 'Standard Code', ''];
    fixture.detectChanges();

    // Assert
    const table = await page.table;
    const headerRows = await table.getHeaderRows();
    expect(headerRows.length).toBe(1, 'expects one header row');

    const text = await headerRows[0].getCellTextByIndex();
    expect(text.length).toBe(expectedColumnNames.length, 'expects header to have same amount of columns');
    text.forEach((value, idx) => {
      expect(value).toBe(expectedColumnNames[idx], 'expects column names to match expected value');
    });
  });

  it('should display no rows if no rows are set', async () => {
    const table = await page.table;
    const rows = await table.getRows();
    expect(rows.length).toBe(0, 'expects 0 rows if no input is set');
  });

  it('should show all entries correctly', async () => {
    // Arrange
    const testEntries: IngredientMinimal[] = [
      {
        name: 'Product 6',
        companyCode: 'NL9876',
        standardCode: 'STANDAARD',
      },
    ];

    // Act
    component.rows = testEntries;
    fixture.detectChanges();

    // Assert
    const table = await page.table;
    const rows = await table.getRows();
    expect(rows.length).toBe(testEntries.length);

    for (let i = 0; i < testEntries.length; i++) {
      const text = await rows[i].getCellTextByIndex();
      expect(text[0]).toBe(testEntries[i].name);
      expect(text[1]).toBe(testEntries[i].companyCode);
      expect(text[2]).toBe(testEntries[i].standardCode);
      expect(text[3]).toBe('Add');
    }
  });

  it('should filter on name, companyCode and standardCode', async () => {
    // Arrange
    component.rows = [
      // Matches name, companyCode and standardCode
      {
        name: 'Product 6',
        companyCode: 'NL9876',
        standardCode: 'STAND6AARD',
      },
      // Matches name and companyCode
      {
        name: 'Product 26',
        companyCode: 'NL9876',
        standardCode: 'STANDAARD',
      },
      // Matches name and standardCode
      {
        name: 'Product 36',
        companyCode: 'NL9875',
        standardCode: 'STAN6DAARD',
      },
      // Matches companyCode and standardCode
      {
        name: 'Product 4',
        companyCode: 'NL9876',
        standardCode: 'STAN6DAARD',
      },
      // Matches companyCode
      {
        name: 'Product 7',
        companyCode: 'NL6789',
        standardCode: 'STANDAARD',
      },
      // Matches name
      {
        name: 'Product 16',
        companyCode: 'NL1234',
        standardCode: 'STANDAARD',
      },
      // Matches standardCode
      {
        name: 'Product 17',
        companyCode: 'NL1234',
        standardCode: 'STANDAARD6',
      },
      // Matches none
      {
        name: 'Product 18',
        companyCode: 'NL1234',
        standardCode: 'STANDAARD',
      },
    ];
    const expectedProductNames = [
      'Product 6',
      'Product 26',
      'Product 36',
      'Product 4',
      'Product 7',
      'Product 16',
      'Product 17',
    ];

    // Act
    fixture.detectChanges();
    component.applyFilter('6');
    fixture.detectChanges();

    // Assert
    const table = await page.table;
    const rows = await table.getRows();
    expect(rows.length).toBe(
      expectedProductNames.length,
      'expects amount of rows to match expectedProductNames length'
    );

    for (let i = 0; i < rows.length; i++) {
      const values = await rows[i].getCellTextByIndex();
      expect(values[0]).toBe(expectedProductNames[i], 'expects text of filtered rows to match certain product names');
    }
  });

  it('should emit itemAdded when the Add button is clicked', () => {
    // Arrange
    const ingredient: IngredientMinimal = {
      name: 'Product 6',
      companyCode: 'NL9876',
      standardCode: 'STANDAARD',
    };
    component.rows = [ingredient];
    spyOn(component.itemAdded, 'emit');

    // Act
    fixture.detectChanges();
    fixture.nativeElement.querySelector('#td-add-ingredient-0').click();

    // Assert
    expect(component.itemAdded.emit).toHaveBeenCalledWith(ingredient);
  });

  it('should show correct search bar placeholder', async () => {
    const searchBar = await page.searchBar;
    const searchBarLabel = await searchBar.getLabel();
    expect(searchBarLabel).toBe('Search Ingredients');
  });
});

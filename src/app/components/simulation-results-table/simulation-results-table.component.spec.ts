import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulationResultsTableComponent } from './simulation-results-table.component';
import { HarnessLoader, ComponentHarness } from '@angular/cdk/testing';
import { Type } from '@angular/core';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatTableModule } from '@angular/material/table';

/**
 * The Page helper class gives easy access to parts of the page relevant to testing such as input fields or buttons.
 * https://angular.io/guide/testing#use-a-page-object
 */
class Page {
  get table() {
    return this.queryHarness(MatTableHarness, '.results-table-container');
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

describe('SimulationResultsTableComponent', () => {
  let component: SimulationResultsTableComponent;
  let fixture: ComponentFixture<SimulationResultsTableComponent>;
  let page: Page;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatTableModule],
      declarations: [SimulationResultsTableComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulationResultsTableComponent);
    component = fixture.componentInstance;
    const loader = TestbedHarnessEnvironment.loader(fixture);
    page = new Page(loader);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show results correctly', async () => {
    // Arrange
    component.results = [
      { test1: 'abc', test2: 'def', test3: 'ghij' },
      { test1: 'klm', test2: 'nop', test3: 'qrst' },
    ];

    fixture.detectChanges();

    const table = await page.table;
    const rows = await table.getRows();
    const header = await table.getHeaderRows();

    expect(rows.length).toBe(component.results.length);
    expect(header.length).toBe(1);

    // Get columns
    const columns = await header[0].getCellTextByIndex();
    expect(columns.length).toBe(3);

    // For each row in table
    for (let i = 0; i < rows.length; i++) {
      // Get entries
      const values = await rows[i].getCellTextByIndex();
      // For each entry in row
      for (let j = 0; j < columns.length; j++) {
        // Expect entry to equal the property value (index by the column name of the entry)
        expect(values[j]).toBe(component.results[i][columns[j]]);
      }
    }
  });

  it('should return empty array of columns for invalid object', async () => {
    // Arrange
    component.results = [null, null];

    fixture.detectChanges();

    const table = await page.table;
    const rows = await table.getRows();
    const header = await table.getHeaderRows();

    expect(rows.length).toBe(component.results.length);
    expect(header.length).toBe(1);

    // Get columns
    const columns = await header[0].getCellTextByIndex();
    expect(columns.length).toBe(0);
  });
});

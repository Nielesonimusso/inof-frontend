import { SelectModelTableComponent } from './select-model-table.component';
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
import { Model } from '../../models';

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

describe('SelectModelTableComponent', () => {
  let component: SelectModelTableComponent;
  let fixture: ComponentFixture<SelectModelTableComponent>;
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
      declarations: [SelectModelTableComponent],
      providers: [],
    });

    fixture = TestBed.createComponent(SelectModelTableComponent);
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
    expect(searchBar.nativeElement.textContent).toContain('Search Model');
  });

  it('should filter on name', async () => {
    // Set the rows
    component.rows = getTestModel();
    // Set displayed columns
    component.displayedColumns = ['name', 'description', 'price', 'select'];

    // detect changes, load rows
    fixture.detectChanges();
    // apply filter
    component.applyFilter('soup');

    fixture.detectChanges();

    // Get regular data rows
    const table = await page.table;
    const rows = await table.getRows();
    const expectedFoodProductNames = ['tomato soup Model', 'chicken soup Model'];
    expect(rows.length).toBe(
      expectedFoodProductNames.length,
      'expects amount of rows to match expectedModelsNames count'
    );

    for (let i = 0; i < rows.length; i++) {
      const values = await rows[i].getCellTextByIndex();
      expect(values[0]).toBe(expectedFoodProductNames[i]);
    }
  });
});

function getTestModel(): Model[] {
  return [
    {
      id: '111111',
      name: 'tomato soup Model',
      description: 'Test Model Description',
      price: 12,
      gatewayUrl: 'http://localhost/gateway',
      isConnected: true,
      inputDescriptions: [],
      outputDescriptions: [],
    },
    {
      id: '22222',
      name: 'chicken soup Model',
      description: 'Test Model Description',
      price: 12,
      gatewayUrl: 'http://localhost/gateway',
      isConnected: true,
      inputDescriptions: [],
      outputDescriptions: [],
    },
  ];
}

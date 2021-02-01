import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulationResultsViewerComponent, smartParser } from './simulation-results-viewer.component';
import { MatTreeModule } from '@angular/material/tree';

describe('SimulationResultsViewerComponent', () => {
  let component: SimulationResultsViewerComponent;
  let fixture: ComponentFixture<SimulationResultsViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatTreeModule],
      declarations: [SimulationResultsViewerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulationResultsViewerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display results', () => {
    // Arrange
    component.results = [
      { test1: 'abc', test2: 'def', test3: 'ghij' },
      { test1: 'klm', test2: 'nop', test3: 'qrst' },
    ];

    fixture.detectChanges();

    expect(fixture.debugElement.nativeElement.textContent).toContain('Results');
    expect(fixture.debugElement.nativeElement.textContent).toContain(`list of ${component.results.length} item`);
  });

  describe('PARSING', () => {
    const PREFIX = 'prefix';
    const stringWithPrefix = (prefix: string, value: string) => `${prefix} ${value}`;
    it('should parse arrays', () => {
      // Expects to parse empty array correctly
      const resultEmpty = smartParser(PREFIX, []);
      expect(resultEmpty.label).toBe(stringWithPrefix(PREFIX, '(list of 0 item(s))'));

      // Expects to parse non-empty array correctly
      const expected = ['object', 'object2'];
      const resultEntries = smartParser('prefix', expected);
      expect(resultEntries.label).toBe(stringWithPrefix(PREFIX, '(list of 2 item(s))'));
      // Expects to have added the children to the TreeNode
      expect(resultEntries.children.length).toBe(expected.length);
      for (let i = 0; i < resultEntries.children.length; i++) {
        // Expects the labels of the children to be correct
        expect(resultEntries.children[i].label).toBe(stringWithPrefix(`Row ${i}:`, expected[i]));
      }
    });

    it('should parse objects', () => {
      // Expects to parse object without properties correctly
      const resultEmpty = smartParser(PREFIX, {});
      expect(resultEmpty.label).toBe(stringWithPrefix(PREFIX, '(0 properties)'));

      // Expects to parse object with properties correctly
      const expected = { key1: 'val1', key2: 'val2' };
      const resultProperty = smartParser(PREFIX, expected);
      expect(resultProperty.label).toBe(stringWithPrefix(PREFIX, '(2 properties)'));
      // Expects to have added the children to the TreeNode
      expect(resultProperty.children.length).toBe(2);

      let i = 0;
      for (const key in expected) {
        if (expected.hasOwnProperty(key)) {
          const value = expected[key];
          // Expects the labels of the children to be correct
          expect(resultProperty.children[i++].label).toBe(stringWithPrefix(`${key}:`, value));
        }
      }
    });

    it('should parse primitives', () => {
      // Expects to parse string correctly
      const resultString = smartParser(PREFIX, 'someString');
      expect(resultString.label).toBe(stringWithPrefix(`${PREFIX}:`, 'someString'));

      // Expects to parse boolean correctly
      let resultBoolean = smartParser(PREFIX, true);
      expect(resultBoolean.label).toBe(stringWithPrefix(`${PREFIX}:`, 'true'));
      resultBoolean = smartParser(PREFIX, false);
      expect(resultBoolean.label).toBe(stringWithPrefix(`${PREFIX}:`, 'false'));

      // Expects to parse number correctly
      let resultNumber = smartParser(PREFIX, 0.5);
      expect(resultNumber.label).toBe(stringWithPrefix(`${PREFIX}:`, '0.5'));
      resultNumber = smartParser(PREFIX, 123);
      expect(resultNumber.label).toBe(stringWithPrefix(`${PREFIX}:`, '123'));
      resultNumber = smartParser(PREFIX, 1e4);
      expect(resultNumber.label).toBe(stringWithPrefix(`${PREFIX}:`, '10000'));
    });

    it('should parse null', () => {
      // Expects to parse null correctly
      const resultNull = smartParser(PREFIX, null);
      expect(resultNull.label).toBe(stringWithPrefix(`${PREFIX}:`, 'null'));

      // Expects to parse undefined correctly
      const resultUndefined = smartParser(PREFIX, undefined);
      expect(resultUndefined.label).toBe(stringWithPrefix(`${PREFIX}:`, 'undefined'));
    });

    it('should parse non-renderables', () => {
      // Expects to parse function correctly
      const resultFn = smartParser(PREFIX, () => {});
      expect(resultFn.label).toBe(stringWithPrefix(`${PREFIX}:`, 'function'));
    });
  });
});

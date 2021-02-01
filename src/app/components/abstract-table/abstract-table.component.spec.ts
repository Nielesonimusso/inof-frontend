import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractTableComponent } from './abstract-table.component';

class TestTableComponent extends AbstractTableComponent<{ name: string }> {}

describe('AbstractTableComponent', () => {
  let component: TestTableComponent;
  let fixture: ComponentFixture<TestTableComponent>;

  beforeEach(async () => {

    TestBed.configureTestingModule({
      imports: [],
      declarations: [AbstractTableComponent],
      providers: [],
    });

    fixture = TestBed.createComponent(TestTableComponent);
    component = fixture.componentInstance;

  });

  it('should sort correctly', async () => {
    const actualLowerCaseName = [
      {
        name: 'Model D',
      },
      {
        name: 'Model ABC',
      },
      {
        name: 'Model B',
      },
      {
        name: 'Model A',
      },
      {
        name: 'Model Z',
      },
    ];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < actualLowerCaseName.length; i++) {
      const expectedLowerCaseName = component.sortingDataAccessor(actualLowerCaseName[i], 'name');
      expect(expectedLowerCaseName).toBe(actualLowerCaseName[i].name.toLowerCase());
    }
  });

});




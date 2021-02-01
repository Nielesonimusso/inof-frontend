import { TestBed, async, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { EmptyComponent } from '../../testing/empty.component';

const testRoutes = [
  {
    path: 'test',
    data: {
      name: 'Test 1',
    },
    children: [
      {
        path: '',
        component: EmptyComponent,
      },
      {
        path: 'route',
        component: EmptyComponent,
        data: {
          name: 'Test 2',
        },
      },
      {
        path: 'route2',
        component: EmptyComponent,
        children: [
          {
            path: '3',
            component: EmptyComponent,
            data: {
              name: 'Test 3',
            },
          },
        ],
      },
      {
        path: 'id-test/:id',
        component: EmptyComponent,
        data: {
          name: 'ID TEST',
        },
      },
    ],
  },
];

describe('MainComponent', () => {
  let router: Router;
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(testRoutes)],
      declarations: [MainComponent],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'INoF'`, () => {
    expect(component.title).toEqual('INoF');
  });

  it('should show sidebar', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('app-sidebar')).toBeTruthy();
  });

  it('should show the correct breadcrumb', fakeAsync(() => {
    router.navigateByUrl('/test/route');
    tick();
    fixture.detectChanges();
    const breadcrumbs = fixture.nativeElement.querySelectorAll('#breadcrumbs a');
    expect(breadcrumbs.length).toBe(2);
    expect(breadcrumbs[0].innerText).toBe('Test 1');
    expect(breadcrumbs[1].innerText).toBe('Test 2');
  }));

  it('should only show breadcrumb if name is set', fakeAsync(() => {
    router.navigateByUrl('/test/route2/3');
    tick();
    fixture.detectChanges();
    const breadcrumbs = fixture.nativeElement.querySelectorAll('#breadcrumbs a');
    expect(breadcrumbs.length).toBe(2);
    expect(breadcrumbs[0].innerText).toBe('Test 1');
    expect(breadcrumbs[1].innerText).toBe('Test 3');
  }));

  it('should show link correctly when route has id parameter', fakeAsync(() => {
    router.navigateByUrl('/test/id-test/3');
    tick();
    fixture.detectChanges();
    const breadcrumbs = fixture.nativeElement.querySelectorAll('#breadcrumbs a');
    expect(breadcrumbs.length).toBe(2);
    expect(breadcrumbs[0].innerText).toBe('Test 1');
    expect(breadcrumbs[1].innerText).toBe('ID TEST');
    expect(breadcrumbs[1].href).toBe(`${breadcrumbs[0].href}/id-test/3`);
  }));
});

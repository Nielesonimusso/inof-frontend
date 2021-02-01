import { Component } from '@angular/core/';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { SidebarComponent } from './sidebar.component';
import { SidePanelLocation, AppRoute } from '../../routes.types';
import { EmptyComponent } from '../../testing/empty.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  const path = 'path';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path, component: EmptyComponent }])],
      declarations: [SidebarComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show title', () => {
    const image = fixture.nativeElement.querySelector('div.logo img');
    expect(image).toBeTruthy();
    expect(image.alt).toBe('Internet Of Food');
  });

  it('should show top routes correctly', (done) => {
    showRoutes(SidePanelLocation.top, 'a.top-aligned', done);
  });

  it('should show bottom routes correctly', (done) => {
    showRoutes(SidePanelLocation.bottom, 'a.bottom-aligned', done);
  });

  const showRoutes = (location: SidePanelLocation, selector: string, done: () => void) => {
    // Declare names of the links
    const expectedNames = ['appear', 'appear_2'];
    // The expected path
    const expectedPath = '/' + path;
    // Generate routes from the expected names.
    const routes: AppRoute[] = expectedNames.map((name) => {
      return {
        path,
        component: EmptyComponent,
        data: {
          name,
          location,
        },
      };
    });

    // Set location opposite of the passed parameter
    const opposedLocation = location === SidePanelLocation.top ? SidePanelLocation.bottom : SidePanelLocation.top;

    // Add data that should not appear
    routes.push({
      path,
      component: EmptyComponent,
      data: {
        name: 'SHOULD_NOT_APPEAR',
        location: opposedLocation,
      },
    });
    routes.push({
      path,
      component: EmptyComponent,
      data: { name: 'SHOULD_NOT_APPEAR' },
    });
    // Set the component's routes value
    component.setRoutes = routes;

    // Check for changes
    fixture.detectChanges();
    // Wait until element is stable (has processed changes)
    fixture.whenStable().then(() => {
      // Get all link-elements
      const elements = fixture.debugElement.queryAll(By.css(selector));
      // Should have equal amount of link-elements as expected names
      // If larger, then the fake data appears
      // If smaller, no data or the wrong data appeared
      // If equal, it can still be the wrong data, hence we check for the names of the elements
      expect(elements.length).toBe(expectedNames.length);
      for (let i = 0; i < elements.length; i++) {
        // Each element:
        const element = elements[i];
        // (1) must exist
        expect(element.nativeElement).toBeTruthy();
        // (2) must have a href attribute of the expectedPath
        expect(element.nativeElement.getAttribute('href')).toBe(expectedPath);
        // (3) must have the expected name
        expect(element.nativeElement.textContent).toBe(expectedNames[i]);
      }
      done();
    });
  };
});

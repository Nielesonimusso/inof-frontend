import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulationComponent } from './my-simulation.component';
import { SimulationService } from '../../../services';
import { of, throwError } from 'rxjs';
import { Simulation } from '../../../models';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('MySimulationComponent', () => {
  let component: SimulationComponent;
  let fixture: ComponentFixture<SimulationComponent>;
  let service: SimulationService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [SimulationComponent],
      providers: [SimulationService],
    }).compileComponents();

    service = TestBed.inject(SimulationService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SimulationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display my simulations from backend', () => {
    // Arrange
    const spy = spyOn(service, 'getMySimulations').and.returnValue(of(getTestSimulations()));

    // Act
    fixture.detectChanges();

    // Assert
    expect(spy).toHaveBeenCalled();
    expect(component.rows).toEqual(getTestSimulations());
  });

  it('should navigate to error page on error', () => {
    // Arrange
    const navigateByUrl = spyOn(router, 'navigateByUrl');
    const getMySimulationsSpy = spyOn(service, 'getMySimulations').and.returnValue(throwError({}));

    // Act
    fixture.detectChanges();

    // Assert
    expect(getMySimulationsSpy).toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalledWith('/error', { skipLocationChange: true });
  });
});

function getTestSimulations(): Simulation[] {
  return [
    {
      modelIds: ['111', '222'],
      createdBy: { fullName: 'Mr. Admin', username: 'admin' },
      createdOn: '2020-05-27T09:41:09.812226',
      description: '111',
      foodProduct: {
        companyCode: 'fsafsa',
        id: '4344bfa7-4bdc-48a7-8567-0e950d6e6f3e',
        name: 'Chicken Soup',
        owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
        standardCode: 'saffasf',
      },
      foodProductId: 'e0883dba-81ab-47d2-8027-bdcc65957a56',
      models: [
        {
          canExecute: true,
          id: 'fec35815-d0a0-41af-a2cf-ef71c4b83147',
          name: 'Test1',
          owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
        },
      ],
      name: 'aaaaa',
      owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
    },
    {
      modelIds: ['111', '222'],
      createdBy: { fullName: 'Mr. Admin', username: 'admin' },
      createdOn: '2020-05-27T09:36:02.662225',
      description: 'tttetet',
      foodProduct: {
        companyCode: 'fsafsa',
        id: '4344bfa7-4bdc-48a7-8567-0e950d6e6f3e',
        name: 'Chicken Soup',
        owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
        standardCode: 'saffasf',
      },
      foodProductId: 'cbbcef46-6db5-468c-a033-d42ce7a30fa0',
      models: [
        {
          canExecute: true,
          id: 'fec35815-d0a0-41af-a2cf-ef71c4b83147',
          name: 'Test1',
          owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
        },
        {
          canExecute: true,
          id: '969914d0-c548-44f3-9e2d-d15a80095938',
          name: 'saffsa',
          owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
        },
        {
          canExecute: true,
          id: '4dd246c2-8cad-4fa9-bc30-628b7a238b36',
          name: 'fqafqwafa',
          owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
        },
      ],
      name: 'fff',
      owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
    },
  ];
}

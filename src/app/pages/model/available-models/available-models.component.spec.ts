import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AvailableModelsComponent } from './available-models.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ModelService } from '../../../services';
import { Model } from '../../../models';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('AvailableModelsComponent', () => {
  let component: AvailableModelsComponent;
  let fixture: ComponentFixture<AvailableModelsComponent>;
  let service: ModelService;
  let router: Router;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [AvailableModelsComponent],
      providers: [{ provide: MatSnackBar, useValue: snackBar }],
    }).compileComponents();
    service = TestBed.inject(ModelService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AvailableModelsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display available model from backend', () => {
    const spy = spyOn(service, 'availableModels').and.returnValue(of(getTestModels()));

    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
    expect(component.rows).toEqual(getTestModels());
  });

  it('should redirect to the error page if getting model fails', () => {
    // Arrange
    const navigateByUrlSpy = spyOn(router, 'navigateByUrl');
    const spy = spyOn(service, 'availableModels').and.returnValue(throwError({}));

    // Act
    fixture.detectChanges();

    // Assert
    expect(spy).toHaveBeenCalled();
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/error', { skipLocationChange: true });
  });

  // TODO when tests are written for this component this can be moved to the it() that test deletion function
  // expect(snackBar.open).toHaveBeenCalledWith('Model deleted successfully', '', Object({ duration: 2000 }));
});

function getTestModels(): Model[] {
  return [
    {
      name: 'Model 1',
      description: 'Description 1',
      price: 10,
      useCount: 0,
      createdBy: { username: 'admin', fullName: 'Full Name' },
      gatewayUrl: 'http://www.google.com',
      isConnected: true,
      inputDescriptions: [],
      outputDescriptions: [],
    },
    {
      name: 'Model 2',
      description: 'Description 2',
      price: 11,
      useCount: 1,
      createdBy: { username: 'admin 2', fullName: 'Full Name 2' },
      gatewayUrl: 'http://www.tue.nl',
      isConnected: false,
      inputDescriptions: [],
      outputDescriptions: [],
    },
  ];
}

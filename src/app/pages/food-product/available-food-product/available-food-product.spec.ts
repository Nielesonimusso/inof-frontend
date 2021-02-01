import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvailableFoodProductComponent } from './available-food-product.component';
import { FoodProduct } from 'src/app/models';
import { FoodProductService } from '../../../services';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('AvailableFoodProductsComponent', () => {
  let component: AvailableFoodProductComponent;
  let fixture: ComponentFixture<AvailableFoodProductComponent>;
  let router: Router;
  let getAvailableFoodProductSpy: jasmine.Spy;

  beforeEach(async () => {
    const foodProductService = jasmine.createSpyObj('FoodProductService', ['getAvailable']);
    getAvailableFoodProductSpy = foodProductService.getAvailable.and.returnValue(of(getTestProducts()));

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AvailableFoodProductComponent],
      providers: [{ provide: FoodProductService, useValue: foodProductService }],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AvailableFoodProductComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should display food products from backend', () => {
    fixture.detectChanges();

    expect(getAvailableFoodProductSpy.calls.any()).toBe(true);
    expect(component.foodProducts).toEqual(getTestProducts());
  });

  it('should navigate to error page on error', () => {
    // Arrange
    const navigateByUrl = spyOn(router, 'navigateByUrl');
    getAvailableFoodProductSpy.and.returnValue(throwError({}));

    // Act
    fixture.detectChanges();

    // Assert
    expect(getAvailableFoodProductSpy).toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalledWith('/error', { skipLocationChange: true });
  });
});

function getTestProducts(): FoodProduct[] {
  return [
    {
      name: 'Bean and Pea soup',
      companyCode: '234798',
      standardCode: '278913',
      dosage: 48,
      dosageUnit: 'mL',
      owner: { name: 'Company A', id: '1', address: '5626VA' },
      packagings: [],
      foodProductProperties: [],
      ingredients: [],
      processingSteps: [],
    },
    {
      name: 'Tomato soup',
      companyCode: '234798',
      standardCode: '278913',
      dosage: 48,
      dosageUnit: 'mL',
      owner: { name: 'Company A', id: '1', address: '5626VA' },
      packagings: [],
      foodProductProperties: [],
      ingredients: [],
      processingSteps: [],
    },
    {
      name: 'Bean and Pea soup',
      companyCode: '234798',
      standardCode: '278913',
      dosage: 48,
      dosageUnit: 'mL',
      owner: { name: 'Company A', id: '1', address: '5626VA' },
      packagings: [],
      foodProductProperties: [],
      ingredients: [],
      processingSteps: [],
    },
  ];
}

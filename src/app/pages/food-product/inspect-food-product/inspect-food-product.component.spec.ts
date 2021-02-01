import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { throwError, of } from 'rxjs';
import { InspectFoodProductComponent } from './inspect-food-product.component';
import { FoodProduct, FoodProductPermission, UserProfile } from 'src/app/models';
import { FoodProductService, UserService } from 'src/app/services';
import { HttpClientModule } from '@angular/common/http';

describe('InspectFoodProductComponent', () => {
  let component: InspectFoodProductComponent;
  let fixture: ComponentFixture<InspectFoodProductComponent>;
  let router: Router;
  let getByIdSpy: jasmine.Spy;
  let getPermissionsSpy: jasmine.Spy;
  let getUserProfileSpy: jasmine.Spy;

  beforeEach(async () => {
    const foodProductService = jasmine.createSpyObj('FoodProductService', ['getById', 'getPermissions']);
    const userService = jasmine.createSpyObj('UserService', ['getUserProfile']);
    getUserProfileSpy = userService.getUserProfile.and.returnValue(of(getTestUserProfile()));
    getByIdSpy = foodProductService.getById.and.returnValue(of(getTestFoodProduct()));
    getPermissionsSpy = foodProductService.getPermissions.and.returnValue(of(getTestPermissions()));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule],
      declarations: [InspectFoodProductComponent],
      providers: [
        { provide: FoodProductService, useValue: foodProductService },
        { provide: UserService, useValue: userService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    const activatedRoute = TestBed.inject(ActivatedRoute);
    spyOnProperty(activatedRoute, 'paramMap').and.returnValue(of(convertToParamMap({ id: '1' })));
    fixture = TestBed.createComponent(InspectFoodProductComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the Food Product from backend when id is given', () => {
    fixture.detectChanges();

    expect(getByIdSpy).toHaveBeenCalled();
    expect(getUserProfileSpy).toHaveBeenCalled();
    expect(getPermissionsSpy).toHaveBeenCalled();
  });

  it('should navigate to error page on error', () => {
    // Arrange
    const navigateByUrl = spyOn(router, 'navigateByUrl');
    getByIdSpy.and.returnValue(throwError({}));

    // Act
    fixture.detectChanges();

    // Assert
    expect(getByIdSpy).toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalledWith('/error', { skipLocationChange: true });
  });
});

function getTestPermissions(): FoodProductPermission[] {
  return [
    {
      company: {
        id: '3',
        name: 'Company A',
      },
      companyId: '555',
      foodProduct: getTestFoodProduct(),
      foodProductId: '44',
    },
  ];
}

function getTestFoodProduct(): FoodProduct {
  return {
    name: 'name',
    companyCode: '83279',
    standardCode: '23857',
    dosage: 650,
    dosageUnit: 'g',
    createdBy: {
      username: 'myUserName',
      fullName: 'full name',
    },
    owner: {
      id: '1',
      address: 'my street 13',
      name: 'some name',
    },
    packagings: [
      {
        name: 'packaging name',
        companyCode: '28973',
        standardCode: 'standard name',
        shape: 'box',
        thickness: 100,
        thicknessUnit: 'mm',
      },
      {
        name: 'packaging name 2',
        companyCode: '34578',
        standardCode: '29589',
        shape: 'box',
        thickness: 10,
        thicknessUnit: 'cm',
      },
    ],
    ingredients: [
      {
        name: 'Product 6',
        companyCode: 'NL9876',
        standardCode: 'STANDAARD',
        amount: 234,
        amountUnit: 'kg',
      },
    ],
    processingSteps: [
      {
        name: 'process',
        equipment: 'equipment',
        properties: [
          {
            name: 'propertyName',
            value: 389,
            unit: 'g',
          },
          {
            name: 'propertyName2',
            value: 72,
            unit: 'cg',
          },
          {
            name: 'propertyName3',
            value: 438,
            unit: 'mg',
          },
        ],
      },
      {
        name: 'process2',
        equipment: 'equipment2',
        properties: [
          {
            name: 'propertyName4',
            value: 39,
            unit: 'kg',
          },
        ],
      },
    ],
    foodProductProperties: [
      {
        name: 'Test Prop',
        value: 3,
        unit: 'kg',
        method: '?',
      },
    ],
  };
}

function getTestUserProfile(): UserProfile {
  return {
    companyId: '1',
    fullName: 'Full Name',
    username: 'username123',
    company: {
      id: '1',
      name: 'Company A',
    },
    email: 'email@domain.com',
  };
}

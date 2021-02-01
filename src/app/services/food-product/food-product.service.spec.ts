import { TestBed } from '@angular/core/testing';
import { FoodProductService } from './food-product.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { FoodProduct, FoodProductPermission, Ingredient } from 'src/app/models';
import { AuthService } from '../auth';

describe('FoodProductService', () => {
  let service: FoodProductService;
  let httpMock: HttpTestingController;

  const expectedId = '10';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FoodProductService, AuthService],
    });
    service = TestBed.inject(FoodProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  describe('getOwn', () => {
    const url = `${environment.API_ROOT}/api/own_products`;
    it('should make call to http client', () => {
      const expected: FoodProduct = getTestFoodProduct(expectedId);

      service.getOwn().subscribe((products) => {
        expect(products).toEqual([expected]);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('GET');
      request.flush([expected]);
    });
  });

  describe('getById', () => {
    const url = `${environment.API_ROOT}/api/product/${expectedId}`;
    it('should make call to http client', () => {
      const expected: FoodProduct = getTestFoodProduct(expectedId);

      service.getById(expectedId).subscribe((product) => {
        expect(product).toEqual(expected);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('GET');
      request.flush(expected);
    });
  });

  describe('getPermissions', () => {
    const url = `${environment.API_ROOT}/api/product/permissions/${expectedId}`;
    it('should make call to http client', () => {
      const expected: FoodProductPermission[] = getTestPermissions();

      service.getPermissions(expectedId).subscribe(() => {});

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('GET');
      request.flush(expected);
    });
  });

  describe('getIngredients', () => {
    const url = `${environment.API_ROOT}/api/product/ingredients`;
    it('should make call to http client', () => {
      const expected: Ingredient[] = getTestFoodProduct(expectedId).ingredients;

      service.getIngredients().subscribe((ingredients) => {
        expect(ingredients).toEqual(expected);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('GET');
      request.flush(expected);
    });
  });

  describe('add', () => {
    const url = `${environment.API_ROOT}/api/product`;
    it('should make call to http client', () => {
      const expected: FoodProduct = getTestFoodProduct(expectedId);

      service.add(expected).subscribe((run) => {
        expect(run).toEqual(expected);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('POST');
      request.flush(expected);
    });
  });

  describe('update', () => {
    const url = `${environment.API_ROOT}/api/product/${expectedId}`;
    it('should make call to http client', () => {
      const expected: FoodProduct = getTestFoodProduct(expectedId);

      service.update(getTestFoodProduct(expectedId)).subscribe((run) => {
        expect(run).toEqual(expected);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('PUT');
      request.flush(expected);
    });
  });

  describe('updatePermissions', () => {
    const url = `${environment.API_ROOT}/api/product/permissions/${expectedId}`;
    it('should make call to http client', () => {
      const expected: FoodProductPermission = getTestPermissions()[0];

      service.updatePermissions(expectedId, ['222', '233']).subscribe(() => {});

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('PUT');
      request.flush(expected);
    });
  });

  describe('delete', () => {
    const url = `${environment.API_ROOT}/api/product/${expectedId}`;
    it('should make call to http client', () => {
      const expected: FoodProduct = getTestFoodProduct(expectedId);

      service.delete(expectedId).subscribe(() => {});

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('DELETE');
      request.flush(expected);
    });
  });
});

function getTestPermissions(): FoodProductPermission[] {
  return [
    {
      company: {
        id: '1',
        name: 'Company A',
      },
      companyId: '555',
      foodProduct: getTestFoodProduct('44'),
      foodProductId: '44',
    },
  ];
}

function getTestFoodProduct(id: string): FoodProduct {
  return {
    id,
    name: 'name',
    companyCode: '83279',
    standardCode: '23857',
    dosage: 650,
    dosageUnit: 'g',
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

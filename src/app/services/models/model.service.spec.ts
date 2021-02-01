import { TestBed } from '@angular/core/testing';
import { ModelService } from './model.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FoodProductPermission, Model, ModelPermission, ModelPermissionType } from 'src/app/models';
import { environment } from 'src/environments/environment';

describe('ModelService', () => {
  let service: ModelService;
  let httpMock: HttpTestingController;

  const expectedId = '11';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ModelService],
    });
    service = TestBed.inject(ModelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  describe('ownModels', () => {
    const url = `${environment.API_ROOT}/api/own_models`;
    it('should make call to http client', () => {
      const expected: Model = getTestModel(expectedId);

      service.ownModels().subscribe((products) => {
        expect(products).toEqual([expected]);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('GET');
      request.flush([expected]);
    });
  });

  describe('get', () => {
    const url = `${environment.API_ROOT}/api/model/${expectedId}`;
    it('should make call to http client', () => {
      const expected: Model = getTestModel(expectedId);

      service.get(expectedId).subscribe((product) => {
        expect(product).toEqual(expected);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('GET');
      request.flush(expected);
    });
  });

  describe('create', () => {
    const url = `${environment.API_ROOT}/api/model`;
    it('should make call to http client', () => {
      const expected: Model = getTestModel(expectedId);

      service.create(expected).subscribe((run) => {
        expect(run).toEqual(expected);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('POST');
      request.flush(expected);
    });
  });

  describe('update', () => {
    const url = `${environment.API_ROOT}/api/model/${expectedId}`;
    it('should make call to http client', () => {
      const expected: Model = getTestModel(expectedId);

      service.update(expected).subscribe((run) => {
        expect(run).toEqual(expected);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('PUT');
      request.flush(expected);
    });
  });

  describe('delete', () => {
    const url = `${environment.API_ROOT}/api/model/${expectedId}`;
    it('should make call to http client', () => {
      const expected: Model = getTestModel(expectedId);

      service.delete(expectedId).subscribe(() => {});

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('DELETE');
      request.flush(expected);
    });
  });

  describe('updatePermissions', () => {
    const url = `${environment.API_ROOT}/api/model/permissions/${expectedId}`;
    it('should make call to http client', () => {
      const expected: ModelPermission[] = getTestPermissions();

      service.updatePermissions(expectedId, getTestPermissions()).subscribe(() => {});

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('PUT');
      request.flush(expected);
    });
  });

  describe('getPermissions', () => {
    const url = `${environment.API_ROOT}/api/model/permissions/${expectedId}`;
    it('should make call to http client', () => {
      const expected: ModelPermission[] = getTestPermissions();

      service.getPermissions(expectedId).subscribe(() => {});

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('GET');
      request.flush(expected);
    });
  });
});

function getTestPermissions(): ModelPermission[] {
  return [
    {
      company: {
        id: '1',
        name: 'Company A',
      },
      companyId: '555',
      modelInfo: getTestModel('44'),
      modelInfoId: '44',
      permissionType: ModelPermissionType.view,
    },
  ];
}

function getTestModel(id?: string): Model {
  if (id === null || id === undefined) {
    return {
      name: 'Test Model',
      description: 'Test Model Description',
      price: 12,
      gatewayUrl: 'http://localhost/gateway',
      isConnected: true,
      inputDescriptions: [], // These are tested in add-edit-modelparameters component
      outputDescriptions: [], // These are tested in add-edit-modelparameters component
    };
  }
  return {
    id,
    name: 'Test Model',
    description: 'Test Model Description',
    price: 12,
    gatewayUrl: 'http://localhost/gateway',
    isConnected: true,
    inputDescriptions: [], // These are tested in add-edit-modelparameters component
    outputDescriptions: [], // These are tested in add-edit-modelparameters component
  };
}

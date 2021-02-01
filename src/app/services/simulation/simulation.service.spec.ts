import { TestBed } from '@angular/core/testing';
import { SimulationService } from './simulation.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import {
  ExecutedSimulation,
  Simulation,
  SimulationResults,
  SimulationStatus,
  SimulationWithExecutions,
} from '../../models';
import { keysToCamel } from '../../utilities/snake-to-camel';

const simulationID = '555555';
const simulationExecutionId = '555555';

describe('SimulationService', () => {
  let service: SimulationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SimulationService],
    });
    service = TestBed.inject(SimulationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('runById', () => {
    const url = `${environment.API_ROOT}/api/run_simulation/${simulationID}`;
    it('should make call to http client', () => {
      const expected: ExecutedSimulation = getExecutedSimulation();

      service.runById(simulationID).subscribe((run) => {
        expect(run).toEqual(expected);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('POST');
      request.flush(expected);
    });
  });

  describe('create', () => {
    const url = `${environment.API_ROOT}/api/simulation`;
    it('should make call to http client', () => {
      const expected: Simulation = getTestSimulation();

      service.create(expected).subscribe((run) => {
        expect(run).toEqual(expected);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('POST');
      request.flush(expected);
    });
  });

  describe('deleteById', () => {
    const url = `${environment.API_ROOT}/api/simulation/${simulationID}`;
    it('should make call to http client', () => {
      const expected: Simulation = getTestSimulation();

      service.deleteById(simulationID).subscribe(() => {});

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('DELETE');
      request.flush(expected);
    });
  });

  describe('getById', () => {
    const url = `${environment.API_ROOT}/api/simulation/${simulationID}`;
    it('should make call to http client', () => {
      const expected: SimulationWithExecutions = getTestSimulationWithExecutions();

      service.getById(simulationID).subscribe((run) => {
        expect(run).toEqual(expected);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('GET');
      request.flush(expected);
    });
  });

  describe('update', () => {
    const url = `${environment.API_ROOT}/api/simulation/${simulationID}`;
    it('should make call to http client', () => {
      const expected: Simulation = getTestSimulation();

      service.update(getTestSimulation()).subscribe((run) => {
        expect(run).toEqual(expected);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('PUT');
      request.flush(expected);
    });
  });

  // This test currently fails
  describe('getMySimulations', () => {
    const url = `${environment.API_ROOT}/api/simulations`;
    it('should make call to http client', () => {
      const expected: Simulation = getTestSimulation();

      service.getMySimulations().subscribe((run) => {
        expect(run).toEqual([expected]);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('GET');
      request.flush([expected]);
    });
  });

  describe('getResultById', () => {
    const url = `${environment.API_ROOT}/api/simulation_result/${simulationExecutionId}`;
    it('should make call to http client', () => {
      const expected: SimulationResults = getTestSimulationResults();

      service.getResultById(simulationExecutionId).subscribe((run) => {
        expect(run).toEqual(expected);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('GET');
      request.flush(expected);
    });
  });
});

function getTestSimulationResults(): SimulationResults {
  return keysToCamel({
    created_by: {
      full_name: 'string',
      username: 'string',
    },
    created_on: '2020-05-30T13:53:16.825Z',
    executed_models: [
      {
        client_run_id: 'string',
        model_execution_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
    ],
    results: [
      {
        created_on: '2020-05-30T13:53:16.826Z',
        model_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        model_name: 'string',
        ran_on: '2020-05-30T13:53:16.826Z',
        result: [{}],
        status: 'submitted',
      },
    ],
    simulation: {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      name: 'string',
      owner: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    simulation_execution_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  });
}

function getTestSimulationWithExecutions(): SimulationWithExecutions {
  return {
    id: '5646546',
    name: 'ssss',
    createdBy: { fullName: 'Full Name', username: 'username' },
    createdOn: 'May 4th',
    executions: [],
    description: 'ffffff',
    foodProduct: {
      companyCode: 'fsafsa',
      id: '4344bfa7-4bdc-48a7-8567-0e950d6e6f3e',
      name: 'Chicken Soup',
      owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
      standardCode: 'saffasf',
    },
    foodProductId: '4344bfa7-4bdc-48a7-8567-0e950d6e6f3e',
    modelIds: ['fec35815-d0a0-41af-a2cf-ef71c4b83147', 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29'],
    models: [
      {
        canExecute: true,
        id: 'fec35815-d0a0-41af-a2cf-ef71c4b83147',
        name: 'Test1',
        owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
      },
      {
        canExecute: true,
        id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29',
        name: 'Test1',
        owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
      },
    ],
  };
}

function getExecutedSimulation(): ExecutedSimulation {
  return {
    createdBy: { fullName: 'daanH', username: 'dh' },
    createdOn: '12:23 29/5/2020',
    executedModels: [
      {
        clientRunId: '4444',
        model: {
          canExecute: true,
          id: 'fec35815-d0a0-41af-a2cf-ef71c4b83147',
          name: 'Test1',
          owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
        },
        modelExecutionId: '696969',
      },
    ],
    simulation: {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      name: 'string',
      owner: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    simulationExecutionId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  };
}

function getTestSimulation(): Simulation {
  return {
    id: simulationID,
    name: 'ssss',
    description: 'ffffff',
    createdOn: '12:23 29/5/2020',
    createdBy: { fullName: 'daanH', username: 'dh' },
    foodProduct: {
      companyCode: 'fsafsa',
      id: '4344bfa7-4bdc-48a7-8567-0e950d6e6f3e',
      name: 'Chicken Soup',
      owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
      standardCode: 'saffasf',
    },
    foodProductId: '4344bfa7-4bdc-48a7-8567-0e950d6e6f3e',
    modelIds: ['fec35815-d0a0-41af-a2cf-ef71c4b83147', 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29'],
    models: [
      {
        canExecute: true,
        id: 'fec35815-d0a0-41af-a2cf-ef71c4b83147',
        name: 'Test1',
        owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
      },
      {
        canExecute: true,
        id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29',
        name: 'Test1',
        owner: { id: 'd5ce9c53-ba74-4e48-97cd-d901dcca0d29', name: 'Technical University Eindhoven' },
      },
    ],
  };
}

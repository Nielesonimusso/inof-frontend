import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Simulation, SimulationResults, ExecutedSimulation, SimulationWithExecutions } from '../../models';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { unwrapSimulation } from '../../utilities/unwrapSimulation';

const API_ROOT = environment.API_ROOT;

/**
 * Service to interact with the backend for simulations.
 */
@Injectable()
export class SimulationService {
  constructor(private http: HttpClient) {}

  /**
   * Run the simulation with the specified id.
   */
  runById(simulationID: string): Observable<ExecutedSimulation> {
    return this.http.post<ExecutedSimulation>(`${API_ROOT}/api/run_simulation/${simulationID}`, {});
  }

  /**
   * Create a new simulation
   */
  create(simulation: Simulation): Observable<Simulation> {
    return this.http
      .post<Simulation>(`${API_ROOT}/api/simulation`, simulation, { observe: 'response' })
      .pipe(
        map((response) => {
          if (response.body as Simulation) {
            return unwrapSimulation(response.body);
          }
        })
      );
  }

  /**
   * Delete a simulation by id.
   */
  deleteById(simulationID: string) {
    return this.http.delete(`${API_ROOT}/api/simulation/${simulationID}`, { observe: 'response' });
  }

  /**
   * Get a simulation by id.
   */
  getById(simulationID: string) {
    return this.http
      .get<SimulationWithExecutions>(`${API_ROOT}/api/simulation/${simulationID}`, { observe: 'response' })
      .pipe(
        map((response) => {
          if (response.body as SimulationWithExecutions) {
            return unwrapSimulation(response.body);
          }
        })
      );
  }

  /**
   * Update a simulation.
   */
  update(simulation: Simulation): Observable<Simulation> {
    return this.http
      .put<Simulation>(`${API_ROOT}/api/simulation/${simulation.id}`, simulation, { observe: 'response' })
      .pipe(
        map((response) => {
          if (response.body as Simulation) {
            return unwrapSimulation(response.body);
          }
        })
      );
  }

  /**
   * Get all simulations based on the user's company.
   */
  getMySimulations(): Observable<Simulation[]> {
    return this.http
      .get<any>(`${API_ROOT}/api/simulations`, { observe: 'response' })
      .pipe(
        map((response) => {
          const simulations: Simulation[] = [];
          if (response.body as Simulation[]) {
            for (const sim of response.body) {
              simulations.push(unwrapSimulation(sim));
            }
          }
          return simulations;
        })
      );
  }

  /**
   * Get the results of a simulation execution based on id.
   */
  getResultById(simulationExecutionId: string) {
    return this.http.get<SimulationResults>(`${API_ROOT}/api/simulation_result/${simulationExecutionId}`);
  }
}

import { HasOwner, HasCreator } from './user.model';
import { ModelMinimal, ExecutedModel, ModelResult, ModelRunStatus } from './model.model';
import { FoodProductMinimal } from './food-product.model';

/**
 * A Simulation object that is extended with more relevant simulation information
 */
export interface Simulation extends SimulationMinimal, HasCreator {
  description: string;
  readonly foodProduct?: FoodProductMinimal;
  foodProductId: string;
  modelIds: string[];
  readonly models?: ModelMinimal[];
}

/**
 * A SimulationMinimal object for general information about a simulation (super-class of Simulation)
 */
export interface SimulationMinimal extends HasOwner {
  readonly id?: string;
  name: string;
}

/**
 * A SimulationResults object for storing simulation results
 */
export interface SimulationResults extends HasCreator {
  readonly executedModels: ExecutedModel[];
  readonly results?: ModelResult[];
  readonly simulation: SimulationMinimal;
  readonly simulationExecutionId: string;
}

/**
 * A SimulationStatus object for storing simulation statuses
 */
export interface SimulationStatus extends HasCreator {
  readonly executedModels: ExecutedModel[];
  readonly modelStatuses?: ModelRunStatus[];
  readonly simulation: SimulationMinimal;
  readonly simulationExecutionId: string;
}

/**
 * An ExecutedSimulation object for storing a single simulation execution's information
 */
export interface ExecutedSimulation extends HasCreator {
  readonly executedModels: ExecutedModel[];
  readonly simulation: SimulationMinimal;
  readonly simulationExecutionId: string;
}

/**
 * A SimulationWithExecutions object for storing information about a simulation's executions
 */
export interface SimulationWithExecutions extends Simulation {
  readonly description: string;
  readonly executions: ExecutedSimulation[];
  readonly foodProduct: FoodProductMinimal;
  readonly foodProductId: string;
  readonly id: string;
  readonly modelIds: string[];
  readonly models: ModelMinimal[];
  readonly name: string;
}

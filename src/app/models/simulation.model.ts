import { HasOwner, HasCreator } from './user.model';
import { ModelMinimal, ExecutedModel, ModelResult, ModelRunStatus, SchemaDefinition, SchemaColumn } from './model.model';
// import { FoodProductMinimal } from './food-product.model';
import { DataSourceMinimal } from './data-source.model';


export enum SimulationBindingType {
  data='data',
  model='model',
  input='input'
}

/**
 * A Simulation object that is extended with more relevant simulation information
 */
export interface Simulation extends SimulationMinimal, HasCreator {
  description: string;
  // readonly foodProduct?: FoodProductMinimal;
  // foodProductId: string;
  modelIds: string[];
  readonly models?: ModelMinimal[];
  dataSourceIds: string[];
  readonly dataSources?: DataSourceMinimal[];
  bindings: ArgumentBinding[];
}

/**
 * A SimulationMinimal object for general information about a simulation (super-class of Simulation)
 */
export interface SimulationMinimal extends HasOwner {
  readonly id?: string;
  name: string;
}

export declare type SimulationBindings = ArgumentBinding[];

export interface availableSource {
  sourceName: string,
  sourceUri: string,
  sourceArgumentName: string,
  sourceArgumentUri: string,
  sourceColumnName: string,
  sourceColumnUri: string
};

export interface ColumnBinding {
  readonly id?: string;
  /* selected source */
  sourceName?: string;
  sourceUri?: string;
  sourceArgumentName?: string;
  sourceArgumentUri?: string;
  sourceColumnName?: string;
  sourceColumnUri?: string;
  /* end selected source */
  sourceColumnArray?: string[];
  sourceType: SimulationBindingType;

  targetColumn: SchemaColumn;

  selectedSource?: availableSource;
}

export interface ArgumentBinding {
  readonly id?: string;
  length: number;
  modelName: string;
  modelUri: string;
  argumentUri: string;
  argumentName: string;
  columns: ColumnBinding[];
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
  // readonly foodProduct: FoodProductMinimal;
  // readonly foodProductId: string;
  readonly id: string;
  readonly modelIds: string[];
  readonly models: ModelMinimal[];
  readonly dataSourceIds: string[];
  readonly dataSources: DataSourceMinimal[];
  readonly bindings: ArgumentBinding[];
  readonly name: string;
}

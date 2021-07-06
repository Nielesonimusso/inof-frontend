import { HasOwner, Company, HasCreator } from './user.model';

/**
 * A Models object is an array of Model's
 */
export declare type Models = Model[];

export enum LanguageLabel {
  en = 'en',
  nl = 'nl',
}

export enum ModelStatus {
  submitted = 'submitted',
  success = 'success',
  running = 'running',
  failed = 'failed',
}

export enum ModelPermissionType {
  view = 'view',
  execute = 'execute',
}

/**
 * A Model object for storing detailed model information (sub-class of Model1)
 */
export interface Model extends ModelMinimal, HasCreator {
  description: string;
  price: number;
  readonly useCount?: number;
  ontologyUri: string;
  gatewayUrl: string;
  isConnected: boolean;
  readonly inputs: ModelArgument[];
  readonly outputs: ModelArgument[];
}

/**
 * A Minimal Model object (super-class of Model)
 */
export interface ModelMinimal extends HasOwner {
  readonly canExecute?: boolean;
  readonly id?: string;
  name: string;
  readonly owner?: Company;
  isConnected?: boolean;
  price?: number;
  description?: string;
  ontologyUri?: string;
  gatewayUrl?: string;
}

/**
 * An object for storing the result of a model (along with other relevant info)
 */
export interface ModelResult extends HasCreator {
  readonly modelId: string;
  readonly modelName: string;
  readonly ranOn: string;
  readonly result: any; // result as a JSON object
  readonly status: ModelStatus;
}

/**
 * An object for storing the status of a model (along with other relevant info)
 */
export interface ModelRunStatus extends HasCreator {
  readonly modelId: string;
  readonly name: string;
  readonly runId: string;
  readonly status: ModelStatus;
}

/**
 * An object for storing information about an executed model
 */
export interface ExecutedModel {
  readonly clientRunId: string; // To be clarified by client
  readonly model: ModelMinimal;
  readonly modelExecutionId: string;
}

/**
 * An object for storing permission information about a model
 */
export interface ModelPermission {
  readonly company?: Company;
  companyId: string;
  readonly modelInfo?: ModelMinimal;
  modelInfoId: string;
  permissionType: ModelPermissionType;
}

/**
 * An object for storing a description about a Model input or output
 */
export interface ModelArgument {
  /* The name of the argument */
  readonly name: string;
  /* The ontology URI of the argument */
  readonly uri: string;
  /* The ontology URI of the table type of the argument */
  readonly type_uri: string;
  /* The column definitions of the argument */
  readonly columns: SchemaColumn[];
}

export interface SchemaDefinition {
  readonly uri: string;
  readonly columns: SchemaColumn[];
}

/**
 * An object for storing a description of a column of a model argument
 */
export interface SchemaColumn {
  /* The name of the column */
  readonly name: string;
  /* The ontology URI of the column */
  readonly uri: string;
  /* The datatype of the column */
  readonly datatype: string;
  /* The unit of the column, if the column belongs to a unit-value product */
  readonly unitType: string;
  readonly unitUri: string;
  readonly unitSourceUri: string;
  /* The source for possible values of the column, if applicable */
  readonly referenceType: string;
  readonly referencedPropertyUri: string;
  readonly referencedObjectUri: string;
  readonly referencedSchema: SchemaDefinition | string[];
  readonly referencedObjects: object[];
}

export const EmptyModel = (): Model => {
  return {
    name: '',
    description: '',
    price: 0,
    ontologyUri: '',
    gatewayUrl: '',
    isConnected: false,
    inputs: [],
    outputs: [],
  };
};

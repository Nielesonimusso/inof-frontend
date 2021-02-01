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
  gatewayUrl: string;
  isConnected: boolean;
  inputDescriptions: ModelParameter[];
  outputDescriptions: ModelParameter[];
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
export interface ModelParameter {
  /**
   * The description of the model input or output
   */
  description: string;
  /**
   * The unit of the model input or output
   */
  unit: string;
  /**
   * The labels for the model input or output. Supports multiple languages
   */
  labels: ModelParameterLabel[];
}

/**
 * The ModelParameterLabelDb type supports the localization of labels.
 */
export interface ModelParameterLabel {
  /**
   * The language of the label as an enum of two ISO 639-1 codes.
   */
  language: LanguageLabel;
  /**
   * The label in the specified language
   */
  name: string;
}

export const EmptyModel = (): Model => {
  return {
    name: '',
    description: '',
    price: 0,
    gatewayUrl: '',
    isConnected: false,
    inputDescriptions: [],
    outputDescriptions: [],
  };
};

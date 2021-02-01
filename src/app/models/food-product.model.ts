import { HasOwner, Company, HasCreator } from './user.model';

/* Interface for all FoodProduct Types that have a companyCode/standardCode */
interface HasCode {
  companyCode: string;
  standardCode?: string;
}

/**
 * Minimal Food Product. Returned by the server in some cases.
 */
export interface FoodProductMinimal extends HasCode, HasOwner {
  readonly id?: string;
  name: string;
}

/**
 * Food Product. Contains all the information of a Food Product, and extends FoodProductMinimal.
 */
export interface FoodProduct extends FoodProductMinimal, HasCreator {
  dosage: number;
  dosageUnit: string;
  foodProductProperties: FoodProductProperty[];
  ingredients: Ingredient[];
  packagings: FoodProductPackaging[];
  processingSteps: FoodProductProcessingStep[];
}

/**
 * This object contains permission information for a Food Product
 */
export interface FoodProductPermission {
  readonly company: Company;
  companyId: string;
  readonly foodProduct: FoodProductMinimal;
  foodProductId: string;
}

/**
 * A FoodProductProperty defines a name of a property of a Food Product, along with the method, unit and value.
 */
export interface FoodProductProperty {
  readonly id?: string;
  method: string;
  name: string;
  unit: string;
  value: number;
}

/**
 * A FoodProductPackaging defines a packaging of a FoodProduct.
 */
export interface FoodProductPackaging extends HasCode {
  readonly id?: string;
  name: string;
  shape: string;
  thickness: number;
  thicknessUnit: string;
}

/**
 * A FoodProductProcessingStep defines a step in the process of making a food product.
 */
export interface FoodProductProcessingStep {
  equipment: string;
  readonly id?: string;
  name: string;
  properties: ProcessingStepProperty[];
}

/**
 * A ProcessingStepProperty defines a property of a step in the process of making a food product.
 */
export interface ProcessingStepProperty {
  readonly id?: string;
  name: string;
  unit: string;
  value: number;
}

/**
 * A minimal object for ingredients.
 */
export interface IngredientMinimal extends HasCode {
  name: string;
}

/**
 *  An object for describing an ingredient of a food product
 */
export interface Ingredient extends IngredientMinimal {
  amount: number;
  amountUnit: string;
  readonly id?: string;
}

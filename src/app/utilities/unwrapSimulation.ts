import { Simulation } from '../models';

/**
 * Add the foodProductId and the modelId to the object because they are not provided by the backend
 */
export function unwrapSimulation<T extends Simulation>(input: T): T {
  const simulation: Simulation = input;
  simulation.foodProductId = simulation.foodProduct.id;
  simulation.modelIds = simulation.models.map((model) => model.id);
  return { ...simulation, ...input };
}

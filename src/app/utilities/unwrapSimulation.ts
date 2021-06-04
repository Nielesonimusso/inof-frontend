import { Simulation } from '../models';

/**
 * Add the foodProductId and the modelId to the object because they are not provided by the backend
 */
export function unwrapSimulation<T extends Simulation>(input: T): T {
  const simulation: Simulation = input;
  // simulation.foodProductId = simulation.foodProduct.id;
  simulation.modelIds = simulation.models.map((model) => model.id);
  simulation.dataSourceIds = simulation.dataSources.map((dataSource) => dataSource.id);

  return { ...simulation, ...input };
}

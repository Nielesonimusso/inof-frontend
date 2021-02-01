import { Component, Input } from '@angular/core';
import { ExecutedSimulation, SimulationResults, ModelResult } from '../../../models';

type ResultsView = 'tree' | 'raw' | 'table';

/**
 * Simulation Results View
 */
@Component({
  selector: 'app-simulation-results',
  templateUrl: './simulation-results.component.html',
  styleUrls: ['./simulation-results.component.scss'],
})
export class SimulationResultsComponent {
  @Input() executedSimulation: ExecutedSimulation;
  @Input() executedSimulationIndex: number;
  @Input() executedSimulationResults: SimulationResults;

  /** Index of the selected model */
  selectedIndex: any = 0;

  /**
   * Active view of the simulation results
   * Default: table
   */
  public resultsView: ResultsView = 'table';

  toPrettyJSONString(value: any) {
    // space on the left of the line is set to 4
    return JSON.stringify(value, null, 4);
  }

  getResults(): any {
    return this.modelResultForModel(this.executedSimulation.executedModels[this.selectedIndex].model.id).result;
  }

  changeView(view: ResultsView): void {
    this.resultsView = view;
  }

  modelResultForModel(modelID: string): ModelResult {
    return this.executedSimulationResults.results.find((value) => value.modelId === modelID);
  }
}

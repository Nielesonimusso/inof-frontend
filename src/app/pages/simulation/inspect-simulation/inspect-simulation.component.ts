import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ExecutedSimulation,
  FoodProductMinimal,
  SimulationResults,
  SimulationWithExecutions,
  ModelMinimal,
  isCreator,
  UserProfile,
} from '../../../models';
import { SimulationService, UserService } from '../../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent, TabbedComponent } from '../../../components';
import { finalize, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

/**
 * Inspect Simulation Page
 */
@Component({
  selector: 'app-inspect-simulation',
  templateUrl: './inspect-simulation.component.html',
  styleUrls: ['./inspect-simulation.component.scss'],
})
export class InspectSimulationComponent extends TabbedComponent implements OnInit {
  @ViewChild(LoadingButtonComponent) runButton: LoadingButtonComponent;

  @ViewChild('runTable') runTable: MatTable<any>;

  // Making empty versions of variables for the case the backend crashes this page does not crash and we are able to provide error messages.
  simulationWithExecutions: SimulationWithExecutions = null;

  // Store the simulation results after fetching.
  results: SimulationResults[] = [];

  sortedExecutions: ExecutedSimulation[] = [];

  selectedFoodProduct: FoodProductMinimal = null;
  displayedColumns = ['run', 'date', 'status'];

  /**
   * Keep track of the selected run
   */
  selectedRun: ExecutedSimulation | null = null;
  selectedIndex?: number;
  selectedResults?: SimulationResults;
  profile: Observable<UserProfile>;

  constructor(
    router: Router,
    private route: ActivatedRoute,
    private simulationService: SimulationService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    super(router, route);
  }

  ngOnInit() {
    // Get the user's profile
    this.userService.getUserProfile().subscribe((profile) => (this.profile = of(profile)));

    // Get parameters of the route
    this.route.paramMap.subscribe((params) => {
      // If id parameter is set
      if (params.get('id') !== null && params.get('id') !== undefined) {
        // Get the Simulation from the service
        this.simulationService.getById(params.get('id')).subscribe(
          (simulation) => {
            // Use it to prefill values
            this.simulationWithExecutions = simulation;
            this.processSimulationExecutions();
            this.selectedFoodProduct = simulation.foodProduct;
          },
          (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
        );
      }
    });
  }

  showEditButton(): Observable<boolean> {
    // Only show the permissions piece when you are from the same company
    return this.profile?.pipe(map((profile) => isCreator(this.simulationWithExecutions, profile)));
  }

  /**
   * Processes changes in the simulation.executions property
   */
  processSimulationExecutions() {
    // Sort on newest first
    this.sortedExecutions = this.simulationWithExecutions.executions.sort(
      (a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
    );
    this.fetchSimulationResults();
  }

  /**
   * Fetches the simulation results if necessary
   */
  fetchSimulationResults() {
    for (const run of this.simulationWithExecutions.executions) {
      // If it has not received the results of that execution yet
      if (!this.simulationResultForExecution(run.simulationExecutionId)) {
        // Fetch results
        this.simulationService.getResultById(run.simulationExecutionId).subscribe((simulationResults) => {
          this.results.push(simulationResults);
          this.runTable.renderRows();
        });
      }
    }
  }

  /**
   * Run the simulation when the 'PLAY' button/icon is clicked
   */
  runSimulation() {
    this.simulationService
      .runById(this.simulationWithExecutions.id)
      .pipe(finalize(() => this.runButton.completeLoading()))
      .subscribe((execution) => {
        // Add it to the executions array
        this.simulationWithExecutions.executions.push(execution);
        // Process the simulation executions after adding this execution
        this.processSimulationExecutions();
        this.snackBar.open('Simulation run has been requested successfully', '', { duration: 4000 });
      });
  }
  /**
   * Each time the open in new tab button is clicked, the corresponding inspect food product edit page is opened in a new window
   */
  inspectFoodProduct() {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['available-products', 'inspect', this.selectedFoodProduct.id])
    );
    window.open(url, '_blank');
  }

  /**
   * Each time the open in new tab button is clicked, the corresponding inspect food product edit page is opened in a new window
   */
  inspectModel(model: ModelMinimal) {
    const url = this.router.serializeUrl(this.router.createUrlTree(['available-models', 'inspect', model.id]));
    window.open(url, '_blank');
  }

  /**
   * Gets the Simulation Result for a given execution with id
   * @param executionID the id of the execution
   */
  simulationResultForExecution(executionID: string): SimulationResults | undefined {
    return this.results.find((value) => {
      return value.simulationExecutionId === executionID;
    });
  }

  /*
   * Handler when clicking on a run in the table
   */
  selectRun(run: ExecutedSimulation | null, index?: number) {
    this.selectedRun = run;
    if (run) {
      this.selectedResults = this.simulationResultForExecution(this.selectedRun.simulationExecutionId);
      this.selectedIndex = index;
    } else {
      this.selectedResults = undefined;
      this.selectedIndex = undefined;
    }
  }
}

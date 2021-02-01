import { FoodProduct, FoodProductMinimal, Models, ModelMinimal } from '../../../models';
import { Simulation } from '../../../models';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FoodProductService, ModelService, SimulationService } from '../../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingButtonComponent, CancelEditsDialogComponent, CancelEditsDialogAction, TabbedComponent } from '../../../components';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';

/**
 * Add / Edit Simulation Page
 */
@Component({
  selector: 'app-add-edit-simulation',
  templateUrl: './add-edit-simulation.component.html',
  styleUrls: ['./add-edit-simulation.component.scss'],
})
export class AddEditSimulationComponent extends TabbedComponent implements OnInit {
  @ViewChild('ngForm') form: NgForm;
  @ViewChild('saveButton') saveButton: LoadingButtonComponent;
  @ViewChild('saveRunButton') saveRunButton: LoadingButtonComponent;

  // Making empty versions of variables for the case the backend crashes this page does not crash and we are able to provide error messages.
  simulation: Simulation = null;
  availableModels: Models = [];
  availableFoodProducts: FoodProduct[];
  selectedFoodProduct: FoodProductMinimal;

  /**
   * The available models that are not yet selected.
   * A model cannot exist in the same simulation twice
   */
  availableModelsNotSelected: Models = [];

  shouldRunAfter = false;

  constructor(
    router: Router,
    private route: ActivatedRoute,
    private simulationService: SimulationService,
    private foodProductService: FoodProductService,
    private modelService: ModelService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    super(router, route);
  }

  ngOnInit() {
    // Get all available models to let the user select out of them in their Simulation
    this.modelService.availableModels().subscribe(
      (models) => {
        this.availableModels = models;
        this.updateAvailableModelsNotSelected();
      },
      (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
    );

    // There is initially no foodproct until we get it from the service
    this.selectedFoodProduct = null;
    this.foodProductService.getAvailable().subscribe(
      (foodProducts) => {
        this.availableFoodProducts = foodProducts;
      },
      (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
    );

    // Get parameters of the route
    this.route.params.subscribe((params) => {
      // If id parameter is set
      if (params.id !== null && params.id !== undefined) {
        // Get the Simulation from the service
        this.simulationService.getById(params.id).subscribe(
          (simulation) => {
            // Use it to prefill values
            this.simulation = simulation;
            this.selectedFoodProduct = simulation.foodProduct;
            this.updateAvailableModelsNotSelected();
          },
          (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
        );
      } else {
        this.simulation = {
          name: '',
          description: '',
          foodProduct: null,
          foodProductId: '',
          modelIds: [],
          models: [],
        };
      }
    });
  }

  /**
   * Updates the availableModelsNotSelected property based on the available models that are not yet selected.
   */
  updateAvailableModelsNotSelected() {
    // from all available models, filter out the models which are not in simulation (i.e. offer them for choosing)
    // and they must be connected
    if (!this.simulation) {
      return;
    }
    this.availableModelsNotSelected = this.availableModels.filter(
      (model) => !(this.simulation.modelIds && this.simulation.modelIds.includes(model.id)) && model.isConnected
    );
  }

  saveSimulation() {
    // If there is a simulation already then just update it
    if (this.simulation.id) {
      this.simulationService
        .update(this.simulation)
        .pipe(finalize(() => !this.shouldRunAfter && this.saveButton.completeLoading()))
        .subscribe((simulation) => {
          // If only the save button is clicked then navigate to the inspect page
          if (!this.shouldRunAfter) {
            this.snackBar.open('Simulation saved successfully', '', { duration: 2000 });
            this.simulation = simulation;
            this.form.control.markAsPristine();
            // If the save and run button is clicked then request a simulation run and navigate to the inspect page
          } else {
            this.simulationService
              .runById(simulation.id)
              .pipe(finalize(() => this.saveRunButton.completeLoading()))
              .subscribe((executedSimulation) => {
                this.snackBar.open('Simulation saved successfully and a run request is made', '', { duration: 2000 });
                this.simulation = simulation;
                this.form.control.markAsPristine();
              });
          }
        });
      // If no simulation with the given id exist then create it
    } else {
      this.simulationService
        .create(this.simulation)
        .pipe(finalize(() => !this.shouldRunAfter && this.saveButton.completeLoading()))
        .subscribe((simulation) => {
          // If only the save button is clicked then navigate to the inspect page
          if (!this.shouldRunAfter) {
            this.snackBar.open('Simulation created successfully', '', { duration: 2000 });
            this.simulation = simulation;
            this.router.navigate(['edit', simulation.id], {
              state: { tab: this.tabIndex },
              relativeTo: this.route.parent,
            });
            // If the save and run button is clicked then request a simulation run and navigate to the inspect page
          } else {
            this.simulationService
              .runById(simulation.id)
              .pipe(finalize(() => this.saveRunButton.completeLoading()))
              .subscribe((executedSimulation) => {
                this.snackBar.open('Simulation created successfully and a run request is made', '', { duration: 2000 });
                this.simulation = simulation;
                this.router.navigate(['edit', simulation.id], {
                  state: { tab: this.tabIndex },
                  relativeTo: this.route.parent,
                });
              });
          }
        });
    }
  }

  cancel() {
    if (!this.simulation) {
      return;
    }

    if (!this.form.dirty) {
      this.doCancel();
    } else {
      const dialogRef = this.dialog.open(CancelEditsDialogComponent);

      dialogRef.afterClosed().subscribe((result: CancelEditsDialogAction) => {
        if (result === CancelEditsDialogAction.NO_SAVE) {
          this.doCancel();
        }
        // Else, do nothing, only close dialog
      });
    }
  }

  private doCancel() {
    // If model has an id, it is an edit operation
    // Then, go to inspect page
    if (this.simulation.id) {
      this.router.navigate(['inspect', this.simulation.id], {
        relativeTo: this.route.parent,
        fragment: this.tabIndex.toString(),
      });
    } else {
      // Else, go back to the my/available models page (dependend on what the origin is)
      this.route.parent.url.subscribe((url) => {
        this.router.navigate([`${url}`]);
      });
    }
  }

  /**
   * Each time a select button is clicked, the corresponding model is added to list of models to be used.
   * @param model model to be added
   */
  onModelAdded(model: ModelMinimal) {
    this.simulation.models.push(model);
    this.simulation.modelIds.push(model.id);
    this.updateAvailableModelsNotSelected();
    this.form.control.markAsDirty();
  }

  /**
   * Each time an 'x' button is clicked, the corresponding model is removed from the list of models to be used
   * @param index index of the model to be removed from the list of models to be used
   */
  deleteModel(index: number) {
    this.simulation.models.splice(index, 1);
    this.simulation.modelIds.splice(index, 1);
    this.updateAvailableModelsNotSelected();
    this.form.control.markAsDirty();
  }

  /**
   * Each time a select button is clicked, the corresponding food product is added as the food product to be used.
   * @param foodProduct foodProduct to be added
   */
  onFoodProductAdded(foodProduct: FoodProductMinimal) {
    this.selectedFoodProduct = foodProduct;
    this.simulation.foodProductId = foodProduct.id;
    this.form.control.markAsDirty();
  }

  /**
   * Each time an 'x' button is clicked, the corresponding food product is removed
   */
  deleteFoodProduct() {
    this.selectedFoodProduct = null;
    this.simulation.foodProductId = null;
    this.form.control.markAsDirty();
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
}

import { Models, ModelMinimal, DataSources, DataSourceMinimal, SimulationBindings, SimulationBindingType, ArgumentBinding, ColumnBinding, availableSource, Model } from '../../../models';
import { Simulation } from '../../../models';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSourceService, ModelService, SimulationService } from '../../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingButtonComponent, CancelEditsDialogComponent, CancelEditsDialogAction, TabbedComponent } from '../../../components';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { merge } from 'rxjs';

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
  availableDataSources: DataSources = [];

  public get simulationBindingType(): typeof SimulationBindingType {
    return SimulationBindingType;
  }

  simulationBindingTypes: SimulationBindingType[] = [SimulationBindingType.fixed, 
    SimulationBindingType.data, SimulationBindingType.model];
  // availableFoodProducts: FoodProduct[];
  // selectedFoodProduct: FoodProductMinimal;

  /**
   * The available models that are not yet selected.
   * A model cannot exist in the same simulation twice
   */
  availableModelsNotSelected: Models = [];
  availableDataSourcesNotSelected: DataSources = [];
  originalBindings: SimulationBindings = [];

  availableDataSourceInputs: availableSource[] = [];
  availableModelOutputInputs: availableSource[] = [];
  argumentBindingsPerModel: Map<string, SimulationBindings> = new Map<string, SimulationBindings>();

  shouldRunAfter = false;

  constructor(
    router: Router,
    private route: ActivatedRoute,
    private simulationService: SimulationService,
    // private foodProductService: FoodProductService,
    private modelService: ModelService,
    private dataSourceService: DataSourceService,
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

    this.dataSourceService.availableDataSources().subscribe(
      (dataSources) => {
        this.availableDataSources = dataSources;
        this.updateAvailableDataSourcesNotSelected();
      },
      (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
    );

    /* There is initially no foodproct until we get it from the service
    this.selectedFoodProduct = null;
    this.foodProductService.getAvailable().subscribe(
      (foodProducts) => {
        this.availableFoodProducts = foodProducts;
      },
      (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
    );*/

    // Get parameters of the route
    this.route.params.subscribe((params) => {
      // If id parameter is set
      if (params.id !== null && params.id !== undefined) {
        // Get the Simulation from the service
        this.simulationService.getById(params.id).subscribe(
          (simulation) => {
            // Use it to prefill values
            this.simulation = simulation;
            // this.selectedFoodProduct = simulation.foodProduct;
            this.updateAvailableModelsNotSelected();
            this.updateAvailableDataSourcesNotSelected();
            this.updateRequiredBindingTargets();
            this.updateAvailableBindingSources();
          },
          (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
        );
      } else {
        this.simulation = {
          name: '',
          description: '',
          // foodProduct: null,
          // foodProductId: '',
          modelIds: [],
          models: [],
          dataSourceIds: [],
          dataSources: [],
          bindings: []
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
      (model) => !(this.simulation.modelIds 
        && this.simulation.modelIds.includes(model.id)) 
        && model.isConnected
    );
  }

  updateAvailableDataSourcesNotSelected() {
    if (!this.simulation) {
      return;
    }
    this.availableDataSourcesNotSelected = this.availableDataSources.filter(
      (dataSource) => !(this.simulation.dataSourceIds 
        && this.simulation.dataSourceIds.includes(dataSource.id)) 
        && dataSource.isConnected
    );
  }

  updateRequiredBindingTargets() {
    if (!this.simulation) {
      return;
    }
    // make new list of bindings based on all the inputs of the current models in the simulation
    // TODO possibility to bind to fixed unit?? or assume value*unit pair is always provided and gather unit at simulation-time?

    console.log('before update');
    console.log(Object.assign({}, this.simulation));

    this.argumentBindingsPerModel.clear();

    merge(...this.simulation.models.map((model) => this.modelService.get(model.id)))
    .pipe(finalize(() => {
      this.simulation.bindings = Array.from(this.argumentBindingsPerModel.values()).flat();
      console.log('after update');
      console.log(Object.assign({}, this.simulation));
    }))
    .subscribe((completeModel) => {
      // update the bindings of the simulation, also using a backup of the original bindings
      let newBindings: ArgumentBinding[] = completeModel.inputs.map((input) => {
        let existingBinding = this.simulation.bindings.find((binding) => 
            binding.argumentUri == input.uri);
        if (existingBinding) {
          return existingBinding;
        } else { // create new empty Argument+Column bindings
          let newBinding: ArgumentBinding = {
            length: 1,
            modelName: completeModel.name,
            modelUri: completeModel.ontologyUri,
            argumentUri: input.uri,
            argumentName: input.name,
            columns: input.columns.map((column) => {
              return {
                selectedSource: {
                  sourceName: '',
                  sourceUri: '',
                  sourceArgumentName: '',
                  sourceArgumentUri: '',
                  sourceColumnName: '',
                  sourceColumnUri: ''
                },
                sourceColumnArray: [''],
                sourceType: SimulationBindingType.fixed,
                targetColumnName: column.name,
                targetColumnUri: column.uri
              };
            })
          };
          return newBinding;
        }
      });
      this.argumentBindingsPerModel.set(completeModel.name, newBindings);
    });

  }

  updateAvailableBindingSources() {
    if (!this.simulation) {
      return;
    }
    
    this.availableDataSourceInputs = [];
    this.availableModelOutputInputs = [];

    merge(
      ...this.availableDataSources.map((dataSource) => this.dataSourceService.get(dataSource.id))
    ).pipe(finalize(() => {
      // update the selection fields for data sources so they display the current value
      this.simulation.bindings.forEach((binding) => {
        binding.columns.filter((column) => column.sourceType == SimulationBindingType.data).forEach((column) => {
          column.selectedSource = this.availableDataSourceInputs.find(
            (dataSource) => dataSource.sourceColumnUri == column.selectedSource.sourceColumnUri);
        });
      });
    })).subscribe((completeDataSource) => {
      Array.prototype.push.apply(this.availableDataSourceInputs, completeDataSource.columns.map((column) => {
        return {
          sourceName: completeDataSource.name,
          sourceUri: completeDataSource.ontologyUri,
          sourceArgumentName: completeDataSource.name,
          sourceArgumentUri: completeDataSource.ontologyUri,
          sourceColumnName: column.name,
          sourceColumnUri: column.uri
        }
      }));
    });

    merge(
      ...this.availableModels.map((model) => this.modelService.get(model.id))
    ).pipe(finalize(() => {
      // update the selection fields for models so they display the current value
      this.simulation.bindings.forEach((binding) => {
        binding.columns.filter((column) => column.sourceType == SimulationBindingType.model).forEach((column) => {
          column.selectedSource = this.availableModelOutputInputs.find(
            (dataSource) => dataSource.sourceColumnUri == column.selectedSource.sourceColumnUri);
        });
      });
    })).subscribe((completeModel) => {
      Array.prototype.push.apply(this.availableModelOutputInputs, completeModel.outputs.flatMap((output) =>
        output.columns.map((column) => {
          return {
            sourceName: completeModel.name,
            sourceUri: completeModel.ontologyUri,
            sourceArgumentName: output.name,
            sourceArgumentUri: output.uri,
            sourceColumnName: column.name,
            sourceColumnUri: column.uri
          }
        })));
    });

    // update data sources based on selected data sources
    // this.availableDataSources.forEach((dataSource) => {
    //   this.dataSourceService.get(dataSource.id).subscribe((completeDataSource) => {
    //     Array.prototype.push.apply(this.availableDataSourceInputs, completeDataSource.columns.map((column) => {
    //       return {
    //         sourceName: dataSource.name,
    //         sourceUri: dataSource.ontologyUri,
    //         sourceArgumentName: dataSource.name,
    //         sourceArgumentUri: dataSource.ontologyUri,
    //         sourceColumnName: column.name,
    //         sourceColumnUri: column.uri
    //       }
    //     }));
    //   });
    // });

    // this.availableModels.forEach((model) => {
    //   this.modelService.get(model.id).subscribe((completeModel) => {
    //     Array.prototype.push.apply(this.availableModelOutputInputs, completeModel.outputs.flatMap((output) =>
    //       output.columns.map((column) => {
    //         return {
    //           sourceName: model.name,
    //           sourceUri: model.ontologyUri,
    //           sourceArgumentName: output.name,
    //           sourceArgumentUri: output.uri,
    //           sourceColumnName: column.name,
    //           sourceColumnUri: column.uri
    //         }
    //       })));
    //   });
    // });
  }

  updateSelectedSource(typeSelector, column: ColumnBinding, argument: ArgumentBinding) {
    let selectedType: SimulationBindingType = typeSelector.value;
    switch(selectedType) {
      case SimulationBindingType.fixed:
        column.selectedSource = {
          sourceName: '',
          sourceUri: '',
          sourceArgumentName: '',
          sourceArgumentUri: '',
          sourceColumnName: '',
          sourceColumnUri: ''
        };
        column.sourceColumnArray = Array(argument.length).fill("");
        break;
      case SimulationBindingType.data:
        column.selectedSource = this.availableDataSourceInputs[0];
        break;
      case SimulationBindingType.model:
        column.selectedSource = this.availableModelOutputInputs[0];
        break;
    }
  }

  /**
   * for generating range [0..length]
   * @param length end of range
   * @returns [0..length]
   */
  range(length: number) {
    return Array(length).fill(0).map((n,i) => i)
  }

  /**
   * for generating clean names for use in id and name parameters of html elements
   * removes everything but [a-zA-Z0-9]
   * @param name name to clean
   * @returns cleaned name
   */
  cleanName(name: string): string {
    return name.replace(/[^\w]/g, "");
  }

  // updating the length of value array for fixed columns
  onArgumentLengthChange(argument: ArgumentBinding) {
    argument.columns.forEach((column) => {
      if (column.sourceType == SimulationBindingType.fixed) {
        column.sourceColumnArray.splice(argument.length);
      }
    });
  }

  trackByModel(_:number, model: ModelMinimal) {
    return model.ontologyUri;
  }
  trackByArgument(_:number, argument: ArgumentBinding) {
    return argument.argumentUri;
  }
  trackByColumn(_:number, column: ColumnBinding) {
    return column.targetColumnUri;
  }

  saveSimulation() {
    // If there is a simulation already then just update it
    console.log(this.simulation);
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
    this.updateRequiredBindingTargets();
    this.updateAvailableBindingSources();
    this.form.control.markAsDirty();
  }

  onDataSourceAdded(dataSource: DataSourceMinimal) {
    this.simulation.dataSources.push(dataSource);
    this.simulation.dataSourceIds.push(dataSource.id);
    this.updateAvailableDataSourcesNotSelected();
    this.updateAvailableBindingSources();
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
    this.updateRequiredBindingTargets();
    this.updateAvailableBindingSources();
    this.form.control.markAsDirty();
  }

  deleteDataSource(index: number) {
    this.simulation.dataSources.splice(index, 1);
    this.simulation.dataSourceIds.splice(index, 1);
    this.updateAvailableDataSourcesNotSelected();
    this.updateAvailableBindingSources();
    this.form.control.markAsDirty();
  }
}

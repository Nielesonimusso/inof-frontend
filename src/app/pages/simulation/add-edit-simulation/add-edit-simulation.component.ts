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
import { DataSource } from '@angular/cdk/collections';

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

  simulationBindingTypes: SimulationBindingType[] = [SimulationBindingType.input, 
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
        this.updateAvailableModelsSelection();
      },
      (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
    );

    this.dataSourceService.availableDataSources().subscribe(
      (dataSources) => {
        this.availableDataSources = dataSources;
        this.updateAvailableDataSourcesSelection();
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
            this.updateAvailableModelsSelection();
            this.updateAvailableDataSourcesSelection();
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
  updateAvailableModelsSelection() {
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

  updateAvailableDataSourcesSelection() {
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
                sourceType: SimulationBindingType.input,
                targetColumn: column
              };
            })
          };
          return newBinding;
        }
      });
      this.argumentBindingsPerModel.set(completeModel.name, newBindings);
      // also update referenceOptions while we're at it
      newBindings.forEach((argumentBinding) => {
        argumentBinding.columns.forEach((columnBinding) => {
          this.fetchOptionsForReferenceColumnInputData(columnBinding);
        });
      });

    });
  }

  updateAvailableBindingSources() {
    if (!this.simulation) {
      return;
    }
    
    this.availableDataSourceInputs = [];
    this.availableModelOutputInputs = [];

    merge(
      ...this.availableDataSources
        .filter((dataSource) => this.simulation.dataSourceIds.includes(dataSource.id))
        .map((dataSource) => this.dataSourceService.get(dataSource.id))
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
      ...this.availableModels
        .filter((model) => this.simulation.modelIds.includes(model.id))
        .map((model) => this.modelService.get(model.id))
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

  }

  updateSelectedSource(typeSelector, column: ColumnBinding, argument: ArgumentBinding) {
    let selectedType: SimulationBindingType = typeSelector.value;
    switch(selectedType) {
      case SimulationBindingType.input:
        column.selectedSource = {
          sourceName: '',
          sourceUri: '',
          sourceArgumentName: '',
          sourceArgumentUri: '',
          sourceColumnName: '',
          sourceColumnUri: ''
        };
        column.sourceColumnArray = Array(argument.length).fill("");
        this.fetchOptionsForReferenceColumnInputData(column);
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
    return Array(length).fill(0).map((_,i) => i)
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
      if (column.sourceType == SimulationBindingType.input) {
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
    return column.targetColumn.uri;
  }

  argumentHasInputBindings(argument: ArgumentBinding): boolean {
    return argument.columns.some((column) => 
      column.sourceType == SimulationBindingType.input);
  }

  argumentHasOnlyInputBindings(argument: ArgumentBinding): boolean {
    return argument.columns.every((column) => 
      column.sourceType == SimulationBindingType.input);
  }

  fetchOptionsForReferenceColumnInputData(argumentColumn: ColumnBinding) {
    switch(argumentColumn.targetColumn.referenceType) {
      case 'column':
        let referencedTable = argumentColumn.targetColumn.referencedObjectUri;

        // add extra information to targetColumn and dataSource
        let dataSource = this.availableDataSources.find((dataSource) => dataSource.ontologyUri == referencedTable);
        
        this.dataSourceService.get(dataSource.id).subscribe((completeDataSource) => {
          dataSource.columns = completeDataSource.columns;
          argumentColumn.targetColumn
          this.dataSourceService.fetchData(dataSource.id).subscribe((data) => {
            argumentColumn.targetColumn.referencedObjects = data;

          });
        });
      case 'concept':
        // TODO handle concept options from available ontology
        break;
    }
  }

  columnOptions(argumentColumn: ColumnBinding): Array<any> {
    let referencedTable = argumentColumn.targetColumn.referencedObjectUri;
    let referencedColumn = argumentColumn.targetColumn.referencedPropertyUri;
    let dataSource = this.availableDataSources.find((dataSource) => dataSource.ontologyUri == referencedTable);
    let columnName = dataSource.columns?.find((column) => column.uri == referencedColumn).name;
    return argumentColumn.targetColumn.referencedObjects.map((row) => row[columnName]);
  }

  getUnit(argumentColumn: ColumnBinding, rowNumber: number): string {
    switch(argumentColumn.targetColumn.unitType) {
      case 'none':
        return "";
      case 'fixed':
        return argumentColumn.targetColumn.unitLabel;
      case 'column':
        return ""; //TODO
          // 0) not relevant for anything other than 'fixed'?? (at least in UI)
          // 0) only relevant when referred object mixed with INPUT -> needs complete INPUT row!
          // 0) assumption -> always column of same table?
          // 1) get object/row referred to in other column of source row
          // 2) get property/column of said object/row that contains unit
      case 'concept':
        return ""; //TODO
    }
  }

  getUnitText(argumentColumn: ColumnBinding, rowNumber: number): string {
    let unitString = this.getUnit(argumentColumn, rowNumber);
    if (unitString) {
      return `(${unitString})`;
    } else {
      return "";
    }
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
    this.updateAvailableModelsSelection();
    this.updateRequiredBindingTargets();
    this.updateAvailableBindingSources();
    this.form.control.markAsDirty();
  }

  onDataSourceAdded(dataSource: DataSourceMinimal) {
    this.simulation.dataSources.push(dataSource);
    this.simulation.dataSourceIds.push(dataSource.id);
    this.updateAvailableDataSourcesSelection();
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
    this.updateAvailableModelsSelection();
    this.updateRequiredBindingTargets();
    this.updateAvailableBindingSources();
    this.form.control.markAsDirty();
  }

  deleteDataSource(index: number) {
    this.simulation.dataSources.splice(index, 1);
    this.simulation.dataSourceIds.splice(index, 1);
    this.updateAvailableDataSourcesSelection();
    this.updateAvailableBindingSources();
    this.form.control.markAsDirty();
  }
}

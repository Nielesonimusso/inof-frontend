import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FoodProduct, IngredientMinimal, Company, isCreator } from '../../../models';
import { AuthService, FoodProductService, UserService } from '../../../services';
import { MatTable } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingButtonComponent, CancelEditsDialogAction, CancelEditsDialogComponent, TabbedComponent } from '../../../components';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { NgForm, FormGroup } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { addFormServerErrors } from '../../../utilities/error';
import { getID } from '../../../utilities/uniqueObjectHelper';

/**
 * Add / Edit Food Product page
 */
@Component({
  selector: 'app-add-edit-food-product',
  templateUrl: 'add-edit-food-product.component.html',
  styleUrls: ['add-edit-food-product.component.scss'],
})
export class AddEditFoodProductComponent extends TabbedComponent implements OnInit {
  @ViewChild('ngForm')
  form: NgForm;

  @ViewChild(MatTable)
  selectedIngredientsTable: MatTable<any>;

  @ViewChild(LoadingButtonComponent)
  saveButton: LoadingButtonComponent;

  @ViewChild(MatSelect)
  matSelect: MatSelect;

  @Input()
  foodProduct: FoodProduct = null;

  /** Selected ingredient table columns */
  displayedColumns = ['name', 'companyCode', 'standardCode', 'amount', 'unit', 'delete'];

  /** Ingredients the user can pick from */
  ingredients: IngredientMinimal[];

  companies: Company[] = [];
  selectedCompanies: Company[] = [];

  isEditing = false;

  constructor(
    router: Router,
    private route: ActivatedRoute,
    private foodProductService: FoodProductService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private userService: UserService,
    private dialog: MatDialog
  ) {
    super(router, route);
  }

  ngOnInit() {
    // Get the data and assign it to the rows
    this.foodProductService.getIngredients().subscribe(
      (ingredients) => {
        this.ingredients = ingredients;
      },
      (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
    );

    // Get all the companies to be shown in the dropdown menu expect that of the user since the user's own company has rights per default
    this.authService.companies().subscribe((companies) => {
      this.userService.getUserProfile().subscribe((userProfile) => {
        this.companies = companies.filter((allCompanies) => allCompanies.id !== userProfile.companyId);
      });
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.foodProduct = {
          name: '',
          companyCode: '',
          standardCode: '',
          dosage: null,
          dosageUnit: '',
          packagings: [],
          ingredients: [],
          processingSteps: [],
          foodProductProperties: [],
        };
        return;
      }
      this.foodProductService.getById(id).subscribe(
        (product) => {
          // Get the user's profile
          this.userService.getUserProfile().subscribe((userProfile) => {
            if (!isCreator(product, userProfile)) {
              this.router.navigate(['inspect', id], {
                relativeTo: this.route.parent,
              });
            } else {
              this.foodProduct = product;
              // Get permissions of the loaded food product model
              this.foodProductService.getPermissions(this.foodProduct.id).subscribe((permissions) => {
                this.selectedCompanies = permissions.map((x) => x.company);
              });
            }
          });
        },
        (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
      );
      this.isEditing = true;
    });
  }

  /**
   * Update permissions to backend
   */
  updateFoodProductPermissions(id: string) {
    // Update the permissions of a food product
    return this.foodProductService.updatePermissions(
      id,
      this.selectedCompanies.map((x) => x.id)
    );
  }

  /** Comparator for company mat-select */
  compareCompanies(companyA: Company, companyB: Company) {
    return companyA?.id === companyB?.id;
  }

  /**
   * Add a new packaging to the food product
   */
  addPackaging() {
    this.foodProduct.packagings.push({
      name: '',
      companyCode: '',
      standardCode: '',
      shape: '',
      thickness: null,
      thicknessUnit: '',
    });
    this.form.control.markAsDirty();
  }

  /**
   * Delete packaging from the food product
   */
  deletePackaging(packaging) {
    const index = this.foodProduct.packagings.indexOf(packaging);
    (this.form.controls.packagings as FormGroup).removeControl('packaging-' + index);
    this.foodProduct.packagings.splice(index, 1);
    this.form.control.markAsDirty();
  }

  /**
   * Add a new property to the food product
   */
  addProperty() {
    this.foodProduct.foodProductProperties.push({ name: '', value: null, unit: '', method: '' });
    this.form.control.markAsDirty();
  }

  /**
   * Delete a property based on index
   */
  deleteProperty(index) {
    this.foodProduct.foodProductProperties.splice(index, 1);
    this.form.control.markAsDirty();
  }

  /**
   * Add a processing step to the food product
   */
  addProcessingStep() {
    this.foodProduct.processingSteps.push({
      name: '',
      equipment: '',
      properties: [{ name: '', value: null, unit: '' }],
    });
    this.form.control.markAsDirty();
  }

  /**
   * Delete a processing step based on index
   */
  deleteProcessingStep(index) {
    this.foodProduct.processingSteps.splice(index, 1);
    this.form.control.markAsDirty();
  }

  /**
   * Add a new processing step property to the processing step based on index
   */
  addProcessingStepProperty(index) {
    this.foodProduct.processingSteps[index].properties.push({ name: '', value: null, unit: '' });
    this.form.control.markAsDirty();
  }

  /**
   * Delete a processing step property based on index
   */
  deleteProcessingStepProperty(index, position) {
    this.foodProduct.processingSteps[index].properties.splice(position, 1);
    this.form.control.markAsDirty();
  }

  onIngredientAdded(ingredient: IngredientMinimal) {
    // Add new ingredient to the front of the array
    this.foodProduct.ingredients.splice(0, 0, { amount: 0, amountUnit: '', ...ingredient });
    this.selectedIngredientsTable.renderRows();
    // Show snackbar
    this.snackBar.open('Ingredient added', '', { duration: 1500 });
    this.form.control.markAsDirty();
  }

  tracker(index: number, item: any) {
    return { index, item };
  }

  getUniqueID(object) {
    return getID(object);
  }

  deleteIngredient(index: number) {
    this.foodProduct.ingredients.splice(index, 1);
    this.selectedIngredientsTable.renderRows();
    this.form.control.markAsDirty();
  }

  /**
   * Save the food product and it's permissions to the backend
   */
  saveFoodProduct() {
    if (this.isEditing) {
      this.foodProductService
        .update(this.foodProduct)
        .pipe(finalize(() => this.saveButton.completeLoading()))
        .subscribe(
          (updated) => {
            this.updateFoodProductPermissions(updated.id).subscribe(() => {
              this.snackBar.open('Food Product saved successfully', '', { duration: 2000 });
              this.foodProduct = updated;
              this.form.control.markAsPristine();
            });
          },
          (error) => {
            addFormServerErrors(this.form.controls.summary as FormGroup, error);
            addFormServerErrors(this.form.form, error);
          }
        );
    } else {
      this.foodProductService
        .add(this.foodProduct)
        .pipe(finalize(() => this.saveButton.completeLoading()))
        .subscribe(
          (created) => {
            this.updateFoodProductPermissions(created.id).subscribe(() => {
              this.snackBar.open('Food Product saved successfully', '', { duration: 2000 });
              this.foodProduct = created;
              this.router.navigate(['edit', created.id], {
                state: { tab: this.tabIndex },
                relativeTo: this.route.parent,
              });
            });
          },
          (error) => {
            addFormServerErrors(this.form.controls.summary as FormGroup, error);
            addFormServerErrors(this.form.form, error);
          }
        );
    }
  }

  /**
   * Cancel or show the cancellation dialog when there are changes
   */
  cancel() {
    if (!this.foodProduct) {
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
    if (this.isEditing) {
      this.router.navigate(['inspect', this.foodProduct.id], {
        relativeTo: this.route.parent,
        fragment: this.tabIndex.toString(),
      });
    } else {
      this.router.navigate(['../']);
    }
  }

  removeCompany(index: number) {
    // Deselect the option directly as the model binding does not update this.
    this.matSelect.options
      .find((item, _, __) => {
        return item.value.id === this.selectedCompanies[index].id;
      })
      .deselect();
  }
}

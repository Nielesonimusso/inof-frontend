import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddEditFoodProductComponent } from './add-edit-food-product.component';
import { HarnessLoader, ComponentHarness } from '@angular/cdk/testing';
import { DebugElement, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatTableModule } from '@angular/material/table';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Company, FoodProduct, FoodProductPermission, UserProfile } from '../../../models';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { of, throwError } from 'rxjs';
import { AuthService, FoodProductService, UserService } from 'src/app/services';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent, CancelEditsDialogAction } from '../../../components';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';

/**
 * The Page helper class gives easy access to parts of the page relevant to testing such as input fields or buttons.
 * https://angular.io/guide/testing#use-a-page-object
 */
class Page {
  get saveButton() {
    return this.queryHarness(MatButtonHarness, '#save');
  }

  get cancelButton() {
    return this.queryHarness(MatButtonHarness, '#cancel');
  }

  // Summary tab
  get nameInput() {
    return this.queryHarness(MatInputHarness, '#name');
  }
  get companyCodeInput() {
    return this.queryHarness(MatInputHarness, '#companyCode');
  }
  get standardCodeInput() {
    return this.queryHarness(MatInputHarness, '#standardCode');
  }
  get dosageInput() {
    return this.queryHarness(MatInputHarness, '#dosage');
  }
  get unitInput() {
    return this.queryHarness(MatInputHarness, '#unit');
  }
  get companiesDropDownMatSelect() {
    return this.queryHarness(MatSelectHarness, '#all-companies');
  }
  getDeleteSelectedCompaniesButton(i) {
    return this.queryHarness(MatButtonHarness, '#selected-company-delete-button-' + i);
  }

  // Packaging tab
  getPackagingNameInput(i) {
    return this.queryHarness(MatInputHarness, '#packaging-name-' + i);
  }
  getPackagingCompanyCodeInput(i) {
    return this.queryHarness(MatInputHarness, '#packaging-companyCode-' + i);
  }
  getPackagingStandardCodeInput(i) {
    return this.queryHarness(MatInputHarness, '#packaging-standardCode-' + i);
  }
  getPackagingThicknessInput(i) {
    return this.queryHarness(MatInputHarness, '#packaging-thickness-' + i);
  }
  getPackagingUnitInput(i) {
    return this.queryHarness(MatInputHarness, '#packaging-unit-' + i);
  }
  getPackagingDeleteButton(i) {
    return this.queryHarness(MatButtonHarness, '#packaging-delete-button-' + i);
  }
  get addPackagingButton() {
    return this.queryHarness(MatButtonHarness, '#button-add-packaging');
  }

  // Ingredients tab
  get table() {
    return this.queryHarness(MatTableHarness, '#ingredients-table');
  }
  getIngredientNameInput(i) {
    return this.queryHarness(MatInputHarness, '#ingredient-name-' + i);
  }
  getIngredientAmountInput(i) {
    return this.queryHarness(MatInputHarness, '#ingredient-amount-' + i);
  }
  getIngredientUnitInput(i) {
    return this.queryHarness(MatInputHarness, '#ingredient-unit-' + i);
  }
  getIngredientDeleteButton(i) {
    return this.queryHarness(MatButtonHarness, '#ingredient-delete-button-' + i);
  }

  // ProcessingStep tab
  getProcessingStepNameInput(i) {
    return this.queryHarness(MatInputHarness, '#processing-step-name-' + i);
  }
  getProcessingStepEquipmentInput(i) {
    return this.queryHarness(MatInputHarness, '#processing-step-equipment-' + i);
  }
  getProcessingStepPropertyNameInput(i, j) {
    return this.queryHarness(MatInputHarness, '#processing-step-property-name-' + i + '-' + j);
  }
  getProcessingStepPropertyValueInput(i, j) {
    return this.queryHarness(MatInputHarness, '#processing-step-property-value-' + i + '-' + j);
  }
  getProcessingStepPropertyUnitInput(i, j) {
    return this.queryHarness(MatInputHarness, '#processing-step-property-unit-' + i + '-' + j);
  }
  getProcessingStepPropertyAddButton(i) {
    return this.queryHarness(MatButtonHarness, '#processing-step-property-add-button-' + i);
  }
  getProcessingStepPropertyDeleteButton(i, j) {
    return this.queryHarness(MatButtonHarness, '#processing-step-property-delete-button-' + i + '-' + j);
  }
  getProcessingStepDeleteButton(i) {
    return this.queryHarness(MatButtonHarness, '#processing-step-delete-button-' + i);
  }
  get addProcessingStepButton() {
    return this.queryHarness(MatButtonHarness, '#processing-step-add-button');
  }

  // Properties tab
  getPropertyNameInput(i) {
    return this.queryHarness(MatInputHarness, '#property-name-' + i);
  }
  getPropertyValueInput(i) {
    return this.queryHarness(MatInputHarness, '#property-value-' + i);
  }
  getPropertyUnitInput(i) {
    return this.queryHarness(MatInputHarness, '#property-unit-' + i);
  }
  getPropertyMethodInput(i) {
    return this.queryHarness(MatInputHarness, '#property-method-' + i);
  }
  getPropertyDeleteButton(i) {
    return this.queryHarness(MatButtonHarness, '#property-delete-button-' + i);
  }
  get addPropertyButton() {
    return this.queryHarness(MatButtonHarness, '#property-add-button');
  }

  constructor(private loader: HarnessLoader) {}

  /**
   * Helper method to shorten the getters, this gets the Angular Material Harness with type (T) based on the selector
   * https://material.angular.io/guide/using-component-harnesses
   */
  private queryHarness<T extends ComponentHarness>(t: Type<T>, selector: string): Promise<T> {
    // @ts-ignore
    return this.loader.getHarness(t.with({ selector }));
  }
}

describe('AddEditFoodProductComponent', () => {
  let component: AddEditFoodProductComponent;
  let fixture: ComponentFixture<AddEditFoodProductComponent>;
  let loader: HarnessLoader;
  let page: Page;
  let getIngredientsSpy: jasmine.Spy;
  let foodProductService: jasmine.SpyObj<FoodProductService>;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let router: Router;
  let route: ActivatedRoute;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let navigateSpy;
  let navigateByUrlSpy;
  let el: DebugElement;

  beforeEach(async () => {
    foodProductService = jasmine.createSpyObj('FoodProductService', [
      'getIngredients',
      'add',
      'update',
      'getById',
      'getPermissions',
      'updatePermissions',
    ]);
    authService = jasmine.createSpyObj('AuthService', ['companies']);
    userService = jasmine.createSpyObj('UserService', ['getUserProfile']);
    getIngredientsSpy = foodProductService.getIngredients.and.returnValue(of([]));
    foodProductService.add.and.returnValue(of(getTestFoodProduct()));
    foodProductService.update.and.returnValue(of(getTestFoodProduct()));
    foodProductService.updatePermissions.and.returnValue(of(getTestPermissions()[0]));
    foodProductService.getPermissions.and.returnValue(of(getTestPermissions()));
    authService.companies.and.returnValue(of(getTestCompanies()));
    userService.getUserProfile.and.returnValue(of(getTestUser()));
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        NoopAnimationsModule,
        MatInputModule,
        MatButtonModule,
        FormsModule,
        RouterTestingModule,
        HttpClientModule,
        MatSelectModule,
        MatDialogModule,
      ],
      declarations: [AddEditFoodProductComponent, LoadingButtonComponent],
      providers: [
        { provide: FoodProductService, useValue: foodProductService },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: AuthService, useValue: authService },
        { provide: UserService, useValue: userService },
      ],
    });

    fixture = TestBed.createComponent(AddEditFoodProductComponent);
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
    navigateSpy = spyOn(router, 'navigate');
    navigateByUrlSpy = spyOn(router, 'navigateByUrl');
    component = fixture.componentInstance;
    component.saveButton = jasmine.createSpyObj('LoadingButtonComponent', ['completeLoading']);
    loader = TestbedHarnessEnvironment.loader(fixture);
    page = new Page(loader);
    el = fixture.debugElement;
  });

  it('should create', async () => {
    expect(component).toBeDefined();
  });

  /**
   * Summary Tab
   */

  it('should show empty values if no model is set', async () => {
    // Arrange
    const nameInput = await page.nameInput;
    const companyCodeInput = await page.companyCodeInput;
    const standardCodeInput = await page.standardCodeInput;
    const dosageInput = await page.dosageInput;
    const unitInput = await page.unitInput;
    const companyDropDownMatSelect = await page.companiesDropDownMatSelect;

    // Assert
    expect(await nameInput.getValue()).toBe('');
    expect(await companyCodeInput.getValue()).toBe('');
    expect(await standardCodeInput.getValue()).toBe('');
    expect(await dosageInput.getValue()).toBe('');
    expect(await unitInput.getValue()).toBe('');
    expect(await companyDropDownMatSelect.getOptions()).toEqual([]);
  });

  it('should display the selected companies under the dropdown', async () => {
    // Arrange
    const expectedCompanies = [getTestCompanies()[1]];
    fixture.detectChanges();

    component.foodProduct = getTestFoodProduct();
    component.selectedCompanies = [expectedCompanies[0]];
    fixture.detectChanges();

    await fixture.whenStable();
    const selectedCompaniesList = el.query(By.css('#selected-companies'));
    expect(selectedCompaniesList.nativeElement.textContent).toContain(expectedCompanies[0].name);
    expect(selectedCompaniesList.nativeElement.textContent).not.toContain(getTestCompanies()[2].name);
  });

  it('should remove the the company where you click X next to and check that it is unselected from the dropdown', async () => {
    component.selectedCompanies = [getTestCompanies()[1]];
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();

    await fixture.whenStable();
    /**
     * Check if the companies that get removed from the list are also unselected from the dropdown.
     */
    await (await page.getDeleteSelectedCompaniesButton(0)).click();
    // after the click of the deletion button the selectedCompanies is empty in this case and thus is in the dropdown as well
    await (await page.companiesDropDownMatSelect).open();
    const options = await (await page.companiesDropDownMatSelect).getOptions();
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < options.length; i++) {
      if (component.selectedCompanies.find((company, _, __) => company.id === component.companies[i].id)) {
        expect(await options[i].isSelected()).toBeFalse();
      }
    }
  });

  it('should only show the selectedCompanies as selected in the dropdown', async () => {
    component.selectedCompanies = [getTestCompanies()[1]];
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();

    await (await page.companiesDropDownMatSelect).open();
    const options = await (await page.companiesDropDownMatSelect).getOptions();

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < options.length; i++) {
      if (component.selectedCompanies.find((company, _, __) => company.id === component.companies[i].id)) {
        expect(await options[i].isSelected()).toBeTrue();
      } else {
        expect(await options[i].isSelected()).toBeFalse();
      }
    }
    await (await page.companiesDropDownMatSelect).close();
  });

  it('should show food product if product set', async () => {
    // Arrange
    const newFoodProduct = getTestFoodProduct();
    const expectedFoodProduct = getTestFoodProduct();

    // Act
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    component.companies = getTestCompanies();
    component.selectedCompanies = [getTestCompanies()[0]];
    fixture.detectChanges();

    // Assert
    // Summary
    expect(await (await page.nameInput).getValue()).toEqual(expectedFoodProduct.name);
    expect(await (await page.companyCodeInput).getValue()).toEqual(expectedFoodProduct.companyCode);
    expect(await (await page.standardCodeInput).getValue()).toEqual(expectedFoodProduct.standardCode);
    expect(await (await page.dosageInput).getValue()).toEqual(expectedFoodProduct.dosage.toString());
    expect(await (await page.unitInput).getValue()).toEqual(expectedFoodProduct.dosageUnit);
    /**
     * Check if the MatSelect is valid, supports multi-selection mode and all the companies that are selected to be truly selected
     * and the rest are not selected
     */
    expect(await (await page.companiesDropDownMatSelect).isValid());
    expect(await (await page.companiesDropDownMatSelect).isMultiple());

    //  Packaging
    for (let i = 0; i < expectedFoodProduct.packagings.length; i++) {
      expect(await (await page.getPackagingNameInput(i)).getValue()).toEqual(expectedFoodProduct.packagings[i].name);
      expect(await (await page.getPackagingCompanyCodeInput(i)).getValue()).toEqual(
        expectedFoodProduct.packagings[i].companyCode
      );
      expect(await (await page.getPackagingStandardCodeInput(i)).getValue()).toEqual(
        expectedFoodProduct.packagings[i].standardCode
      );
      expect(await (await page.getPackagingThicknessInput(i)).getValue()).toBe(
        expectedFoodProduct.packagings[i].thickness.toString()
      );
      expect(await (await page.getPackagingUnitInput(i)).getValue()).toEqual(
        expectedFoodProduct.packagings[i].thicknessUnit
      );
    }
    //  Processing Steps
    for (let i = 0; i < expectedFoodProduct.processingSteps.length; i++) {
      expect(await (await page.getProcessingStepNameInput(i)).getValue()).toEqual(
        expectedFoodProduct.processingSteps[i].name
      );
      expect(await (await page.getProcessingStepEquipmentInput(i)).getValue()).toEqual(
        expectedFoodProduct.processingSteps[i].equipment
      );
      for (let j = 0; j < expectedFoodProduct.processingSteps[i].properties.length; j++) {
        expect(await (await page.getProcessingStepPropertyNameInput(i, j)).getValue()).toEqual(
          expectedFoodProduct.processingSteps[i].properties[j].name
        );
        expect(await (await page.getProcessingStepPropertyValueInput(i, j)).getValue()).toEqual(
          expectedFoodProduct.processingSteps[i].properties[j].value.toString()
        );
        expect(await (await page.getProcessingStepPropertyUnitInput(i, j)).getValue()).toEqual(
          expectedFoodProduct.processingSteps[i].properties[j].unit
        );
      }
    }
    //  Properties
    for (let i = 0; i < expectedFoodProduct.foodProductProperties.length; i++) {
      expect(await (await page.getPropertyNameInput(i)).getValue()).toEqual(
        expectedFoodProduct.foodProductProperties[i].name
      );
      expect(await (await page.getPropertyValueInput(i)).getValue()).toEqual(
        expectedFoodProduct.foodProductProperties[i].value.toString()
      );
      expect(await (await page.getPropertyUnitInput(i)).getValue()).toEqual(
        expectedFoodProduct.foodProductProperties[i].unit
      );
      expect(await (await page.getPropertyMethodInput(i)).getValue()).toEqual(
        expectedFoodProduct.foodProductProperties[i].method
      );
    }
  });

  /**
   * Packaging Tab
   */

  it('should allow user to add packaging', async () => {
    // Arrange
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();
    const expectedLength = component.foodProduct.packagings.length + 1;

    // Act
    await (await page.addPackagingButton).click();

    // Assert
    expect(component.foodProduct.packagings.length).toBe(expectedLength);
    const addedPackaging = component.foodProduct.packagings[expectedLength - 1];
    expect(addedPackaging.name).toBe('');
    expect(addedPackaging.companyCode).toBe('');
    expect(addedPackaging.standardCode).toBe('');
    expect(addedPackaging.thickness).toBe(null);
    expect(addedPackaging.thicknessUnit).toBe('');
  });

  it('should allow user to remove packaging', async () => {
    // Arrange
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();
    const expectedLength = component.foodProduct.packagings.length - 1;
    const packagingToRemove = component.foodProduct.packagings[expectedLength];

    // Act
    await (await page.getPackagingDeleteButton(expectedLength)).click();
    fixture.detectChanges();

    // Assert
    expect(component.foodProduct.packagings.length).toBe(expectedLength);
    expect(component.foodProduct.packagings.indexOf(packagingToRemove)).toBe(-1);
  });

  /**
   * Ingredients Tab
   */

  it('should show all columns for selected ingredients table', async () => {
    // Arrange
    const expectedColumnNames: string[] = ['Name', 'Company Code', 'Standard Code', 'Amount', 'Unit', ''];
    fixture.detectChanges();

    // Assert
    const table = await page.table;
    const headerRows = await table.getHeaderRows();
    expect(headerRows.length).toBe(1, 'expects one header row');

    const text = await headerRows[0].getCellTextByIndex();
    expect(text.length).toBe(expectedColumnNames.length, 'expects header to have same amount of columns');
    text.forEach((value, idx) => {
      expect(value).toBe(expectedColumnNames[idx], 'expects column names to match expected value');
    });
  });

  it('should display no rows if no rows are set in the selected ingredients table', async () => {
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();
    component.foodProduct.ingredients = [];
    fixture.detectChanges();

    const table = await page.table;
    const rows = await table.getRows();
    expect(rows.length).toBe(0, 'expects 0 rows if no input is set');
  });

  it('should show all entries correctly', async () => {
    // Arrange
    const testIngredients = getTestFoodProduct().ingredients;
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();

    // Get regular data rows
    const table = await page.table;
    const rows = await table.getRows();
    expect(rows.length).toBe(testIngredients.length);

    for (let i = 0; i < testIngredients.length; i++) {
      const text = await rows[i].getCellTextByIndex();
      expect(await (await page.getIngredientNameInput(i)).getValue()).toBe(testIngredients[i].name);
      expect(text[1]).toBe(testIngredients[i].companyCode);
      expect(text[2]).toBe(testIngredients[i].standardCode);
    }
  });

  it('should allow user to change ingredients name, amount and unit', async () => {
    // Arrange
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();
    const nameInput = await page.getIngredientNameInput(0);
    const amountInput = await page.getIngredientAmountInput(0);
    const unitInput = await page.getIngredientUnitInput(0);

    // detect changes
    fixture.detectChanges();
    await nameInput.setValue('test');
    await amountInput.setValue('13');
    await unitInput.setValue('mg');
    fixture.detectChanges();

    expect(component.foodProduct.ingredients[0].name).toBe('test');
    expect(component.foodProduct.ingredients[0].amount).toBe(13);
    expect(component.foodProduct.ingredients[0].amountUnit).toBe('mg');
  });

  it('should add an ingredient when onIngredientAdded is called', async () => {
    // Arrange
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();
    const expectedLength = component.foodProduct.ingredients.length + 1;
    const ingredient = {
      name: 'Product 16',
      companyCode: 'NL1234',
      standardCode: 'STANDAARD',
    };

    // Act
    component.onIngredientAdded(ingredient);

    // Assert
    expect(component.foodProduct.ingredients.length).toBe(expectedLength);
    const addedIngredient = component.foodProduct.ingredients[0];
    expect(addedIngredient.name).toBe(ingredient.name);
    expect(addedIngredient.companyCode).toBe(ingredient.companyCode);
    expect(addedIngredient.standardCode).toBe(ingredient.standardCode);
    expect(addedIngredient.amount).toBe(0);
    expect(addedIngredient.amountUnit).toBe('');
    expect(snackBar.open).toHaveBeenCalledWith('Ingredient added', '', { duration: 1500 });
  });

  it('should remove a selected ingredient when the remove button is pressed', async () => {
    // Arrange
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();
    const expectedLength = component.foodProduct.ingredients.length - 1;
    const ingredientToRemoveIndex = 0;
    const ingredientToRemove = component.foodProduct.ingredients[ingredientToRemoveIndex];

    // Act
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    await (await page.getIngredientDeleteButton(ingredientToRemoveIndex)).click();
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert
    expect(component.foodProduct.ingredients.length).toBe(expectedLength);
    expect(component.foodProduct.ingredients.indexOf(ingredientToRemove)).toBe(-1);
  });

  /**
   * Processing Tab
   */

  it('should allow user to add a processing step', async () => {
    // Arrange
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();
    const expectedLength = component.foodProduct.processingSteps.length + 1;
    fixture.detectChanges();

    // Act
    await (await page.addProcessingStepButton).click();

    // Assert
    expect(component.foodProduct.processingSteps.length).toBe(expectedLength);
    const addedProcessingStep = component.foodProduct.processingSteps[expectedLength - 1];
    expect(addedProcessingStep.name).toBe('');
    expect(addedProcessingStep.equipment).toBe('');
    // Expect property to have been added too
    expect(addedProcessingStep.properties.length).toBe(1);
  });

  it('should allow user to remove a processing step', async () => {
    // Arrange
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();
    const expectedLength = component.foodProduct.processingSteps.length - 1;
    const stepToRemove = component.foodProduct.processingSteps[expectedLength];

    // Act
    await (await page.getProcessingStepDeleteButton(expectedLength)).click();

    // Assert
    expect(component.foodProduct.processingSteps.length).toBe(expectedLength);
    expect(component.foodProduct.processingSteps.indexOf(stepToRemove)).toBe(-1);
  });

  it('should allow user to add a processing step property', async () => {
    // Arrange
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();
    component.foodProduct.processingSteps.push({ name: 'PS', equipment: 'eq', properties: [] });
    const expectedLength = component.foodProduct.processingSteps[0].properties.length + 1;
    fixture.detectChanges();

    // Act
    await (await page.getProcessingStepPropertyAddButton(0)).click();

    // Assert
    expect(component.foodProduct.processingSteps[0].properties.length).toBe(expectedLength);
    const addedProperty = component.foodProduct.processingSteps[0].properties[expectedLength - 1];
    expect(addedProperty.name).toBe('');
    expect(addedProperty.value).toBe(null);
    expect(addedProperty.unit).toBe('');
  });

  it('should allow user to remove a processing step property', async () => {
    // Arrange
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();
    const expectedLength = component.foodProduct.processingSteps[0].properties.length - 1;
    const propertyToRemove = component.foodProduct.processingSteps[0].properties[expectedLength];

    // Act
    await (await page.getProcessingStepPropertyDeleteButton(0, expectedLength)).click();
    fixture.detectChanges();

    // Assert
    expect(component.foodProduct.processingSteps[0].properties.length).toBe(expectedLength);
    expect(component.foodProduct.processingSteps[0].properties.indexOf(propertyToRemove)).toBe(-1);
  });

  /**
   * Properties Tab
   */

  it('should allow user to add a property', async () => {
    // Arrange
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();
    const expectedLength = component.foodProduct.foodProductProperties.length + 1;

    // Act
    await (await page.addPropertyButton).click();

    // Assert
    expect(component.foodProduct.foodProductProperties.length).toBe(expectedLength);
    const addedProperty = component.foodProduct.foodProductProperties[expectedLength - 1];
    expect(addedProperty.name).toBe('');
    expect(addedProperty.value).toBe(null);
    expect(addedProperty.unit).toBe('');
    expect(addedProperty.method).toBe('');
  });

  it('should allow user to remove a property', async () => {
    // Arrange
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();
    const expectedLength = component.foodProduct.foodProductProperties.length - 1;
    const propertyToRemove = component.foodProduct.foodProductProperties[expectedLength];

    // Act
    await (await page.getPropertyDeleteButton(expectedLength)).click();
    fixture.detectChanges();

    // Assert
    expect(component.foodProduct.foodProductProperties.length).toBe(expectedLength);
    expect(component.foodProduct.foodProductProperties.indexOf(propertyToRemove)).toBe(-1);
  });

  it('should try to save a food product to the backend when save is pressed', async () => {
    // Arrange
    const expectedParentRoute = new ActivatedRoute();
    spyOnProperty(route, 'parent').and.returnValue(expectedParentRoute);

    const expectedFoodProduct = getTestFoodProduct();
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    fixture.detectChanges();

    // Act
    await (await page.saveButton).click();

    // Assert
    expect(foodProductService.add).toHaveBeenCalledWith(expectedFoodProduct);
    expect(snackBar.open).toHaveBeenCalledWith('Food Product saved successfully', '', Object({ duration: 2000 }));
  });

  it('should try to update a food product to the backend when save is pressed and isEditing is true', async () => {
    // Arrange
    const expectedParentRoute = new ActivatedRoute();
    spyOnProperty(route, 'parent').and.returnValue(expectedParentRoute);

    const expectedFoodProduct = getTestFoodProduct();
    fixture.detectChanges();
    component.foodProduct = getTestFoodProduct();
    component.isEditing = true;
    fixture.detectChanges();

    // Act
    await (await page.saveButton).click();

    // Assert
    expect(foodProductService.update).toHaveBeenCalledWith(expectedFoodProduct);
  });

  it('should use route parameter id', () => {
    // Arrange
    spyOnProperty(route, 'paramMap').and.returnValue(of(convertToParamMap({ id: '1' })));
    const getById = foodProductService.getById.and.returnValue(of(getTestFoodProduct()));

    // Act
    fixture.detectChanges();

    expect(getById).toHaveBeenCalledWith('1');
    expect(component.foodProduct).toEqual(getTestFoodProduct());
  });

  it('should navigate to the error page when getting ingredients fails', () => {
    // Arrange
    getIngredientsSpy.and.returnValue(throwError({}));

    // Act
    fixture.detectChanges();

    // Assert
    expect(getIngredientsSpy).toHaveBeenCalled();
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/error', { skipLocationChange: true });
  });

  it('should navigate to the error page when getting food product fails', () => {
    // Arrange
    spyOnProperty(route, 'paramMap').and.returnValue(of(convertToParamMap({ id: '1' })));
    const getById = foodProductService.getById.and.returnValue(throwError({}));

    // Act
    fixture.detectChanges();

    expect(getById).toHaveBeenCalledWith('1');
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/error', { skipLocationChange: true });
  });

  describe('Cancellation', () => {
    let providedFoodProduct: FoodProduct;
    beforeEach(() => {
      providedFoodProduct = getTestFoodProduct();
      component.foodProduct = providedFoodProduct;
      component.isEditing = true;
      fixture.detectChanges();
    });

    it('show dialog CLOSE', async () => {
      // Arrange
      fixture.detectChanges();
      const expected = component.foodProduct;
      expected.name = 'Different';

      // Dialog
      const dialogRefSpyObj = jasmine.createSpyObj({
        afterClosed: of(CancelEditsDialogAction.CLOSE_DIALOG),
        close: null,
      });
      dialogRefSpyObj.componentInstance = { body: '' };
      const openDialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);

      // Service
      const serviceSpy = foodProductService.update.and.returnValue(of(expected));
      // UI
      const nameInput = await page.nameInput;
      const cancelButton = await page.cancelButton;

      // Act
      await nameInput.setValue(expected.name);
      fixture.detectChanges();
      await cancelButton.click();

      // Assert
      expect(openDialogSpy).toHaveBeenCalled();
      expect(serviceSpy).not.toHaveBeenCalledWith(expected);
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('show dialog NO SAVE', async () => {
      // Arrange
      fixture.detectChanges();
      const expected = component.foodProduct;
      expected.name = 'Different';

      // Router
      const expectedParentRoute = new ActivatedRoute();
      spyOnProperty(route, 'parent').and.returnValue(expectedParentRoute);

      // Dialog
      const dialogRefSpyObj = jasmine.createSpyObj({
        afterClosed: of(CancelEditsDialogAction.NO_SAVE),
        close: null,
      });
      dialogRefSpyObj.componentInstance = { body: '' };
      const openDialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);

      // Service
      const serviceSpy = foodProductService.update.and.returnValue(of(expected));
      // UI
      const nameInput = await page.nameInput;
      const cancelButton = await page.cancelButton;

      // Act
      await nameInput.setValue(expected.name);
      fixture.detectChanges();
      await cancelButton.click();

      // Assert
      expect(openDialogSpy).toHaveBeenCalled();
      expect(serviceSpy).not.toHaveBeenCalledWith(expected);
      expect(navigateSpy).toHaveBeenCalledWith(['inspect', providedFoodProduct.id], {
        relativeTo: expectedParentRoute,
        fragment: component.tabIndex.toString(),
      });
    });

    it('should redirect to inspect page after cancellation by user', async () => {
      // Arrange
      const expectedParentRoute = new ActivatedRoute();
      spyOnProperty(route, 'parent').and.returnValue(expectedParentRoute);
      const cancelButton = await page.cancelButton;

      // Act
      await cancelButton.click();

      // Assert
      expect(navigateSpy).toHaveBeenCalledWith(['inspect', providedFoodProduct.id], {
        relativeTo: expectedParentRoute,
        fragment: component.tabIndex.toString(),
      });
    });

    it('should redirect to parent page after cancellation on add', async () => {
      // Arrange
      component.isEditing = false;
      fixture.detectChanges();
      const cancelButton = await page.cancelButton;

      // Act
      await cancelButton.click();

      // Assert
      expect(navigateSpy).toHaveBeenCalledWith(['../']);
    });

    it('should not take action on cancel while loading', async () => {
      // Arrange
      fixture.detectChanges();
      const cancelButton = await page.cancelButton;

      // Act
      component.foodProduct = null;
      fixture.detectChanges();
      await cancelButton.click();

      // Assert
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });
});

function getTestUser(): UserProfile {
  return {
    companyId: '1',
    fullName: 'Full Name',
    username: 'username123',
    company: {
      id: '1',
      name: 'Company A',
    },
    email: 'email@domain.com',
  };
}

function getTestCompanies(): Company[] {
  return [
    {
      id: '1',
      name: 'Company A',
    },
    {
      id: '2',
      name: 'Company B',
    },
    {
      id: '3',
      name: 'Company C',
    },
  ];
}

function getTestPermissions(): FoodProductPermission[] {
  return [
    {
      company: {
        id: '3',
        name: 'Company A',
      },
      companyId: '555',
      foodProduct: getTestFoodProduct(),
      foodProductId: '44',
    },
  ];
}

function getTestFoodProduct(): FoodProduct {
  return {
    name: 'name',
    companyCode: '83279',
    standardCode: '23857',
    dosage: 650,
    dosageUnit: 'g',
    owner: {
      id: '1',
      name: '555',
      address: '1111',
    },
    createdBy: {
      fullName: 'Full Name',
      username: 'username123',
    },
    packagings: [
      {
        name: 'packaging name',
        companyCode: '28973',
        standardCode: 'standard name',
        shape: 'box',
        thickness: 100,
        thicknessUnit: 'mm',
      },
      {
        name: 'packaging name 2',
        companyCode: '34578',
        standardCode: '29589',
        shape: 'box',
        thickness: 10,
        thicknessUnit: 'cm',
      },
    ],
    ingredients: [
      {
        name: 'Product 6',
        companyCode: 'NL9876',
        standardCode: 'STANDAARD',
        amount: 234,
        amountUnit: 'kg',
      },
    ],
    processingSteps: [
      {
        name: 'process',
        equipment: 'equipment',
        properties: [
          {
            name: 'propertyName',
            value: 389,
            unit: 'g',
          },
          {
            name: 'propertyName2',
            value: 72,
            unit: 'cg',
          },
          {
            name: 'propertyName3',
            value: 438,
            unit: 'mg',
          },
        ],
      },
      {
        name: 'process2',
        equipment: 'equipment2',
        properties: [
          {
            name: 'propertyName4',
            value: 39,
            unit: 'kg',
          },
        ],
      },
    ],
    foodProductProperties: [
      {
        name: 'Test Prop',
        value: 3,
        unit: 'kg',
        method: '?',
      },
    ],
  };
}

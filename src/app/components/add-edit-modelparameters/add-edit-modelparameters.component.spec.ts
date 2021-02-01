import { ModelParameter, LanguageLabel } from '../../models';
import { AddEditModelParametersComponent } from './add-edit-modelparameters.component';
import { Type } from '@angular/core';
import { FormsModule, NgModelGroup, ReactiveFormsModule, NgForm } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader, ComponentHarness } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

/**
 * The Page helper class gives easy access to parts of the page relevant to testing such as input fields or buttons.
 * https://angular.io/guide/testing#use-a-page-object
 */
class Page {
  get addIODescriptionButton() {
    return this.queryHarness(MatButtonHarness, '#add-io-description');
  }
  getRemoveIODescriptionButton(i) {
    return this.queryHarness(MatButtonHarness, '#remove-io-description-' + i);
  }
  getAddLabelButton(i) {
    return this.queryHarness(MatButtonHarness, '#add-label-' + i);
  }
  getRemoveLabelButton(i, j) {
    return this.queryHarness(MatButtonHarness, '#remove-label-' + i + '-' + j);
  }
  getLabel(i, j) {
    return this.queryHarness(MatInputHarness, '#label-' + i + '-' + j);
  }
  getLabelLanguage(i, j) {
    return this.queryHarness(MatSelectHarness, '#label-lang-' + i + '-' + j);
  }
  getDescription(i) {
    return this.queryHarness(MatInputHarness, '#description-' + i);
  }
  getUnit(i) {
    return this.queryHarness(MatInputHarness, '#unit-' + i);
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

describe('AddEditModelParametersComponent', () => {
  let component: AddEditModelParametersComponent;
  let fixture: ComponentFixture<AddEditModelParametersComponent>;
  let loader: HarnessLoader;
  let page: Page;
  let modelGroup: NgModelGroup;

  beforeEach(async () => {
    const form = new NgForm([], []);
    modelGroup = new NgModelGroup(form, [], []);
    form.addFormGroup(modelGroup);

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
      ],
      declarations: [AddEditModelParametersComponent],
      providers: [{ provide: NgModelGroup, useValue: modelGroup }],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditModelParametersComponent);
    component = fixture.componentInstance;
    component.paramName = 'test';

    loader = TestbedHarnessEnvironment.loader(fixture);
    page = new Page(loader);
  });

  it('should create', () => {
    // Assert
    expect(component).toBeDefined();
  });

  it('should display provided parameter', async () => {
    // Arrange
    const newModelParameters = getTestParameters();
    const expected = getTestParameters();

    // Act
    component.parameters = newModelParameters;
    fixture.detectChanges();

    // Assert
    for (let i = 0; i < expected.length; i++) {
      expect(await (await page.getDescription(i)).getValue()).toEqual(expected[i].description);
      expect(await (await page.getUnit(i)).getValue()).toEqual(expected[i].unit);
      for (let j = 0; j < expected[i].labels.length; j++) {
        expect(await (await page.getLabel(i, j)).getValue()).toEqual(expected[i].labels[j].name);
        expect(await (await page.getLabelLanguage(i, j)).getValueText()).toEqual(expected[i].labels[j].language);
      }
    }
  });

  it('should add a parameter when the add button is pressed', async () => {
    // Arrange
    component.parameters = getTestParameters();
    fixture.detectChanges();
    const expectedLength = component.parameters.length + 1;

    // Act
    await (await page.addIODescriptionButton).click();

    // Assert
    expect(component.parameters.length).toBe(expectedLength);
    expect(component.parameters[component.parameters.length - 1]).toEqual({
      labels: [{ name: '', language: LanguageLabel.en }],
      description: '',
      unit: '',
    });
  });

  it('should remove a parameter when the delete button is pressed', async () => {
    // Arrange
    component.parameters = getTestParameters();
    const expectedLength = component.parameters.length - 1;
    const expectedArray = component.parameters.slice(0, component.parameters.length - 1);
    fixture.detectChanges();

    // Act
    await (await page.getRemoveIODescriptionButton(component.parameters.length - 1)).click();

    // Assert
    expect(component.parameters.length).toBe(expectedLength);
    expect(component.parameters).toEqual(expectedArray);
  });

  it('should add a label to a parameter when the add label button is pressed', async () => {
    // Arrange
    component.parameters = getTestParameters();
    fixture.detectChanges();
    const expectedLength = component.parameters[0].labels.length + 1;

    // Act
    await (await page.getAddLabelButton(0)).click();

    // Assert
    expect(component.parameters[0].labels.length).toBe(expectedLength);
    expect(component.parameters[0].labels[component.parameters[0].labels.length - 1]).toEqual({
      name: '',
      language: LanguageLabel.en,
    });
  });

  it('should remove a label from a parameter when the remove button is pressed', async () => {
    // Arrange
    component.parameters = getTestParameters();
    const expectedLength = component.parameters[0].labels.length - 1;
    const expectedArray = component.parameters[0].labels.slice(0, component.parameters[0].labels.length - 1);
    fixture.detectChanges();

    // Act
    await (await page.getRemoveLabelButton(0, component.parameters[0].labels.length - 1)).click();

    // Assert
    expect(component.parameters[0].labels.length).toBe(expectedLength);
    expect(component.parameters[0].labels).toEqual(expectedArray);
  });

  it('should show all languages as options', async () => {
    // Arrange
    const newModelParameters = getTestParameters();
    const expectedLanguages = [LanguageLabel.en, LanguageLabel.nl];

    // Act
    component.parameters = newModelParameters;
    fixture.detectChanges();

    const languageSelect = await page.getLabelLanguage(0, 0);
    (await languageSelect.host()).click();
    const options = await languageSelect.getOptions();

    // Assert
    expect(component.languages).toEqual(expectedLanguages);

    expect(options.length).toBe(expectedLanguages.length);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < options.length; i++) {
      const text = await options[i].getText();
      expect(expectedLanguages.map((label) => label.valueOf())).toContain(text);
    }
  });
});

function getTestParameters(): ModelParameter[] {
  return [
    {
      labels: [
        { name: 'Input 1', language: LanguageLabel.en },
        { name: 'Input 1', language: LanguageLabel.nl },
      ],
      description: 'First input',
      unit: 'kg',
    },
    { labels: [{ name: 'Output 1', language: LanguageLabel.en }], description: 'First output', unit: 'mg' },
  ];
}

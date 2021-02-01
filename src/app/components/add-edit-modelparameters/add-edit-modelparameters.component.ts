import { Component, Input, ViewChild } from '@angular/core';
import { NgModelGroup, ControlContainer } from '@angular/forms';
import { ModelParameter, LanguageLabel, ModelParameterLabel } from '../../models';
import { getID } from '../../utilities/uniqueObjectHelper';

/**
 * @title Add / Edit IODescription view for Add / Edit Model Page
 */
@Component({
  selector: 'app-add-edit-modelparameters',
  styleUrls: ['add-edit-modelparameters.component.scss'],
  templateUrl: 'add-edit-modelparameters.component.html',
  viewProviders: [{ provide: ControlContainer, useExisting: NgModelGroup }],
})
export class AddEditModelParametersComponent {
  // Group containing all parameters for error handling
  @ViewChild('ngAllParameters')
  modelGroup: NgModelGroup;

  // Name of the type of parameters
  @Input()
  paramName: string;

  // Parameter model
  @Input()
  parameters: ModelParameter[] = [
    {
      labels: [{ name: '', language: LanguageLabel.en }],
      description: '',
      unit: '',
    },
  ];

  // Languages that can be selected for the parameters
  languages: LanguageLabel[] = Object.keys(LanguageLabel).map((k) => LanguageLabel[k as any]);

  getUniqueID(object) {
    return getID(object);
  }

  addParameter() {
    // Push new parameter with one label by default
    this.parameters.push({
      labels: [{ name: '', language: LanguageLabel.en }],
      description: '',
      unit: '',
    });
    this.modelGroup.control.markAsDirty();
  }

  addLabel(param: ModelParameter) {
    // Push a new label, english by default
    param.labels.push({ name: '', language: LanguageLabel.en });
    this.modelGroup.control.markAsDirty();
  }

  removeParameter(param: ModelParameter) {
    const index = this.parameters.indexOf(param);
    this.parameters.splice(index, 1);
    this.modelGroup.control.markAsDirty();
  }

  removeLabel(param: ModelParameter, label: ModelParameterLabel) {
    const index = param.labels.indexOf(label);
    param.labels.splice(index, 1);
    this.modelGroup.control.markAsDirty();
  }
}

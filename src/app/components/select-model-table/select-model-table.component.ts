import { Model } from '../../models';
import { Component } from '@angular/core';
import { AbstractSelectTableComponent } from '../abstract-select-table';

@Component({
  selector: 'app-select-model-table',
  styleUrls: ['select-model-table.component.scss'],
  templateUrl: 'select-model-table.component.html',
})
export class SelectModelTableComponent extends AbstractSelectTableComponent<Model> {
  // Define names of the columns
  displayedColumns = ['name', 'description', 'price', 'select'];

  // Overwrite specific filter function for respective scenario
  filterFunction = (data: Model, filter: string) => {
    return data.name.toLowerCase().includes(filter.toLowerCase()); // match name
  };
}

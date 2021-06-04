import { DataSource } from '../../models';
import { Component } from '@angular/core';
import { AbstractSelectTableComponent } from '../abstract-select-table';

@Component({
  selector: 'app-select-data-source-table',
  styleUrls: ['select-data-source-table.component.scss'],
  templateUrl: 'select-data-source-table.component.html',
})
export class SelectDataSourceTableComponent extends AbstractSelectTableComponent<DataSource> {
  // Define names of the columns
  displayedColumns = ['name', 'price', 'select'];

  // Overwrite specific filter function for respective scenario
  filterFunction = (data: DataSource, filter: string) => {
    return data.name.toLowerCase().includes(filter.toLowerCase()); // match name
  };
}

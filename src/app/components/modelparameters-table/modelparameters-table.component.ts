import { Component, OnInit, Input } from '@angular/core';
import { ModelArgument, ModelArgumentColumn } from '../../models';

@Component({
  selector: 'app-modelparameters-table',
  templateUrl: './modelparameters-table.component.html',
  styleUrls: ['./modelparameters-table.component.scss'],
})
export class ModelParameterTableComponent implements OnInit {
  /**
   * Set the displayed columns of the table
   */
  displayedColumns = ['name', 'columns'];

  /**
   * The data of the table
   */
  @Input() inputs: ModelArgument[] = [];

  public stringFor = (column: ModelArgumentColumn): string => {
    return `${column.name} (${column.datatype})`
  };

  // public stringFor = (label: ModelParameterLabel): string => {
  //   return `${label.name} (${label.language})`;
  // };

  ngOnInit(): void {}
}

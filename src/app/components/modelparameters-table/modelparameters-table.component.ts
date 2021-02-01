import { Component, OnInit, Input } from '@angular/core';
import { ModelParameterLabel, ModelParameter } from '../../models';

@Component({
  selector: 'app-modelparameters-table',
  templateUrl: './modelparameters-table.component.html',
  styleUrls: ['./modelparameters-table.component.scss'],
})
export class ModelParameterTableComponent implements OnInit {
  /**
   * Set the displayed columns of the table
   */
  displayedColumns = ['labels', 'unit', 'description'];

  /**
   * The data of the table
   */
  @Input() inputs: ModelParameter[] = [];

  public stringFor = (label: ModelParameterLabel): string => {
    return `${label.name} (${label.language})`;
  };

  ngOnInit(): void {}
}

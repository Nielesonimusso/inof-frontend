import { Component } from '@angular/core';
import { AbstractSelectTableComponent } from '../abstract-select-table';
import { IngredientMinimal } from '../../models';

/**
 * Table in which ingredients can be selected through the `add` button.
 */
@Component({
  selector: 'app-select-ingredients-table',
  templateUrl: './select-ingredients-table.component.html',
  styleUrls: ['./select-ingredients-table.component.scss'],
})
export class SelectIngredientsTableComponent extends AbstractSelectTableComponent<IngredientMinimal> {
  // Table columns to display
  displayedColumns = ['name', 'companyCode', 'standardCode', 'add'];

  // Overwrite specific filter function for ingredients scenario. match name, companyCode or standardCode
  filterFunction = (data, filter: string) => {
    return (
      data.name.toLowerCase().includes(filter.toLowerCase()) ||
      data.companyCode.toLowerCase().includes(filter.toLowerCase()) ||
      data.standardCode.toLowerCase().includes(filter.toLowerCase())
    );
  };
}

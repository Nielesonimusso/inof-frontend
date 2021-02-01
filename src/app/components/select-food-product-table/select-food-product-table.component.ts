import { FoodProduct } from '../../models';
import { Component } from '@angular/core';
import { AbstractSelectTableComponent } from '../abstract-select-table';

@Component({
  selector: 'app-select-food-product-table',
  styleUrls: ['select-food-product-table.component.scss'],
  templateUrl: 'select-food-product-table.component.html',
})
export class SelectFoodProductTableComponent extends AbstractSelectTableComponent<FoodProduct> {
  // Define names of the columns
  displayedColumns = ['name', 'companyCode', 'standardCode', 'select'];

  // Overwrite specific filter function for respective scenario
  filterFunction = (data: FoodProduct, filter: string) => {
    return data.name.toLowerCase().includes(filter.toLowerCase()); // match name
  };
}

import { Component, OnInit } from '@angular/core';
import { FoodProductService } from '../../../services';
import { FoodProduct } from '../../../models';
import { Router } from '@angular/router';

/**
 * Available Food Product table with sticky header, filtering and pagination
 */
@Component({
  selector: 'app-available-food-product',
  templateUrl: 'available-food-product.component.html',
})
export class AvailableFoodProductComponent implements OnInit {
  /** Define datasource to fill table */
  foodProducts: FoodProduct[] = null;

  constructor(private router: Router, private foodProductService: FoodProductService) {}

  ngOnInit(): void {
    // Get the data and assign it to the rows
    this.foodProductService.getAvailable().subscribe((availableFoodProducts) => {
      this.foodProducts = availableFoodProducts;
    }, _ => this.router.navigateByUrl('/error', { skipLocationChange: true }));
  }
}

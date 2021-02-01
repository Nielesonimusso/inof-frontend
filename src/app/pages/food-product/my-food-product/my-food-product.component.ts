import { Component, OnInit } from '@angular/core';
import { FoodProductService } from '../../../services';
import { FoodProduct } from '../../../models';
import { Router } from '@angular/router';

/**
 * My Food Product table with sticky header, filtering and pagination
 */
@Component({
  selector: 'app-my-food-products',
  templateUrl: './my-food-product.component.html',
})
export class MyFoodProductComponent implements OnInit {
  /** Datasource to fill table */
  foodProducts: FoodProduct[] = null;

  constructor(private router: Router, private foodProductService: FoodProductService) {}

  ngOnInit(): void {
    // Get the data and assign it to the rows
    this.foodProductService.getOwn().subscribe(
      (myFoodProducts) => this.foodProducts = myFoodProducts,
      _ => this.router.navigateByUrl('/error', { skipLocationChange: true })
    );
  }
}

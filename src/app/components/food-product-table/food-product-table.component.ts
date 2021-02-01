import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FoodProduct, UserProfile, HasCreator, isCreator } from '../../models';
import { AbstractTableComponent } from '../abstract-table';
import { FoodProductService, UserService } from 'src/app/services';
import { DeleteItemDialogComponent } from '../delete-item-dialog';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Food Product Table
 */
@Component({
  selector: 'app-food-product-table',
  styleUrls: ['food-product-table.component.scss'],
  templateUrl: 'food-product-table.component.html',
})
export class FoodProductTableComponent extends AbstractTableComponent<FoodProduct> implements OnInit {
  /** Names of the columns */
  displayedColumns: string[] = ['name', 'companyCode', 'standardCode', 'dosage', 'actions'];

  profile: Observable<UserProfile>;

  constructor(
    private userService: UserService,
    private foodProductService: FoodProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    // Get the user's profile
    this.userService.getUserProfile().subscribe((profile) => (this.profile = of(profile)));
    }

  dosageString(product: FoodProduct): string {
    return `${product.dosage} ${product.dosageUnit}`;
  }

  isCreator(object: HasCreator): Observable<boolean> {
    return this.profile?.pipe(map((profile) => isCreator(object, profile)));
  }

  /**
   * Overwrite specific filter function for foodproduct scenario
   */
  filterFunction = (data: FoodProduct, filter: string) => {
    return (
      data.name.toLowerCase().includes(filter.toLowerCase()) ||
      data.companyCode.toLowerCase().includes(filter.toLowerCase())
    );
  };

  /**
   * Delete a food product from the table
   */
  deleteFoodProduct(foodProduct: FoodProduct) {
    const dialogRef = this.dialog.open(DeleteItemDialogComponent, {
      data: foodProduct.name,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }
      this.foodProductService.delete(foodProduct.id).subscribe((response) => {
        if (response.status === 200) {
          const removed = this.rows.indexOf(foodProduct);
          this.rows.splice(removed, 1);
          this.setDataSource();
          this.snackBar.open('Food Product deleted successfully', '', { duration: 2000 });
        }
      });
    });
  }
}

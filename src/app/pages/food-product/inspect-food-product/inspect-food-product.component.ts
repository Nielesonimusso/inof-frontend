import { Component, OnInit } from '@angular/core';
import { Company, FoodProduct, isOwner, UserProfile, isCreator } from '../../../models';
import { FoodProductService, UserService } from 'src/app/services';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TabbedComponent } from 'src/app/components';

/**
 * Inspect Food Product Page
 */
@Component({
  selector: 'app-inspect-food-product',
  templateUrl: './inspect-food-product.component.html',
  styleUrls: ['./inspect-food-product.component.scss'],
})
export class InspectFoodProductComponent extends TabbedComponent implements OnInit {
  foodProduct: FoodProduct = null;
  selectedCompanies: Company[] = [];

  /** Packaging table columns */
  displayedColumnsPackaging: string[] = ['name', 'companyCode', 'standardCode', 'shape', 'thickness'];
  /** Ingredients table columns */
  displayedColumnsIngredients: string[] = ['name', 'companyCode', 'standardCode', 'amount'];
  /** Processing table columns */
  displayedColumnsProcessing: string[] = ['name', 'equipment', 'property', 'value'];
  /** Properties table columns */
  displayedColumnsProperties: string[] = ['name', 'value', 'method'];

  profile: Observable<UserProfile>;

  constructor(
    router: Router,
    private route: ActivatedRoute,
    private foodProductService: FoodProductService,
    private userService: UserService
  ) {
    super(router, route);
  }

  ngOnInit() {
    // Get the user's profile
    this.userService.getUserProfile().subscribe((profile) => (this.profile = of(profile)));

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        return;
      }
      this.foodProductService.getById(id).subscribe(
        (product) => {
          this.foodProduct = product;
          this.getFoodProductPermissions();
        },
        (_) => this.router.navigateByUrl('/error', { skipLocationChange: true })
      );
    });
  }

  getFoodProductPermissions() {
    // If the logged in user is from the same company, get the permissions
    this.profile?.pipe(map((profile) => isOwner(this.foodProduct, profile))).subscribe((canGetPermissions) => {
      if (canGetPermissions) {
        this.foodProductService.getPermissions(this.foodProduct.id).subscribe((permissions) => {
          this.selectedCompanies = permissions.map((x) => x.company);
        });
      }
    });
  }

  showPermissions(): Observable<boolean> {
    // Only show the permissions piece when you are from the same company
    return this.profile?.pipe(map((profile) => isOwner(this.foodProduct, profile)));
  }

  showEditButton(): Observable<boolean> {
    // Only show the permissions piece when you are from the same company
    return this.profile?.pipe(map((profile) => isCreator(this.foodProduct, profile)));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FoodProduct, FoodProductPermission, IngredientMinimal } from '../../models';

const API_ROOT = environment.API_ROOT;

/**
 * Service to interact with the backend for food products.
 */
@Injectable()
export class FoodProductService {
  constructor(private http: HttpClient) {}

  /**
   * Get available food products.
   */
  getAvailable(): Observable<FoodProduct[]> {
    return this.http.get<FoodProduct[]>(`${API_ROOT}/api/products`);
  }

  /**
   * Get food products of the current user's company.
   */
  getOwn(): Observable<FoodProduct[]> {
    return this.http.get<FoodProduct[]>(`${API_ROOT}/api/own_products`);
  }

  getById(id: string) {
    return this.http.get<FoodProduct>(`${API_ROOT}/api/product/${id}`);
  }

  add(foodProduct: FoodProduct): Observable<FoodProduct> {
    return this.http.post<FoodProduct>(`${API_ROOT}/api/product`, foodProduct);
  }

  update(foodProduct: FoodProduct): Observable<FoodProduct> {
    return this.http.put<FoodProduct>(`${API_ROOT}/api/product/${foodProduct.id}`, foodProduct);
  }

  delete(id: string) {
    return this.http.delete(`${API_ROOT}/api/product/${id}`, { observe: 'response' });
  }

  getIngredients(): Observable<IngredientMinimal[]> {
    return this.http.get<IngredientMinimal[]>(`${API_ROOT}/api/product/ingredients`);
  }

  getPermissions(id: string): Observable<FoodProductPermission[]> {
    return this.http.get<FoodProductPermission[]>(`${API_ROOT}/api/product/permissions/${id}`);
  }

  updatePermissions(id: string, companyIds: string[]): Observable<FoodProductPermission> {
    return this.http.put<FoodProductPermission>(`${API_ROOT}/api/product/permissions/${id}`, companyIds);
  }
}

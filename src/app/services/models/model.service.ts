import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Model, ModelPermission } from '../../models';

const API_ROOT = environment.API_ROOT;

/**
 * Service to interact with the backend for models.
 */
@Injectable({
  providedIn: 'root',
})
export class ModelService {
  constructor(private http: HttpClient) {}

  /**
   * Sends a REST API request to return the models owned by the current user
   */
  ownModels(): Observable<Model[]> {
    return this.http.get<Model[]>(`${API_ROOT}/api/own_models`);
  }

  /**
   * Sends a REST API request to return the available models
   */
  availableModels(): Observable<Model[]> {
    return this.http.get<Model[]>(`${API_ROOT}/api/models`);
  }

  /**
   * Sends a REST API request to delete a model with an id.
   * @param id The id of the model to delete
   */
  delete(id: string): Observable<HttpResponse<object>> {
    return this.http.delete(`${API_ROOT}/api/model/${id}`, { observe: 'response' });
  }

  /**
   * Sends a REST API request to update a model
   * @param model The new model object
   * @note model.id must be non-null!
   */
  update(model: Model): Observable<Model> {
    return this.http.put<Model>(`${API_ROOT}/api/model/${model.id}`, model);
  }

  /**
   * Sends a REST API request to create a new model
   * @param model the model to create
   */
  create(model: Model): Observable<Model> {
    return this.http.post<Model>(`${API_ROOT}/api/model`, model);
  }

  get(id: string): Observable<Model> {
    return this.http.get<Model>(`${API_ROOT}/api/model/${id}`);
  }

  getPermissions(modelId: string): Observable<ModelPermission[]> {
    return this.http.get<ModelPermission[]>(`${API_ROOT}/api/model/permissions/${modelId}`);
  }

  updatePermissions(modelId: string, companyPermissions: ModelPermission[]): Observable<ModelPermission[]> {
    return this.http.put<ModelPermission[]>(`${API_ROOT}/api/model/permissions/${modelId}`, companyPermissions);
  }
}

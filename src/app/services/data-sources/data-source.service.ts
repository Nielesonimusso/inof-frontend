import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataSource, DataSourcePermission } from '../../models'

const API_ROOT = environment.API_ROOT;

@Injectable({
    providedIn: 'root'
})
export class DataSourceService {
    constructor(private http: HttpClient) {}

    create(dataSource: DataSource): Observable<DataSource> {
        return this.http.post<DataSource>(`${API_ROOT}/api/data_source`, dataSource);
    }

    update(dataSource: DataSource): Observable<DataSource> {
        return this.http.put<DataSource>(`${API_ROOT}/api/data_source/${dataSource.id}`, dataSource);
    }

    delete(id: string): Observable<HttpResponse<object>> {
        return this.http.delete(`${API_ROOT}/api/data_source/${id}`, 
            {observe: 'response'});
    }

    availableDataSources(): Observable<DataSource[]> {
        return this.http.get<DataSource[]>(`${API_ROOT}/api/data_sources`);
    }

    ownDataSources(): Observable<DataSource[]> {
        return this.http.get<DataSource[]>(`${API_ROOT}/api/own_data_sources`);
    }

    get(id: string): Observable<DataSource> {
        return this.http.get<DataSource>(`${API_ROOT}/api/data_source/${id}`);
    }

    updatePermissions(dataSourceId: string, companyPermissions: DataSourcePermission[]): Observable<DataSourcePermission[]> {
        return this.http.put<DataSourcePermission[]>(`${API_ROOT}/api/data_source/permissions/${dataSourceId}`, companyPermissions);
    }

    getPermissions(dataSourceId: string): Observable<DataSourcePermission[]> {
        return this.http.get<DataSourcePermission[]>(`${API_ROOT}/api/data_source/permissions/${dataSourceId}`);
    }

    fetchData(dataSourceId: string): Observable<object[]> {
        return this.http.get<object[]>(`${API_ROOT}/api/data_source/data/${dataSourceId}`);
    }

    fetchOntology(dataSourceGateway: string): Observable<string> {
        return this.http.get(dataSourceGateway + "/ontology.ttl", { responseType: 'text'});
    }
}
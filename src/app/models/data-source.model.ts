import { ModelArgumentColumn } from './model.model';
import { HasOwner, Company, HasCreator } from './user.model';

export declare type DataSources = DataSource[];

export interface DataSource extends DataSourceMinimal, HasCreator {
    name: string;
    ontologyUri?: string;
    gatewayUrl: string;
    price: number;
    isConnected: boolean;
    readonly columns: ModelArgumentColumn[];
    readonly canAccess?: boolean;
    readonly useCount?: number;
}

export interface DataSourceMinimal extends HasOwner {
    readonly canAccess?: boolean;
    readonly id?: string;
    name: string;
    readonly owner?: Company;
    isConnected?: boolean;
    price?: number;
}


export enum DataSourcePermissionType {
    view = 'view',
    access = 'access'
}

export interface DataSourcePermission {
    readonly company?: Company;
    companyId: string;
    readonly dataSourceInfo?: DataSource;
    dataSourceInfoId: string;
    permissionType: DataSourcePermissionType;
}

export const EmptyDataSource = (): DataSource => {
    return {
        name: '',
        price: 0,
        ontologyUri: '',
        gatewayUrl: '',
        isConnected: false,
        columns: []
    };
};
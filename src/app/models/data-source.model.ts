import { FindValueSubscriber } from 'rxjs/internal/operators/find';
import { HasOwner, Company, HasCreator } from './user.model';

export declare type DataSources = DataSource[];

export interface DataSource extends HasCreator, HasOwner {
    name: string;
    gatewayUrl: string;
    price: number;
    isConnected: boolean;
    readonly canAccess?: boolean;
    readonly useCount?: number;

    readonly id?: string;
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
        gatewayUrl: '',
        isConnected: false
    };
};
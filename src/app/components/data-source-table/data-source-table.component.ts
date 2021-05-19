import { Component, OnInit } from "@angular/core";
import { Observable, of } from "rxjs";
import { DataSourceService, UserService } from "../../services";
import { DataSource, HasCreator, isCreator, UserProfile } from "../../models";
import { AbstractTableComponent } from "../abstract-table";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { map } from "rxjs/operators";
import { DeleteItemDialogComponent } from "../delete-item-dialog";

@Component({
    selector: 'app-data-source-table',
    styleUrls: ['data-source-table.component.scss'],
    templateUrl: 'data-source-table.component.html',
})
export class DataSourceTableComponent extends AbstractTableComponent<DataSource> implements OnInit {
    
    displayedColumns: string[] = [
        'isConnected',
        'name',
        'price',
        'usage',
        'owner',
        'creator',
        'actions'
    ]

    profile: Observable<UserProfile>;

    constructor(
        private userService: UserService,
        private dataSourceService: DataSourceService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        super();
    }

    ngOnInit() {
        super.ngOnInit();
        this.userService.getUserProfile().subscribe((profile) => (this.profile = of(profile)));
    }

    delete(dataSource: DataSource) {
        const dialogRef = this.dialog.open(DeleteItemDialogComponent, {
            data: dataSource.name
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (!result) {
                return;
            } else {
                this.dataSourceService.delete(dataSource.id).subscribe((response) => {
                    if (response.status === 200) {
                        const removed = this.rows.indexOf(dataSource);
                        this.rows.splice(removed, 1);
                        this.setDataSource();
                        this.snackBar.open('Data Source deleted successfully', '', {
                            duration: 2000
                        });
                    }
                });
            }
        });
    }

    isCreator(object: HasCreator): Observable<boolean> {
        return this.profile?.pipe(map((profile) => isCreator(object, profile)));
    }

    filterFunction = (data: DataSource, filter: string) => {
        return (
            data.name.toLowerCase().includes(filter.toLowerCase()) ||
            data.owner.name.toLowerCase().includes(filter.toLowerCase())
        );
    };
}
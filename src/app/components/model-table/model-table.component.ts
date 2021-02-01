import { Component, OnInit } from '@angular/core';
import { Model, UserProfile, HasCreator, isCreator } from '../../models';
import { AbstractTableComponent } from '../abstract-table';
import { ModelService, UserService } from '../../services';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DeleteItemDialogComponent } from '../delete-item-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Table component for an overview of Models
 */
@Component({
  selector: 'app-model-table',
  styleUrls: ['model-table.component.scss'],
  templateUrl: 'model-table.component.html',
})
export class ModelTableComponent extends AbstractTableComponent<Model> implements OnInit {
  // Define names of the columns
  displayedColumns: string[] = [
    'isConnected',
    'name',
    'description',
    'price',
    'usage',
    'owner',
    'creator',
    'actions',
  ];

  profile: Observable<UserProfile>;

  constructor(
    private userService: UserService,
    private modelService: ModelService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    this.userService.getUserProfile().subscribe((profile) => (this.profile = of(profile)));
  }

  delete(model: Model) {
    // Open DeleteItemDialog for confirmation
    const dialogRef = this.dialog.open(DeleteItemDialogComponent, {
      data: model.name,
    });

    // Subscribe for confirmation
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }
      // If confirmed, delete model
      this.modelService.delete(model.id).subscribe((response) => {
        if (response.status === 200) {
          const removed = this.rows.indexOf(model);
          this.rows.splice(removed, 1);
          this.setDataSource();
          this.snackBar.open('Model deleted successfully', '', { duration: 2000 });
        }
      });
    });
  }

  isCreator(object: HasCreator): Observable<boolean> {
    return this.profile?.pipe(map((profile) => isCreator(object, profile)));
  }

  // Overwrite specific filter function for foodproduct scenario
  filterFunction = (data: Model, filter: string) => {
    return (
      data.name.toLowerCase().includes(filter.toLowerCase()) || // match name
      data.owner.name.toLowerCase().includes(filter.toLowerCase()) // match owner, if set
    );
  };
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * Dialog to display as confirmation of the deletion of some item.
 */
@Component({
  selector: 'app-delete-item-dialog',
  templateUrl: 'delete-item-dialog.component.html',
})
export class DeleteItemDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string) {}
}

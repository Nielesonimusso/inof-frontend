import { Component } from '@angular/core';

/**
 * Actions that can be performed in the `CancelEditsDialogComponent`
 */
export enum CancelEditsDialogAction {
  CLOSE_DIALOG = 0,
  NO_SAVE,
}

/**
 * Dialog to display when cancelling from any edit page with changes.
 */
@Component({
  selector: 'app-cancel-edits-dialog',
  templateUrl: 'cancel-edits-dialog.component.html',
})
export class CancelEditsDialogComponent {
  Actions = CancelEditsDialogAction;
}

import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractTableComponent } from '../abstract-table';

/**
 * AbstractTableComponent which supports the clicking of table items.
 */
@Component({
  selector: 'app-abstract-select-table',
  template: '',
})
export class AbstractSelectTableComponent<T> extends AbstractTableComponent<T> {
  // Event emitter for an added (clicked) item.
  @Output()
  itemAdded = new EventEmitter<T>();

  /**
   * Emit item added event.
   */
  addItem(item: T) {
    this.itemAdded.emit(item);
  }
}

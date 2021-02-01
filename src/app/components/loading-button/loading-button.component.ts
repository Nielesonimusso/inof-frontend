import { Component, Input, ElementRef, ViewChild, AfterViewChecked, ViewEncapsulation } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { CanColor, ThemePalette, CanDisable } from '@angular/material/core';
import { ControlContainer, NgForm } from '@angular/forms';

/**
 * List of classes to add to MatButton instances based on host attributes to
 * style as different variants.
 */
const BUTTON_HOST_ATTRIBUTES = [
  'mat-button',
  'mat-flat-button',
  'mat-icon-button',
  'mat-raised-button',
  'mat-stroked-button',
  'mat-mini-fab',
  'mat-fab',
];

@Component({
  selector: 'app-loading-button',
  templateUrl: './loading-button.component.html',
  styleUrls: ['./loading-button.component.scss'],
})
export class LoadingButtonComponent implements CanColor, CanDisable, AfterViewChecked {
  constructor(public elementRef: ElementRef) {}
  @ViewChild('button') button: MatButton;

  loading = false;

  @Input()
  color: ThemePalette;

  @Input()
  disabled: boolean;

  onClick() {
    this.loading = true;
    // Propagate event
  }

  completeLoading() {
    this.loading = false;
  }

  ngAfterViewChecked(): void {
    // For each of the variant selectors that is present in the button's host
    // attributes, add the correct corresponding class.
    for (const attr of BUTTON_HOST_ATTRIBUTES) {
      if (this._hasHostAttributes(attr)) {
        const classList = (this.button._getHostElement() as HTMLElement).classList;
        // Remove default button class
        classList.remove('mat-button');
        // Set new button class
        classList.add(attr);
      }
    }
  }

  _getHostElement() {
    return this.elementRef.nativeElement;
  }

  /** Gets whether the button has one of the given attributes. */
  _hasHostAttributes(...attributes: string[]) {
    return attributes.some((attribute) => this._getHostElement().hasAttribute(attribute));
  }
}

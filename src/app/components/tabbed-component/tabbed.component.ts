import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Base component for pages consisting of a tabbed view
 */
@Component({
  selector: 'app-tabbed-component',
  template: '',
})
export abstract class TabbedComponent {
  // tslint:disable-next-line:variable-name
  private _tabIndex = -1;

  get tabIndex() {
    return this._tabIndex;
  }

  set tabIndex(value) {
    if (this._tabIndex !== value) {
      this.router.navigate([], { fragment: value.toString() });
      this._tabIndex = value;
    }
  }

  constructor(protected router: Router, route: ActivatedRoute) {
    route.fragment.subscribe((fragment) => {
      if (!fragment) {
        fragment = '0';
      }
      this.tabIndex = Number(fragment);
    });
  }
}

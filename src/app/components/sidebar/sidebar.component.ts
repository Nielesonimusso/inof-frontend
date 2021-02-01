import { Component, OnInit, Input } from '@angular/core';
import { AppRoute, SidePanelLocation } from '../../routes.types';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input('routes')
  set setRoutes(routes: AppRoute[]) {
    // First flatten routing structure and select only routes with a location.
    const locatedRoutes = this.filterRoutes(routes, (appRoute) => appRoute.data && appRoute.data.location, []);

    // Split routes based on location for display
    this.topRoutes = locatedRoutes.filter((appRoute) => appRoute.data.location === SidePanelLocation.top);
    this.bottomRoutes = locatedRoutes.filter((appRoute) => appRoute.data.location === SidePanelLocation.bottom);
  }

  topRoutes: AppRoute[] = [];
  bottomRoutes: AppRoute[] = [];

  ngOnInit(): void {}

  /**
   * Filters the hierarchical route structure into a flat array.
   */
  filterRoutes(routes: AppRoute[], predicate: (appRoute: AppRoute) => any, accumulator: AppRoute[]): AppRoute[] {
    for (const route of routes) {
      if (predicate(route)) {
        accumulator.push(route);
      }
      if (route.children) {
        this.filterRoutes(route.children, predicate, accumulator);
      }
    }
    return accumulator;
  }
}

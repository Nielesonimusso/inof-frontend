import { Route } from '@angular/router';

/**
 * Defines the location in the Side Panel
 */
export enum SidePanelLocation {
  top = 'top',
  bottom = 'bottom',
}

interface RouteData {
  /**
   * Name of the AppRoute. Should be human-readable, since it will show up in the sidebar.
   */
  name: string;
  /**
   * Location in the SidePanel. Can be top, bottom, and null.
   * If the property is null, it shall not appear in the sidepanel
   */
  location?: SidePanelLocation;
}

/**
 * Defines an AppRoute as an object with a human-readable name, and a Route.
 */
export interface AppRoute extends Route {
  data?: RouteData;
  children?: AppRoute[];
}

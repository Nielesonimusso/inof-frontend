import { Component } from '@angular/core';

// Import the routes to be used in the sidepanel
import { routes } from '../../routes';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

/**
 * Model for breadcrumbs
 */
interface BreadCrumb {
  label: string;
  url: string;
}

/**
 * Main page component (with sidebar) in which all other views reside.
 */
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  title = 'INoF';
  // Define the routes for usage in the sidepanel
  routes = routes;
  breadcrumbs: BreadCrumb[];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.subscribe((data) => {
      if (data instanceof NavigationEnd) {
        this.buildBreadcrumb(this.activatedRoute).then((bs) => {
          this.breadcrumbs = bs;
        });
      }
    });
  }

  async buildBreadcrumb(route: ActivatedRoute): Promise<BreadCrumb[]> {
    const breadcrumbs = [];
    let url = '';
    do {
      route = route.firstChild;

      // If the name is missing we ignore this part of the route and don't add a breadcrumb.
      if (!route.routeConfig || !route.routeConfig.data || !route.routeConfig.data.name) {
        continue;
      }

      // Update url by incrementally adding to the path
      url = `${url}/${route.routeConfig.path}`;

      // For the last part, pick the current url to include parameters and such
      if (!route.firstChild) {
        url = this.router.url;
      }
      const breadcrumb = {
        label: route.routeConfig.data.name,
        url,
      };
      breadcrumbs.push(breadcrumb);
    } while (route.firstChild);
    return breadcrumbs;
  }
}

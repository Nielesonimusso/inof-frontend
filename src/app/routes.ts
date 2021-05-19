/* Import Routing Types */
import { AppRoute, SidePanelLocation } from './routes.types';

/* Import Food Product Pages */
import {
  AvailableFoodProductComponent,
  MyFoodProductComponent,
  AddEditFoodProductComponent,
  InspectFoodProductComponent,
} from './pages/food-product';

/* Import Model Pages */
import {
  MyModelsComponent,
  AddEditModelComponent,
  InspectModelComponent,
  AvailableModelsComponent,
} from './pages/model';

/* Import Data Source Pages */
import {
  AvailableDataSourcesComponent,
  MyDataSourcesComponent,
  AddEditDataSourceComponent,
  InspectDataSourceComponent,
} from './pages/data-source';

/* Import Simulation Pages */
import { SimulationComponent, InspectSimulationComponent, AddEditSimulationComponent } from './pages/simulation';

/* Import Authentication Pages */
import { LogoutComponent } from './pages/authentication';

/* Import Profile Page */
import { ProfileComponent } from './pages/profile';

/**
 * Food product pages that are shared for both 'My' and 'Available'.
 */
const sharedFoodProductPages = [
  {
    path: 'inspect/:id',
    component: InspectFoodProductComponent,
    data: {
      name: 'Inspect Food Product',
    },
  },
  {
    path: 'add',
    component: AddEditFoodProductComponent,
    data: {
      name: 'Add Product',
    },
  },
  {
    path: 'edit/:id',
    component: AddEditFoodProductComponent,
    data: {
      name: 'Edit Product',
    },
  },
];

/**
 * Model pages that are shared for both 'My' and 'Available'
 */
const sharedModelPages = [
  {
    path: 'inspect/:id',
    component: InspectModelComponent,
    data: {
      name: 'Inspect Model',
    },
  },
  {
    path: 'edit/:id',
    component: AddEditModelComponent,
    data: {
      name: 'Edit Model',
    },
  },
  {
    path: 'add',
    component: AddEditModelComponent,
    data: {
      name: 'Add Model',
    },
  },
];

const sharedDataSourcePages = [
  {
    path: 'inspect/:id',
    component: InspectDataSourceComponent,
    data: {
      name: 'Inspect Data Source',
    },
  },
  {
    path: 'edit/:id',
    component: AddEditDataSourceComponent,
    data: {
      name: 'Edit Data Source',
    },
  },
  {
    path: 'add',
    component: AddEditDataSourceComponent,
    data: {
      name: 'Add Data Source',
    },
  },
]

/**
 * Define the array of AppRoutes.
 * Add a route to make it show up in the sidebar.
 * Children define url parts, so my-products with child path `add-edit` turns into `my-products/add-edit`
 * This only contains all routes which are to be shown with a sidebar next to it, all other routes are defined in `app.routing.ts`
 */
const routes: AppRoute[] = [
  // My Food Products Page + Add / Edit / Inspect
  {
    path: 'my-products',
    data: {
      name: 'My Food Products',
      location: SidePanelLocation.top,
    },
    children: [
      {
        path: '',
        component: MyFoodProductComponent,
      },
      ...sharedFoodProductPages
    ],
  },
  // Available Food Products Page + Add / Edit / Inspect
  {
    path: 'available-products',
    data: {
      name: 'Available Food Products',
      location: SidePanelLocation.top,
    },
    children: [
      {
        path: '',
        component: AvailableFoodProductComponent,
      },
      ...sharedFoodProductPages
    ],
  },
  // My Data Sources Page
  {
    path: 'my-data-sources',
    data: {
      name: 'My Data Sources',
      location: SidePanelLocation.top,
    },
    children: [
      {
        path: '',
        component: MyDataSourcesComponent,
      },
      ...sharedDataSourcePages
    ],
  },
  // Available Data Sources Page
  {
    path: 'available-data-sources',
    data: {
      name: 'Available Data Sources',
      location: SidePanelLocation.top,
    },
    children: [
      {
        path: '',
        component: AvailableDataSourcesComponent,
      },
      ...sharedDataSourcePages
    ],
  },
  // My Models Page + Add / Edit / Inspect
  {
    path: 'my-models',
    data: {
      name: 'My Models',
      location: SidePanelLocation.top,
    },
    children: [
      {
        path: '',
        component: MyModelsComponent,
      },
      ...sharedModelPages
    ],
  },
  // Available Models Page + Add / Edit / Inspect
  {
    path: 'available-models',
    data: {
      name: 'Available Models',
      location: SidePanelLocation.top,
    },
    children: [
      {
        path: '',
        component: AvailableModelsComponent,
      },
      ...sharedModelPages
    ],
  },
  // My Simulation Page + Add / Edit / Inspect
  {
    path: 'my-simulations',
    data: {
      name: 'My Simulations',
      location: SidePanelLocation.top,
    },
    children: [
      {
        path: '',
        component: SimulationComponent,
      },
      {
        path: 'inspect/:id',
        component: InspectSimulationComponent,
        data: {
          name: 'Inspect Simulation',
        },
      },
      {
        path: 'add',
        component: AddEditSimulationComponent,
        data: {
          name: 'Add Simulaton',
        },
      },
      {
        path: 'edit/:id',
        component: AddEditSimulationComponent,
        data: {
          name: 'Edit Simulaton',
        },
      },
    ],
  },
  // Profile Page
  {
    path: 'profile',
    component: ProfileComponent,
    data: {
      name: 'Profile',
      location: SidePanelLocation.bottom,
    },
  },
  // Logout Page
  {
    path: 'logout',
    component: LogoutComponent,
    data: {
      name: 'Logout',
      location: SidePanelLocation.bottom,
    },
  },
];

export { routes };

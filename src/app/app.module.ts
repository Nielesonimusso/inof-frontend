/* Import Angular Modules */
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';

/* Import Angular Material Components */
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTreeModule } from '@angular/material/tree';
import { MatTooltipModule } from '@angular/material/tooltip';

/* Import Loading Library */
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

/* Import Main Component */
import { MainComponent } from './components/main';

/* Import Routing */
import { appRoutingModule } from './app.routing';

/* Import Interceptors */
import { CasingInterceptor } from './utilities/casing.interceptor';
import { ErrorHandlingInterceptor } from './utilities/error-handling.interceptor';
import { AuthInterceptor } from './services/auth/authconfig.interceptor';

/* Import Services */
import { AuthService, SimulationService, FoodProductService, ModelService, DataSourceService } from './services';

/* Import Custom Components */
import {
  AppComponent,
  ModelTableComponent,
  FoodProductTableComponent,
  SidebarComponent,
  SimulationsTableComponent,
  SelectIngredientsTableComponent,
  ModelParameterTableComponent,
  SelectModelTableComponent,
  DeleteItemDialogComponent,
  AbstractSelectTableComponent,
  // SelectFoodProductTableComponent,
  LoadingButtonComponent,
  CancelEditsDialogComponent,
  SimulationResultsViewerComponent,
  SimulationResultsTableComponent,
  DataSourceTableComponent,
  DataSourceDataTableComponent,
  OntologyViewerComponent,
  SelectDataSourceTableComponent,
} from './components';

/* Import Custom Directives */
import { TrimDirective, MinDirective, MustMatchDirective, UrlDirective } from './directives';

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
import {
  SimulationComponent,
  InspectSimulationComponent,
  SimulationResultsComponent,
  AddEditSimulationComponent,
} from './pages/simulation';

/* Import Authentication Pages */
import {
  ResetPasswordComponent,
  ForgotPasswordComponent,
  RegisterComponent,
  LoginComponent,
} from './pages/authentication';

/* Import Profile Page */
import { ProfileComponent } from './pages/profile';

/* Import Error Page */
import { ErrorComponent } from './pages/error';

/* Import the custom pipes */
import { CustomDateTimePipe } from './utilities/custom-dateTime-pipe';
import { ModelStatusesPipe } from './utilities/model-statuses-pipe';

/**
 * Angular configuration metadata for the INoF application.
 * This defines what components need to be loaded for the application,
 * What modules / libraries we want to import and also
 * sets up a part of the dependency injection chain.
 */
@NgModule({
  // The set of components, directives, and pipes (declarables) that belong to this module.
  declarations: [
    AppComponent,
    AvailableFoodProductComponent,
    MyModelsComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AvailableFoodProductComponent,
    AddEditFoodProductComponent,
    ModelTableComponent,
    MyModelsComponent,
    DataSourceTableComponent,
    MyDataSourcesComponent,
    AvailableDataSourcesComponent,
    FoodProductTableComponent,
    MyFoodProductComponent,
    SimulationComponent,
    SimulationsTableComponent,
    SidebarComponent,
    AddEditModelComponent,
    InspectModelComponent,
    ModelParameterTableComponent,
    InspectFoodProductComponent,
    AvailableModelsComponent,
    SelectIngredientsTableComponent,
    InspectSimulationComponent,
    TrimDirective,
    MinDirective,
    MustMatchDirective,
    UrlDirective,
    MainComponent,
    DeleteItemDialogComponent,
    SimulationResultsComponent,
    AddEditSimulationComponent,
    SelectModelTableComponent,
    ProfileComponent,
    AbstractSelectTableComponent,
    // SelectFoodProductTableComponent,
    CustomDateTimePipe,
    ModelStatusesPipe,
    SimulationResultsViewerComponent,
    SimulationResultsTableComponent,
    LoadingButtonComponent,
    CancelEditsDialogComponent,
    ErrorComponent,
    AddEditDataSourceComponent,
    InspectDataSourceComponent,
    DataSourceDataTableComponent,
    OntologyViewerComponent,
    SelectDataSourceTableComponent,
  ],
  // The set of NgModules whose exported declarables are available to templates in this module.
  imports: [
    appRoutingModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatCardModule,
    MatGridListModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTreeModule,
    MatTooltipModule,
    NgxSkeletonLoaderModule,
    ReactiveFormsModule,
  ],
  // The set of injectable objects that are available in the injector of this module.
  providers: [
    // Only start showing input errors after the user has at least changed the form control.
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    AuthService,
    SimulationService,
    FoodProductService,
    ModelService,
    DataSourceService,
    // Interceptors to do things in http requests in a general way
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CasingInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlingInterceptor,
      multi: true,
    },
  ],
  // Entry component
  bootstrap: [AppComponent],
})
export class AppModule {}

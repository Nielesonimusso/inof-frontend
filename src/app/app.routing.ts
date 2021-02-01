import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { ErrorComponent } from './pages/error';
import { AuthGuard } from './services/auth/auth.guard';

// Import the sidebar routes from a central file
import { routes } from './routes';
import {
  LoginComponent,
  RegisterComponent,
  ForgotPasswordComponent,
  ResetPasswordComponent,
} from './pages/authentication';

// Define all the routes of the application
// Routes are split up in 2 main branches
// - Authentication -> Login/Register etc... This is the landing
// - Main Application -> All pages of the actual application (only accessible when user has a token)
const allRoutes: Routes = [
  // First specify all authentication paths
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'error', component: ErrorComponent },

  // Now we specify all main-application-routes
  // These are only accessible when the user has a token
  // that is why the MainComponent path has a guard
  {
    path: '',
    component: MainComponent,
    // Only allow users that have a access_token stored in their localStorage
    canActivate: [AuthGuard],
    children: [
      // Add all sidebar menu routes to the routes of the main-component
      // Fallback page for authenticated users, to "My Products"
      ...routes.concat({ path: '**', redirectTo: routes[0].path, data: { name: '' } }),
    ],
  },
];

// Export RouterModule
export const appRoutingModule = RouterModule.forRoot(allRoutes);

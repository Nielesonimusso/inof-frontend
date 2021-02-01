import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  // Disable Angular's developer mode.
  enableProdMode();
}

// Creates an instance of `AppModule` for the browser using the default runtime compiler.
// Any errors during the bootstrap procedure get logged.
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

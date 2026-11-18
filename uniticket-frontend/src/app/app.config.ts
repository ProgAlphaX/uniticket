import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import {
  ApplicationConfig,
  LOCALE_ID,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { paginadorEnEspanol } from './core/config/paginador';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { logInterceptor } from './core/interceptors/log.interceptor';

registerLocaleData(localeEs, 'es');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, ...(isDevMode() ? [logInterceptor] : [])]),
    ),
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: MatPaginatorIntl, useFactory: paginadorEnEspanol },
  ],
};

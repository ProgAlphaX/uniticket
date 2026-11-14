import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';

import { RequestLogService } from '../services/request-log.service';

/** Registra cada petición para la consola de red. Solo se activa en desarrollo (ver app.config.ts). */
export const logInterceptor: HttpInterceptorFn = (req, next) => {
  const log = inject(RequestLogService);
  const inicio = performance.now();

  return next(req).pipe(
    tap({
      next: evento => {
        if (evento instanceof HttpResponse) {
          log.agregar(req, evento.status, evento.body, performance.now() - inicio);
        }
      },
      error: (error: HttpErrorResponse) => log.agregar(req, error.status, error.error, performance.now() - inicio),
    }),
  );
};

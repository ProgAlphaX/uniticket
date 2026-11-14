import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.obtenerToken();

  const peticion = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token vencido o inválido: el backend responde 403 en rutas protegidas
      const esLogin = req.url.endsWith('/auth/login');
      if (!esLogin && token && (error.status === 401 || error.status === 403)) {
        authService.cerrarSesion();
      }
      return throwError(() => error);
    }),
  );
};

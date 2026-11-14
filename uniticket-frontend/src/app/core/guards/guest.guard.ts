import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Evita que un usuario con sesión vuelva a la pantalla de login. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.estaAutenticado() && auth.usuario() !== null
    ? inject(Router).createUrlTree(['/inicio'])
    : true;
};

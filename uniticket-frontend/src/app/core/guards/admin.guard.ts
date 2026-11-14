import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Solo deja pasar a administradores; el resto vuelve al inicio. */
export const adminGuard: CanActivateFn = () => {
  return inject(AuthService).esAdmin()
    ? true
    : inject(Router).createUrlTree(['/inicio']);
};

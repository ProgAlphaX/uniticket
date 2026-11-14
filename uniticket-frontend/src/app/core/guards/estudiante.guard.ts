import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Rutas propias del estudiante (por ejemplo, registrar una solicitud). */
export const estudianteGuard: CanActivateFn = () => {
  return inject(AuthService).esAdmin()
    ? inject(Router).createUrlTree(['/admin/solicitudes'])
    : true;
};

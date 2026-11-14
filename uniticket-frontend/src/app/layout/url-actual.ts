import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

/** Signal con la URL actual. Debe llamarse en un contexto de inyección. */
export function urlActual() {
  const router = inject(Router);
  return toSignal(
    router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      map(evento => evento.urlAfterRedirects),
    ),
    { initialValue: router.url },
  );
}

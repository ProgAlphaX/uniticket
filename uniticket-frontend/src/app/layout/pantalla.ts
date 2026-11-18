import { BreakpointObserver } from '@angular/cdk/layout';
import { Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

export const CONSULTA_MOVIL = '(max-width: 639.98px)';

export function esPantallaMovil(): Signal<boolean> {
  const observador = inject(BreakpointObserver);
  return toSignal(observador.observe(CONSULTA_MOVIL).pipe(map(estado => estado.matches)), {
    initialValue: observador.isMatched(CONSULTA_MOVIL),
  });
}

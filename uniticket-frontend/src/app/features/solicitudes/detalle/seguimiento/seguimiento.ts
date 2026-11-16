import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Seguimiento as EventoSeguimiento } from '../../../../core/models/seguimiento';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { StatusPill } from '../../../../shared/ui/status-pill/status-pill';
import { fechaHora } from '../fechas';

/**
 * Historial tipo conversación: registro, atención, observaciones, respuestas y decisión.
 * Al final proyecta (ng-content) el formulario de respuesta del estudiante.
 */
@Component({
  selector: 'ut-seguimiento',
  imports: [Avatar, StatusPill],
  templateUrl: './seguimiento.html',
  styleUrl: './seguimiento.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Seguimiento {
  readonly eventos = input.required<EventoSeguimiento[]>();
  readonly idUsuarioActual = input<number | null>(null);

  protected readonly fechaHora = fechaHora;

  protected quien(e: EventoSeguimiento): string {
    return e.nId_Usuario === this.idUsuarioActual() ? 'Tú' : e.sNombreUsuario || `Usuario ${e.nId_Usuario}`;
  }

  protected nombres(e: EventoSeguimiento): string {
    return (e.sNombreUsuario || '?').split(' ')[0];
  }

  protected apellidos(e: EventoSeguimiento): string {
    return (e.sNombreUsuario || '').split(' ').slice(1).join(' ');
  }
}

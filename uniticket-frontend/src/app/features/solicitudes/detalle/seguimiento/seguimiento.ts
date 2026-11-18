import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { EstadoTicket } from '../../../../core/config/catalogos';
import { Seguimiento as EventoSeguimiento } from '../../../../core/models/seguimiento';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { StatusPill } from '../../../../shared/ui/status-pill/status-pill';

@Component({
  selector: 'ut-seguimiento',
  imports: [DatePipe, Avatar, StatusPill],
  templateUrl: './seguimiento.html',
  styleUrl: './seguimiento.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Seguimiento {
  readonly eventos = input.required<EventoSeguimiento[]>();
  readonly idUsuarioActual = input<number | null>(null);

  protected quien(evento: EventoSeguimiento): string {
    return evento.nId_Usuario === this.idUsuarioActual()
      ? 'Tú'
      : evento.sNombreUsuario || `Usuario ${evento.nId_Usuario}`;
  }

  protected nombres(evento: EventoSeguimiento): string {
    return (evento.sNombreUsuario || '?').split(' ')[0];
  }

  protected apellidos(evento: EventoSeguimiento): string {
    return (evento.sNombreUsuario || '').split(' ').slice(1).join(' ');
  }

  protected estadoDe(evento: EventoSeguimiento): EstadoTicket {
    return evento.sAccion as EstadoTicket;
  }
}

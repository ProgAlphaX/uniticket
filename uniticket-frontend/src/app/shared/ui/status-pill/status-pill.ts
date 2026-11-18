import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ESTADOS, ESTADOS_USUARIO, EstadoTicket, EstadoUsuario } from '../../../core/config/catalogos';

@Component({
  selector: 'ut-status-pill',
  templateUrl: './status-pill.html',
  styleUrl: './status-pill.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"pill pill--" + estado()' },
})
export class StatusPill {
  readonly estado = input.required<EstadoTicket | EstadoUsuario>();

  protected readonly etiqueta = computed(() => {
    const estado = this.estado();
    return estado in ESTADOS ? ESTADOS[estado as EstadoTicket] : ESTADOS_USUARIO[estado as EstadoUsuario];
  });
}

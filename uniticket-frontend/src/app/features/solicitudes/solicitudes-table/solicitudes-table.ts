import { BreakpointObserver } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { ESTADO_COLOR, ESTADOS, EstadoTicket, TIPO_COLOR, TIPOS } from '../../../core/config/catalogos';
import { Ticket } from '../../../core/models/ticket';
import { Usuario } from '../../../core/models/usuario';
import { Avatar } from '../../../shared/ui/avatar/avatar';
import { StatusPill } from '../../../shared/ui/status-pill/status-pill';
import { ColumnFilter, OpcionFiltro } from '../column-filter/column-filter';

@Component({
  selector: 'ut-solicitudes-table',
  imports: [DatePipe, RouterLink, MatTableModule, MatButtonModule, MatIconModule, Avatar, StatusPill, ColumnFilter],
  templateUrl: './solicitudes-table.html',
  styleUrl: './solicitudes-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitudesTable {
  private readonly router = inject(Router);

  readonly tickets = input.required<Ticket[]>();
  readonly usuarios = input<Usuario[]>([]);
  readonly esAdmin = input(false);
  readonly estados = model.required<string[]>();

  protected readonly opcionesEstado: OpcionFiltro[] = (Object.keys(ESTADOS) as EstadoTicket[]).map(estado => ({
    valor: estado,
    etiqueta: ESTADOS[estado],
    color: ESTADO_COLOR[estado],
  }));

  private readonly esMovil = toSignal(
    inject(BreakpointObserver).observe('(max-width: 899.98px)').pipe(map(estado => estado.matches)),
    { initialValue: false },
  );

  protected readonly columnas = computed(() => {
    if (this.esMovil()) {
      return ['solicitud', 'estado'];
    }
    return this.esAdmin()
      ? ['estudiante', 'creacion', 'solicitud', 'actualizado', 'estado', 'accion']
      : ['numero', 'solicitud', 'creacion', 'actualizado', 'estado', 'accion'];
  });

  protected nombreTipo(ticket: Ticket): string {
    return TIPOS[ticket.sTipo];
  }

  protected colorTipo(ticket: Ticket): string {
    return TIPO_COLOR[ticket.sTipo];
  }

  protected usuarioDe(id: number): Usuario | undefined {
    return this.usuarios().find(u => u.nId_Usuario === id);
  }

  protected rutaDetalle(ticket: Ticket): (string | number)[] {
    return [this.esAdmin() ? '/admin/solicitudes' : '/solicitudes', ticket.nId_Ticket];
  }

  protected abrir(ticket: Ticket): void {
    this.router.navigate(this.rutaDetalle(ticket));
  }
}

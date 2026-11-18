import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { catchError, of, switchMap, tap } from 'rxjs';

import { TIPO_ICONO, TIPOS } from '../../../../core/config/catalogos';
import { TicketDetalle } from '../../../../core/models/ticket';
import { Usuario } from '../../../../core/models/usuario';
import { AuthService } from '../../../../core/services/auth.service';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { StatusPill } from '../../../../shared/ui/status-pill/status-pill';
import { UsuarioService } from '../../../usuarios/data/usuario.service';
import { TicketService } from '../../data/ticket.service';
import { AccionesPanel } from '../acciones-panel/acciones-panel';
import { diasEntre } from '../fechas';
import { ProgressStepper } from '../progress-stepper/progress-stepper';
import { RespuestaForm } from '../respuesta-form/respuesta-form';
import { Seguimiento } from '../seguimiento/seguimiento';

interface ErrorCarga {
  titulo: string;
  mensaje: string;
}

@Component({
  selector: 'ut-detalle-page',
  imports: [DatePipe, MatIconModule, StatusPill, Avatar, ProgressStepper, Seguimiento, AccionesPanel, RespuestaForm],
  templateUrl: './detalle-page.html',
  styleUrl: './detalle-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetallePage {
  private readonly tickets = inject(TicketService);
  private readonly usuarios = inject(UsuarioService);
  private readonly auth = inject(AuthService);

  readonly id = input.required<string>();

  protected readonly ticket = signal<TicketDetalle | null>(null);
  protected readonly estudiante = signal<Usuario | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<ErrorCarga | null>(null);

  protected readonly esAdmin = this.auth.esAdmin;
  protected readonly idUsuario = computed(() => this.auth.usuario()?.nId_Usuario ?? null);

  protected readonly observaciones = computed(
    () => this.ticket()?.seguimiento.filter(s => s.sAccion === 'OBSERVADO').length ?? 0,
  );

  protected readonly nombreEstudiante = computed(() => {
    const usuario = this.estudiante();
    if (usuario) {
      return `${usuario.sNombres} ${usuario.sApellidos}`;
    }
    return this.ticket()?.seguimiento.find(s => s.sAccion === 'REGISTRO')?.sNombreUsuario ?? 'el estudiante';
  });

  protected readonly cerrada = computed(() => {
    const estado = this.ticket()?.sEstado;
    return estado === 'PROCEDE' || estado === 'NO_PROCEDE';
  });

  protected readonly dias = computed(() => {
    const ticket = this.ticket();
    if (!ticket) {
      return 0;
    }
    return diasEntre(ticket.dFecha_Creacion, this.cerrada() ? ticket.dFecha_Actualizacion : new Date());
  });

  constructor() {
    toObservable(this.id)
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.error.set(null);
        }),
        switchMap(id =>
          this.tickets.obtener(Number(id)).pipe(
            catchError((error: HttpErrorResponse) => {
              this.error.set(this.errorDe(error));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(ticket => {
        this.cargando.set(false);
        if (ticket && !this.esAdmin() && ticket.nId_Usuario !== this.idUsuario()) {
          this.error.set({ titulo: 'Solicitud no encontrada', mensaje: 'No existe o no pertenece a tu cuenta.' });
          return;
        }
        this.ticket.set(ticket);
        if (ticket && this.esAdmin()) {
          this.cargarEstudiante(ticket.nId_Usuario);
        }
      });
  }

  protected nombreTipo(ticket: TicketDetalle): string {
    return TIPOS[ticket.sTipo];
  }

  protected iconoTipo(ticket: TicketDetalle): string {
    return TIPO_ICONO[ticket.sTipo];
  }

  protected actualizar(detalle: TicketDetalle): void {
    this.ticket.set(detalle);
  }

  private cargarEstudiante(idUsuario: number): void {
    if (this.estudiante()?.nId_Usuario === idUsuario) {
      return;
    }
    this.usuarios.getUsuarios().subscribe({
      next: lista => this.estudiante.set(lista.find(u => u.nId_Usuario === idUsuario) ?? null),
      error: () => this.estudiante.set(null),
    });
  }

  private errorDe(error: HttpErrorResponse): ErrorCarga {
    if (error.status === 0) {
      return { titulo: 'Sin conexión', mensaje: 'No se pudo conectar con el servidor.' };
    }
    if (error.status === 404) {
      return { titulo: 'Solicitud no encontrada', mensaje: 'No existe o no pertenece a tu cuenta.' };
    }
    return { titulo: 'No se pudo cargar la solicitud', mensaje: error.error?.message ?? 'Inténtalo de nuevo.' };
  }
}

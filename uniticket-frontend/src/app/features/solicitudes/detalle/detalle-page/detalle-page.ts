import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { catchError, of, switchMap, tap } from 'rxjs';

import { API_URL } from '../../../../core/config/api';
import { ESTADOS, TIPOS } from '../../../../core/config/catalogos';
import { TicketDetalle } from '../../../../core/models/ticket';
import { Usuario } from '../../../../core/models/usuario';
import { AuthService } from '../../../../core/services/auth.service';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { StatusPill } from '../../../../shared/ui/status-pill/status-pill';
import { TicketService } from '../../data/ticket.service';
import { AccionesPanel } from '../acciones-panel/acciones-panel';
import { diasEntre, fechaDia, fechaHora } from '../fechas';
import { ProgressStepper } from '../progress-stepper/progress-stepper';
import { RespuestaForm } from '../respuesta-form/respuesta-form';
import { Seguimiento } from '../seguimiento/seguimiento';

const ICONO_TIPO: Record<string, string> = {
  CERTIFICADO: 'workspace_premium',
  CITA_TUTOR: 'calendar_month',
  PENSION: 'account_balance_wallet',
  DOCUMENTOS: 'folder',
};

/** Rutas /solicitudes/:id y /admin/solicitudes/:id. Arma la columna principal y la lateral. */
@Component({
  selector: 'ut-detalle-page',
  imports: [MatIconModule, StatusPill, Avatar, ProgressStepper, Seguimiento, AccionesPanel, RespuestaForm],
  templateUrl: './detalle-page.html',
  styleUrl: './detalle-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetallePage {
  private tickets = inject(TicketService);
  private http = inject(HttpClient);
  protected readonly auth = inject(AuthService);

  /** Id de la ruta (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly ticket = signal<TicketDetalle | null>(null);
  protected readonly estudiante = signal<Usuario | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<{ status: number; message: string } | null>(null);

  protected readonly TIPOS = TIPOS;
  protected readonly ESTADOS = ESTADOS;
  protected readonly ICONO_TIPO = ICONO_TIPO;
  protected readonly fechaDia = fechaDia;
  protected readonly fechaHora = fechaHora;

  protected readonly esAdmin = this.auth.esAdmin;
  protected readonly idUsuario = computed(() => this.auth.usuario()?.nId_Usuario ?? null);

  protected readonly observaciones = computed(
    () => this.ticket()?.seguimiento.filter(s => s.sAccion === 'OBSERVADO').length ?? 0,
  );

  /** Nombre del estudiante: de su ficha si la tenemos, si no del evento REGISTRO. */
  protected readonly nombreEstudiante = computed(() => {
    const u = this.estudiante();
    if (u) return u.sNombreCompleto || `${u.sNombres} ${u.sApellidos}`;
    return this.ticket()?.seguimiento.find(s => s.sAccion === 'REGISTRO')?.sNombreUsuario ?? 'el estudiante';
  });

  protected readonly cerrada = computed(() => {
    const e = this.ticket()?.sEstado;
    return e === 'PROCEDE' || e === 'NO_PROCEDE';
  });

  protected readonly dias = computed(() => {
    const t = this.ticket();
    if (!t) return 0;
    return this.cerrada() ? diasEntre(t.dFecha_Creacion, t.dFecha_Actualizacion) : diasEntre(t.dFecha_Creacion);
  });

  constructor() {
    toObservable(this.id)
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.error.set(null);
        }),
        switchMap(id =>
          this.tickets.obtener(+id).pipe(
            catchError((e: HttpErrorResponse) => {
              this.error.set({ status: e.status, message: e.error?.message ?? 'No se pudo cargar la solicitud' });
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(t => {
        this.ticket.set(t);
        this.cargando.set(false);
        if (t && this.esAdmin()) this.cargarEstudiante(t.nId_Usuario);
      });
  }

  /** Lo que devuelve el backend tras atender, decidir o responder. */
  protected actualizar(detalle: TicketDetalle): void {
    this.ticket.set(detalle);
  }

  /**
   * Ficha del estudiante (solo admin). GET /usuarios ya existe (op. 02).
   * Cuando Luis suba UsuarioService, se puede cambiar por usuarioService.getUsuarios().
   */
  private cargarEstudiante(idUsuario: number): void {
    if (this.estudiante()?.nId_Usuario === idUsuario) return;
    this.http.get<Usuario[]>(`${API_URL}/usuarios`).subscribe({
      next: lista => this.estudiante.set(lista.find(u => u.nId_Usuario === idUsuario) ?? null),
      error: () => this.estudiante.set(null),
    });
  }
}

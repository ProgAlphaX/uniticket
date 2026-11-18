import { BreakpointObserver } from '@angular/cdk/layout';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, map } from 'rxjs';

import { ESTADOS_USUARIO, EstadoUsuario, ROLES } from '../../../core/config/catalogos';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../../../core/models/usuario';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Avatar } from '../../../shared/ui/avatar/avatar';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { StatusPill } from '../../../shared/ui/status-pill/status-pill';
import { UsuarioService } from '../data/usuario.service';
import { UsuarioDialog } from '../usuario-dialog/usuario-dialog';

@Component({
  selector: 'ut-usuarios-page',
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    Avatar,
    EmptyState,
    StatusPill,
  ],
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosPage implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  protected readonly estadosUsuario = Object.entries(ESTADOS_USUARIO) as [EstadoUsuario, string][];

  readonly usuarios = signal<Usuario[]>([]);
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  readonly filtroForm = inject(FormBuilder).nonNullable.group({
    nombre: '',
    estado: '' as EstadoUsuario | '',
  });

  protected readonly esMovil = toSignal(
    inject(BreakpointObserver).observe('(max-width: 899.98px)').pipe(map(estado => estado.matches)),
    { initialValue: false },
  );

  protected readonly columnas = computed(() =>
    this.esMovil() ? ['usuario', 'acciones'] : ['usuario', 'celular', 'rol', 'estado', 'acciones'],
  );

  protected readonly activos = computed(() => this.usuarios().filter(u => u.sEstado === 'ACTIVO').length);
  protected readonly inactivos = computed(() => this.usuarios().length - this.activos());

  ngOnInit(): void {
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const { nombre, estado } = this.filtroForm.getRawValue();
    const consulta = nombre.trim();

    const peticion = consulta
      ? this.usuarioService
          .buscar(consulta)
          .pipe(map(usuarios => (estado ? usuarios.filter(u => u.sEstado === estado) : usuarios)))
      : this.usuarioService.getUsuarios(estado || undefined);

    this.cargando.set(true);
    this.error.set(null);
    peticion.subscribe({
      next: usuarios => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.mensajeError(error));
        this.cargando.set(false);
      },
    });
  }

  protected nombreRol(usuario: Usuario): string {
    return ROLES[usuario.sRol];
  }

  protected esPropio(usuario: Usuario): boolean {
    return usuario.nId_Usuario === this.auth.usuario()?.nId_Usuario;
  }

  protected abrirCrear(): void {
    this.dialog
      .open<UsuarioDialog, null, UsuarioCreate>(UsuarioDialog, { width: '560px', maxWidth: 'calc(100vw - 32px)' })
      .afterClosed()
      .subscribe(datos => {
        if (datos) {
          this.guardar(this.usuarioService.crearUsuario(datos), 'El usuario se creó correctamente.');
        }
      });
  }

  protected abrirEditar(usuario: Usuario): void {
    this.dialog
      .open<UsuarioDialog, Usuario, UsuarioUpdate>(UsuarioDialog, {
        width: '560px',
        maxWidth: 'calc(100vw - 32px)',
        data: usuario,
      })
      .afterClosed()
      .subscribe(datos => {
        if (datos) {
          this.guardar(this.usuarioService.actualizar(usuario.nId_Usuario, datos), 'Los datos del usuario se actualizaron.');
        }
      });
  }

  protected cambiarEstado(usuario: Usuario): void {
    const desactivar = usuario.sEstado === 'ACTIVO';
    const nombre = `${usuario.sNombres} ${usuario.sApellidos}`;
    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
        data: {
          titulo: desactivar ? '¿Desactivar usuario?' : '¿Activar usuario?',
          mensaje: desactivar
            ? `${nombre} no podrá iniciar sesión hasta que vuelvas a activarlo. Sus solicitudes se conservan.`
            : `${nombre} podrá volver a iniciar sesión en UniTicket.`,
          confirmar: desactivar ? 'Desactivar' : 'Activar',
          icono: desactivar ? 'person_off' : 'person_check',
          peligro: desactivar,
        },
      })
      .afterClosed()
      .subscribe(confirmado => {
        if (confirmado) {
          this.guardar(
            this.usuarioService.cambiarEstado(usuario.nId_Usuario, desactivar ? 'INACTIVO' : 'ACTIVO'),
            desactivar ? 'El usuario se desactivó.' : 'El usuario se activó.',
          );
        }
      });
  }

  private guardar(peticion: Observable<Usuario>, mensaje: string): void {
    this.guardando.set(true);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.ok(mensaje);
        this.aplicarFiltros();
      },
      error: (error: unknown) => {
        this.guardando.set(false);
        this.toast.error(this.mensajeError(error));
      },
    });
  }

  private mensajeError(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }
    if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
      return error.error.message;
    }
    return 'Ocurrió un error inesperado.';
  }
}

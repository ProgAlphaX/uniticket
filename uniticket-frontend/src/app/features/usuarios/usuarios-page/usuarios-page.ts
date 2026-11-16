import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { map, Observable } from 'rxjs';

import { EstadoUsuario } from '../../../core/config/catalogos';
import { Usuario } from '../../../core/models/usuario';
import { ToastService } from '../../../core/services/toast.service';
import { Avatar } from '../../../shared/ui/avatar/avatar';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { StatusPill } from '../../../shared/ui/status-pill/status-pill';
import { UsuarioService } from '../data/usuario.service';
import { UsuarioDialogComponent } from '../usuario-dialog/usuario-dialog';

@Component({
  selector: 'ut-usuarios-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    Avatar,
    EmptyState,
    StatusPill,
  ],
  templateUrl: './usuarios-page.html',
  styleUrls: ['./usuarios-page.scss'],
})
export class UsuariosPage implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly errorCarga = signal<string | null>(null);
  readonly displayedColumns = ['usuario', 'celular', 'rol', 'estado', 'acciones'];

  readonly filtroForm: FormGroup = this.fb.group({
    nombre: [''],
    estado: [''],
  });

  ngOnInit(): void {
    this.aplicarFiltros();
  }

  cargarUsuarios(estado?: EstadoUsuario): void {
    this.consultarUsuarios(this.usuarioService.getUsuarios(estado));
  }

  getIniciales(nombres: string, apellidos: string): string {
    return `${nombres?.trim().charAt(0) ?? ''}${apellidos?.trim().charAt(0) ?? ''}`.toUpperCase();
  }

  contarActivos(): number {
    return this.usuarios().filter((usuario) => usuario.sEstado === 'ACTIVO').length;
  }

  contarInactivos(): number {
    return this.usuarios().filter((usuario) => usuario.sEstado === 'INACTIVO').length;
  }

  abrirCrear(): void {
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '560px',
      maxWidth: 'calc(100vw - 32px)',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.procesarCambio(
          this.usuarioService.crearUsuario(result),
          'El usuario se creó correctamente.',
        );
      }
    });
  }

  abrirEditar(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '560px',
      maxWidth: 'calc(100vw - 32px)',
      data: usuario,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.procesarCambio(
          this.usuarioService.actualizar(usuario.nId_Usuario, result),
          'Los datos del usuario se actualizaron.',
        );
      }
    });
  }

  cambiarEstado(usuario: Usuario): void {
    const desactivar = usuario.sEstado === 'ACTIVO';
    const nuevoEstado: EstadoUsuario = desactivar ? 'INACTIVO' : 'ACTIVO';
    const nombre = `${usuario.sNombres} ${usuario.sApellidos}`.trim();
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: desactivar ? '¿Desactivar usuario?' : '¿Activar usuario?',
        mensaje: desactivar
          ? `${nombre} no podrá iniciar sesión hasta que vuelvas a activarlo. Sus solicitudes se conservarán.`
          : `${nombre} podrá volver a iniciar sesión en UniTicket.`,
        confirmar: desactivar ? 'Desactivar' : 'Activar',
        icono: desactivar ? 'person_off' : 'person',
        peligro: desactivar,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.procesarCambio(
          this.usuarioService.cambiarEstado(usuario.nId_Usuario, nuevoEstado),
          desactivar ? 'El usuario se desactivó.' : 'El usuario se activó.',
        );
      }
    });
  }

  aplicarFiltros(): void {
    const { nombre, estado } = this.filtroForm.getRawValue() as {
      nombre: string;
      estado: EstadoUsuario | '';
    };
    const consulta = String(nombre ?? '').trim();

    if (consulta) {
      this.consultarUsuarios(
        this.usuarioService.buscar(consulta).pipe(
          map((usuarios) =>
            estado ? usuarios.filter((usuario) => usuario.sEstado === estado) : usuarios,
          ),
        ),
      );
    } else {
      this.cargarUsuarios(estado || undefined);
    }
  }

  private consultarUsuarios(request: Observable<Usuario[]>): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    request.subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.errorCarga.set(this.obtenerMensajeError(error));
        this.cargando.set(false);
      },
    });
  }

  private procesarCambio(request: ReturnType<UsuarioService['crearUsuario']>, mensaje: string): void {
    this.guardando.set(true);

    request.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.ok(mensaje);
        this.aplicarFiltros();
      },
      error: (error: unknown) => {
        this.guardando.set(false);
        this.toast.error(this.obtenerMensajeError(error));
      },
    });
  }

  private obtenerMensajeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || error.message || 'Ocurrió un error al comunicarse con el servidor.';
    }

    return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
  }
}

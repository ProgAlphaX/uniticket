import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ROLES, RolUsuario } from '../../../core/config/catalogos';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../../../core/models/usuario';

@Component({
  selector: 'ut-usuario-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './usuario-dialog.html',
  styleUrl: './usuario-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioDialog {
  private readonly ref = inject<MatDialogRef<UsuarioDialog, UsuarioCreate | UsuarioUpdate>>(MatDialogRef);
  private readonly usuario = inject<Usuario | null>(MAT_DIALOG_DATA, { optional: true });

  protected readonly esEdicion = !!this.usuario;
  protected readonly roles = Object.entries(ROLES) as [RolUsuario, string][];

  readonly form = inject(FormBuilder).nonNullable.group({
    sNombres: [this.usuario?.sNombres ?? '', [Validators.required, Validators.maxLength(80)]],
    sApellidos: [this.usuario?.sApellidos ?? '', [Validators.required, Validators.maxLength(80)]],
    sEmail: [this.usuario?.sEmail ?? '', [Validators.required, Validators.email, Validators.maxLength(100)]],
    sDni: ['', this.esEdicion ? [] : [Validators.required, Validators.pattern(/^\d{8}$/)]],
    sTelefono: [this.usuario?.sTelefono ?? '', [Validators.pattern(/^9\d{8}$/)]],
    sRol: ['' as RolUsuario | '', this.esEdicion ? [] : [Validators.required]],
    sPassword: ['', this.esEdicion ? [] : [Validators.required, Validators.minLength(6)]],
  });

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const datos: UsuarioUpdate = {
      sNombres: valor.sNombres.trim(),
      sApellidos: valor.sApellidos.trim(),
      sEmail: valor.sEmail.trim(),
      sTelefono: valor.sTelefono.trim(),
    };

    if (this.esEdicion) {
      this.ref.close(datos);
      return;
    }

    this.ref.close({
      ...datos,
      sDni: valor.sDni.trim(),
      sRol: valor.sRol as RolUsuario,
      sPassword: valor.sPassword,
    });
  }
}

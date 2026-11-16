import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

import { Usuario } from '../../../core/models/usuario';

@Component({
  selector: 'ut-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './usuario-dialog.html',
  styleUrls: ['./usuario-dialog.scss'],
})
export class UsuarioDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<UsuarioDialogComponent>);
  readonly data = inject<Usuario | null>(MAT_DIALOG_DATA, { optional: true });

  readonly isEditMode = !!this.data;

  readonly form: FormGroup = this.fb.group({
    sNombres: [
      this.data?.sNombres ?? '',
      [Validators.required, Validators.maxLength(80)],
    ],
    sApellidos: [
      this.data?.sApellidos ?? '',
      [Validators.required, Validators.maxLength(80)],
    ],
    sEmail: [
      this.data?.sEmail ?? '',
      [Validators.required, Validators.email, Validators.maxLength(100)],
    ],
    sDni: [
      this.data?.sDni ?? '',
      this.isEditMode ? [] : [Validators.required, Validators.pattern(/^\d{8}$/)],
    ],
    sTelefono: [
      this.data?.sTelefono ?? '',
      [Validators.pattern(/^9\d{8}$/)],
    ],
    sRol: [
      this.data?.sRol ?? '',
      this.isEditMode ? [] : [Validators.required],
    ],
    sPassword: [
      '',
      this.isEditMode ? [] : [Validators.required, Validators.minLength(6)],
    ],
  });

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const contacto = {
      sNombres: value.sNombres.trim(),
      sApellidos: value.sApellidos.trim(),
      sEmail: value.sEmail.trim(),
      sTelefono: value.sTelefono.trim(),
    };

    if (this.isEditMode) {
      this.dialogRef.close(contacto);
      return;
    }

    this.dialogRef.close({
      ...contacto,
      sDni: value.sDni.trim(),
      sRol: value.sRol,
      sPassword: value.sPassword,
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}

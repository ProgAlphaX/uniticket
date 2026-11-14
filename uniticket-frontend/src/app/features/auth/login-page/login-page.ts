import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { ApiError } from '../../../core/models/api-error';
import { AuthService } from '../../../core/services/auth.service';

/** FRM-01 · Iniciar sesión */
@Component({
  selector: 'ut-login-page',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    sEmail: ['', [Validators.required, Validators.email]],
    sPassword: ['', [Validators.required]],
  });

  protected readonly enviando = signal(false);
  protected readonly verPassword = signal(false);
  protected readonly errorApi = signal<string | null>(null);

  protected ingresar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.errorApi.set(null);
    const { sEmail, sPassword } = this.form.getRawValue();

    this.auth.iniciarSesion({ sEmail: sEmail.trim(), sPassword }).subscribe({
      next: usuario => {
        console.log('Datos recibidos del servicio:', usuario);
        this.router.navigate(['/inicio']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al llamar al servicio:', err);
        this.auth.cerrarSesion();
        this.errorApi.set(this.mensajeDeError(err));
        this.enviando.set(false);
      },
    });
  }

  private mensajeDeError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté levantado.';
    }
    try {
      const cuerpo = typeof err.error === 'string' ? (JSON.parse(err.error) as ApiError) : (err.error as ApiError);
      return cuerpo?.message ?? 'No pudimos iniciar sesión';
    } catch {
      return 'No pudimos iniciar sesión';
    }
  }
}

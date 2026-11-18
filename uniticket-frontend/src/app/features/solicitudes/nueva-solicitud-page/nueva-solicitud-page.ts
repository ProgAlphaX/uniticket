import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';

import { TipoTicket } from '../../../core/config/catalogos';
import { ApiError } from '../../../core/models/api-error';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CategoryPicker } from '../category-picker/category-picker';
import { TicketService } from '../data/ticket.service';

@Component({
  selector: 'ut-nueva-solicitud-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    CategoryPicker,
  ],
  templateUrl: './nueva-solicitud-page.html',
  styleUrl: './nueva-solicitud-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevaSolicitudPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly ticketService = inject(TicketService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    sTipo: this.fb.control<TipoTicket | ''>('', Validators.required),
    sAsunto: ['', [Validators.required, Validators.maxLength(150)]],
    sDescripcion: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
  });

  protected readonly enviando = signal(false);
  protected readonly errorApi = signal<string | null>(null);

  protected enviar(): void {
    const usuario = this.auth.usuario();
    if (this.form.invalid || !usuario) {
      this.form.markAllAsTouched();
      return;
    }
    const { sTipo, sAsunto, sDescripcion } = this.form.getRawValue();
    this.enviando.set(true);
    this.errorApi.set(null);

    this.ticketService
      .crear({
        sTipo: sTipo as TipoTicket,
        sAsunto: sAsunto.trim(),
        sDescripcion: sDescripcion.trim(),
      })
      .subscribe({
        next: ticket => {
          console.log('Datos recibidos del servicio:', ticket);
          this.toast.ok(`Solicitud ${ticket.sNum_Ticket} enviada. Te avisaremos cuando cambie su estado.`);
          this.router.navigate(['/solicitudes', ticket.nId_Ticket]);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error al llamar al servicio:', err);
          this.errorApi.set((err.error as ApiError)?.message ?? 'No se pudo enviar la solicitud');
          this.enviando.set(false);
        },
      });
  }
}

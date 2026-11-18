import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { MAX_OBSERVACIONES } from '../../../../core/config/catalogos';
import { TicketDetalle } from '../../../../core/models/ticket';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TicketService } from '../../data/ticket.service';

@Component({
  selector: 'ut-respuesta-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './respuesta-form.html',
  styleUrl: './respuesta-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RespuestaForm {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private tickets = inject(TicketService);
  private toast = inject(ToastService);

  readonly ticket = input.required<TicketDetalle>();
  readonly observaciones = input(0);
  readonly enviado = output<TicketDetalle>();

  protected readonly MAX = MAX_OBSERVACIONES;
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    sComentario: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
  });

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const usuario = this.auth.usuario();
    if (!usuario) return;

    this.enviando.set(true);
    this.error.set(null);
    this.tickets
      .responder(this.ticket().nId_Ticket, {
        sComentario: this.form.getRawValue().sComentario.trim(),
      })
      .subscribe({
        next: detalle => {
          this.enviando.set(false);
          this.form.reset();
          this.toast.ok('Respuesta enviada. Tu solicitud volvió a En proceso.');
          this.enviado.emit(detalle);
        },
        error: (e: HttpErrorResponse) => {
          this.enviando.set(false);
          this.error.set(e.error?.message ?? 'No se pudo enviar la respuesta');
        },
      });
  }
}

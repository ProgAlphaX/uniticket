import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { TicketDetalle } from '../../../../core/models/ticket';
import { AuthService } from '../../../../core/services/auth.service';
import { TicketService } from '../../data/ticket.service';

export type AccionDecision = 'OBSERVADO' | 'PROCEDE' | 'NO_PROCEDE';

export interface DecisionDialogData {
  ticket: TicketDetalle;
  accion: AccionDecision;
}

const CONFIG: Record<AccionDecision, { icono: string; tono: string; titulo: string; ayuda: string; etiqueta: string; boton: string }> = {
  OBSERVADO: { icono: 'flag', tono: 'obs', titulo: 'Observar solicitud', ayuda: 'El estudiante verá tu comentario y podrá responder.', etiqueta: 'Comentario de observación', boton: 'Enviar observación' },
  PROCEDE: { icono: 'check_circle', tono: 'ok', titulo: 'Marcar como procede', ayuda: 'La solicitud se cierra como aprobada.', etiqueta: 'Indicaciones para el estudiante', boton: 'Confirmar: procede' },
  NO_PROCEDE: { icono: 'cancel', tono: 'no', titulo: 'Marcar como no procede', ayuda: 'La solicitud se cierra. Explica el motivo con claridad.', etiqueta: 'Motivo', boton: 'Confirmar: no procede' },
};

/**
 * FRM-04 · Decisión del administrador con comentario obligatorio (op. 10).
 * Uso: dialog.open(DecisionDialog, { data }).afterClosed() → TicketDetalle | undefined
 */
@Component({
  selector: 'ut-decision-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './decision-dialog.html',
  styleUrl: './decision-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DecisionDialog {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private tickets = inject(TicketService);
  private ref = inject(MatDialogRef<DecisionDialog, TicketDetalle>);
  protected readonly data = inject<DecisionDialogData>(MAT_DIALOG_DATA);

  protected readonly cfg = CONFIG[this.data.accion];
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    sComentario: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
  });

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const admin = this.auth.usuario();
    if (!admin) return;

    this.guardando.set(true);
    this.error.set(null);
    this.tickets
      .cambiarEstado(this.data.ticket.nId_Ticket, {
        nId_Admin: admin.nId_Usuario,
        sEstado: this.data.accion,
        sComentario: this.form.getRawValue().sComentario.trim(),
      })
      .subscribe({
        next: detalle => this.ref.close(detalle),
        error: (e: HttpErrorResponse) => {
          this.guardando.set(false);
          this.error.set(e.error?.message ?? 'No se pudo guardar');
        },
      });
  }
}

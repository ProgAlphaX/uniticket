import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { filter, switchMap } from 'rxjs';

import { ESTADOS, MAX_OBSERVACIONES } from '../../../../core/config/catalogos';
import { TicketDetalle } from '../../../../core/models/ticket';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialog, ConfirmDialogData } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { StatusPill } from '../../../../shared/ui/status-pill/status-pill';
import { TicketService } from '../../data/ticket.service';
import { AccionDecision, DecisionDialog, DecisionDialogData } from '../decision-dialog/decision-dialog';

@Component({
  selector: 'ut-acciones-panel',
  imports: [NgTemplateOutlet, MatButtonModule, MatIconModule, StatusPill],
  templateUrl: './acciones-panel.html',
  styleUrl: './acciones-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccionesPanel {
  private dialog = inject(MatDialog);
  private auth = inject(AuthService);
  private tickets = inject(TicketService);
  private toast = inject(ToastService);

  readonly ticket = input.required<TicketDetalle>();
  readonly nombreEstudiante = input('el estudiante');
  readonly actualizado = output<TicketDetalle>();

  protected readonly MAX = MAX_OBSERVACIONES;
  protected readonly ESTADOS = ESTADOS;
  protected readonly atendiendo = signal(false);

  protected readonly observaciones = computed(
    () => this.ticket().seguimiento.filter(s => s.sAccion === 'OBSERVADO').length,
  );
  protected readonly segmentos = computed(() =>
    Array.from({ length: MAX_OBSERVACIONES }, (_, i) => i < this.observaciones()),
  );

  protected atender(): void {
    const t = this.ticket();
    const admin = this.auth.usuario();
    if (!admin) {
      return;
    }
    const data: ConfirmDialogData = {
      titulo: `¿Empezar a atender ${t.sNum_Ticket}?`,
      mensaje: `Pasará a En proceso y se avisará a ${this.nombreEstudiante()}.`,
      confirmar: 'Sí, atender',
      icono: 'play_circle',
    };
    this.dialog
      .open(ConfirmDialog, { data, width: '430px' })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.atendiendo.set(true);
          return this.tickets.cambiarEstado(t.nId_Ticket, {
            nId_Admin: admin.nId_Usuario,
            sEstado: 'EN_PROCESO',
            sComentario: null,
          });
        }),
      )
      .subscribe({
        next: detalle => {
          this.atendiendo.set(false);
          this.toast.ok(`${t.sNum_Ticket} pasó a En proceso. Se avisó a ${this.nombreEstudiante()}.`);
          this.actualizado.emit(detalle);
        },
        error: (e: HttpErrorResponse) => {
          this.atendiendo.set(false);
          this.toast.error(e.error?.message ?? 'No se pudo atender la solicitud');
        },
      });
  }

  protected decidir(accion: AccionDecision): void {
    const t = this.ticket();
    const data: DecisionDialogData = { ticket: t, accion };
    this.dialog
      .open<DecisionDialog, DecisionDialogData, TicketDetalle>(DecisionDialog, { data, width: '560px' })
      .afterClosed()
      .pipe(filter((d): d is TicketDetalle => !!d))
      .subscribe(detalle => {
        this.toast.ok(`${t.sNum_Ticket}: ${ESTADOS[accion].toLowerCase()}. Se avisó a ${this.nombreEstudiante()}.`);
        this.actualizado.emit(detalle);
      });
  }
}

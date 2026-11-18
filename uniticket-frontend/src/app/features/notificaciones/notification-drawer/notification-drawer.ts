import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { ESTADO_COLOR, ESTADO_ICONO } from '../../../core/config/catalogos';
import { Notificacion, TipoNotificacion } from '../../../core/models/notificacion';
import { AuthService } from '../../../core/services/auth.service';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { NotificationService } from '../data/notification.service';

type Filtro = 'TODAS' | 'NO_LEIDAS';

const APARIENCIA: Record<TipoNotificacion, { icono: string; color: string }> = {
  NUEVO: { icono: 'add_circle', color: '#3B4FD8' },
  RESPUESTA: { icono: 'chat', color: '#3B4FD8' },
  EN_PROCESO: { icono: ESTADO_ICONO.EN_PROCESO, color: ESTADO_COLOR.EN_PROCESO },
  OBSERVADO: { icono: ESTADO_ICONO.OBSERVADO, color: ESTADO_COLOR.OBSERVADO },
  PROCEDE: { icono: ESTADO_ICONO.PROCEDE, color: ESTADO_COLOR.PROCEDE },
  NO_PROCEDE: { icono: ESTADO_ICONO.NO_PROCEDE, color: ESTADO_COLOR.NO_PROCEDE },
};

@Component({
  selector: 'ut-notification-drawer',
  imports: [MatButtonModule, MatButtonToggleModule, MatIconModule, EmptyState],
  templateUrl: './notification-drawer.html',
  styleUrl: './notification-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationDrawer {
  private readonly avisos = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);

  readonly cerrar = output<void>();

  protected readonly noLeidas = this.avisos.noLeidas;
  protected readonly filtro = signal<Filtro>('TODAS');
  protected readonly visibles = computed(() =>
    this.filtro() === 'TODAS' ? this.avisos.items() : this.avisos.noLeidasItems(),
  );

  protected marcarTodas(): void {
    this.avisos.marcarTodasLeidas();
  }

  protected abrir(aviso: Notificacion): void {
    if (!aviso.bLeida) {
      this.avisos.marcarLeida(aviso.nId_Notificacion);
    }
    this.cerrar.emit();
    const base = this.auth.esAdmin() ? '/admin/solicitudes' : '/solicitudes';
    this.router.navigate([base, aviso.nId_Ticket]);
  }

  protected icono(aviso: Notificacion): string {
    return APARIENCIA[aviso.sTipo].icono;
  }

  protected color(aviso: Notificacion): string {
    return APARIENCIA[aviso.sTipo].color;
  }

  protected tiempo(fecha: string): string {
    const minutos = Math.floor((Date.now() - new Date(fecha).getTime()) / 60_000);
    if (minutos < 1) {
      return 'Hace un momento';
    }
    if (minutos < 60) {
      return `Hace ${minutos} min`;
    }
    if (minutos < 24 * 60) {
      return `Hace ${Math.floor(minutos / 60)} h`;
    }
    return formatDate(fecha, 'dd MMM, HH:mm', this.locale);
  }
}

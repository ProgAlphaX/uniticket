import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { NotificationService } from '../data/notification.service';

@Component({
  selector: 'ut-notification-drawer',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './notification-drawer.html',
  styleUrl: './notification-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationDrawer {

  private readonly notifications = inject(NotificationService);

  readonly items = this.notifications.items;
  readonly noLeidas = this.notifications.noLeidas;
  readonly noLeidasItems = this.notifications.noLeidasItems;

  readonly filtro = signal<'TODAS' | 'NO_LEIDAS'>('TODAS');

  readonly visibles = computed(() =>
    this.filtro() === 'TODAS'
      ? this.items()
      : this.noLeidasItems()
  );

  protected cambiarFiltro(tipo: 'TODAS' | 'NO_LEIDAS'): void {
    this.filtro.set(tipo);
  }

  protected marcarTodas(): void {
    this.notifications.marcarTodasLeidas();
  }

  protected marcarLeida(id: number): void {
    this.notifications.marcarLeida(id);
  }

  protected esRespuesta(tipo: string): boolean {
    return tipo === 'RESPUESTA';
  }

  protected tiempo(fecha: string): string {
    const ahora = new Date().getTime();
    const fechaNotificacion = new Date(fecha).getTime();

    const horas = Math.floor(
      (ahora - fechaNotificacion) / (1000 * 60 * 60)
    );

    if (horas < 24) {
      return `hace ${horas} h`;
    }

    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
    });
  }
}
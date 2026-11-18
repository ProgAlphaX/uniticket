import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { NotificationService } from '../data/notification.service';

@Component({
  selector: 'ut-notification-bell',
  imports: [MatButtonModule, MatBadgeModule, MatIconModule],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBell {
  private readonly avisos = inject(NotificationService);

  readonly abrir = output<void>();

  protected readonly noLeidas = this.avisos.noLeidas;
  protected readonly insignia = computed(() => (this.noLeidas() > 9 ? '9+' : String(this.noLeidas())));
  protected readonly etiqueta = computed(() =>
    this.noLeidas() ? `Avisos, ${this.noLeidas()} sin leer` : 'Avisos',
  );
}

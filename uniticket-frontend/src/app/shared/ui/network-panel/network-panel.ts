import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { RequestLogService } from '../../../core/services/request-log.service';

@Component({
  selector: 'ut-network-panel',
  imports: [JsonPipe, MatButtonModule, MatIconModule],
  templateUrl: './network-panel.html',
  styleUrl: './network-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.abierto]': 'abierto()',
    '(document:keydown)': 'tecla($event)',
  },
})
export class NetworkPanel {
  protected readonly log = inject(RequestLogService);
  protected readonly abierto = signal(false);

  tecla(evento: KeyboardEvent): void {
    const escribiendo = (evento.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable]');
    if (escribiendo || evento.ctrlKey || evento.metaKey || evento.altKey) {
      return;
    }
    if (evento.key.toLowerCase() === 'r') {
      this.abierto.update(valor => !valor);
    } else if (evento.key === 'Escape') {
      this.abierto.set(false);
    }
  }

  protected token(autorizacion: string | null): string {
    return autorizacion ? `${autorizacion.slice(0, 28)}…${autorizacion.slice(-6)}` : '(sin token · ruta pública)';
  }
}

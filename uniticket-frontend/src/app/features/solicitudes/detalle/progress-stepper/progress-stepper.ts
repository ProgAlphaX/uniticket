import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ESTADOS } from '../../../../core/config/catalogos';
import { TicketDetalle } from '../../../../core/models/ticket';

interface Paso {
  etiqueta: string;
  clase: 'done' | 'cur' | '';
}

@Component({
  selector: 'ut-progress-stepper',
  imports: [MatIconModule],
  templateUrl: './progress-stepper.html',
  styleUrl: './progress-stepper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressStepper {
  readonly ticket = input.required<TicketDetalle>();

  protected readonly estado = computed(() => this.ticket().sEstado);

  protected readonly pasos = computed<Paso[]>(() => {
    const t = this.ticket();
    const final = t.sEstado === 'PROCEDE' || t.sEstado === 'NO_PROCEDE';
    const fueObservada = t.seguimiento.some(s => s.sAccion === 'OBSERVADO');

    const etiquetas = ['Registrada', 'En proceso'];
    if (fueObservada || t.sEstado === 'OBSERVADO') {
      etiquetas.push(t.sEstado === 'OBSERVADO' ? 'Observada' : 'Observada · respondida');
    }
    etiquetas.push(final ? ESTADOS[t.sEstado] : 'Decisión');

    const ultimo = etiquetas.length - 1;
    const actual =
      t.sEstado === 'PENDIENTE' ? 0
      : t.sEstado === 'OBSERVADO' ? 2
      : final || fueObservada ? ultimo
      : 1;

    return etiquetas.map((etiqueta, i) => ({
      etiqueta,
      clase: i < actual ? 'done' : i === actual ? 'cur' : '',
    }));
  });
}

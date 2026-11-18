import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export interface BarraDato {
  clave: string;
  etiqueta: string;
  valor: number;
  icono: string;
}

@Component({
  selector: 'ut-bar-chart',
  imports: [MatIconModule],
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChart {
  readonly datos = input.required<BarraDato[]>();
  readonly seleccionar = output<string>();

  protected readonly total = computed(() => this.datos().reduce((suma, d) => suma + d.valor, 0));
  protected readonly ordenados = computed(() => [...this.datos()].sort((a, b) => b.valor - a.valor));
  protected readonly maximo = computed(() => Math.max(1, ...this.datos().map(d => d.valor)));
  protected readonly principal = computed(() => (this.total() > 0 ? this.ordenados()[0] : null));

  protected porcentaje(valor: number): number {
    return this.total() ? Math.round((valor * 100) / this.total()) : 0;
  }
}

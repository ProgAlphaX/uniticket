import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

export interface OpcionFiltro {
  valor: string;
  etiqueta: string;
  color: string;
}

@Component({
  selector: 'ut-column-filter',
  imports: [MatMenuModule, MatCheckboxModule, MatButtonModule, MatIconModule],
  templateUrl: './column-filter.html',
  styleUrl: './column-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnFilter {
  readonly opciones = input.required<OpcionFiltro[]>();
  readonly seleccion = model.required<string[]>();
  readonly modo = input<'icono' | 'boton'>('icono');
  readonly etiqueta = input('Filtrar');
  readonly forma = input<'cuadro' | 'punto'>('cuadro');

  protected readonly todos = computed(() => this.seleccion().length === this.opciones().length);
  protected readonly algunos = computed(() => this.seleccion().length > 0 && !this.todos());
  protected readonly activo = computed(() => !this.todos());

  protected alternarTodos(): void {
    this.seleccion.set(this.todos() ? [] : this.opciones().map(o => o.valor));
  }

  protected alternar(valor: string): void {
    const actual = this.seleccion();
    this.seleccion.set(actual.includes(valor) ? actual.filter(v => v !== valor) : [...actual, valor]);
  }
}

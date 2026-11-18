import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type TonoStat = 'PENDIENTE' | 'EN_PROCESO' | 'OBSERVADO' | 'PROCEDE' | 'NO_PROCEDE' | 'USUARIOS';

@Component({
  selector: 'ut-stat-card',
  imports: [MatIconModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {
  readonly etiqueta = input.required<string>();
  readonly valor = input.required<number>();
  readonly icono = input.required<string>();
  readonly tono = input.required<TonoStat>();
}

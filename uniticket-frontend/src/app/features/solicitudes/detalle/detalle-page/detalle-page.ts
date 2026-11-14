import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';

/** Página provisional: la reemplaza Alexander con la pantalla real. */
@Component({
  selector: 'ut-detalle-page',
  imports: [EmptyState],
  templateUrl: './detalle-page.html',
  styleUrl: './detalle-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetallePage {
  /** Id de la ruta (withComponentInputBinding). */
  readonly id = input.required<string>();
}

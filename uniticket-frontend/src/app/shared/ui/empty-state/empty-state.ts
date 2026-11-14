import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Ilustración y mensaje cuando una lista no tiene datos. Las acciones se proyectan con ng-content. */
@Component({
  selector: 'ut-empty-state',
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly titulo = input.required<string>();
  readonly mensaje = input<string>('');
}

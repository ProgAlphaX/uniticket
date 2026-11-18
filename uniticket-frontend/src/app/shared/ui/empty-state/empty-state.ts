import { ChangeDetectionStrategy, Component, input } from '@angular/core';

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

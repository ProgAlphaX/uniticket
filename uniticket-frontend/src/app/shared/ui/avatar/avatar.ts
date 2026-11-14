import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Iniciales del usuario sobre un color fijo que depende de su id. */
@Component({
  selector: 'ut-avatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"avatar avatar--" + color() + " avatar--" + tamano()', '[attr.aria-hidden]': 'true' },
})
export class Avatar {
  readonly id = input.required<number>();
  readonly nombres = input.required<string>();
  readonly apellidos = input<string>('');
  readonly tamano = input<'sm' | 'md' | 'lg'>('md');

  protected readonly iniciales = computed(() =>
    `${this.nombres().trim().charAt(0)}${this.apellidos().trim().charAt(0)}`.toUpperCase(),
  );
  protected readonly color = computed(() => this.id() % 6);
}

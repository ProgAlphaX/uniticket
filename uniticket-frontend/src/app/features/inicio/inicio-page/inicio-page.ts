import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EmptyState } from '../../../shared/ui/empty-state/empty-state';

/** Página provisional: la reemplaza Grover con la pantalla real. */
@Component({
  selector: 'ut-inicio-page',
  imports: [EmptyState],
  templateUrl: './inicio-page.html',
  styleUrl: './inicio-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioPage {}

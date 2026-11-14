import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EmptyState } from '../../../shared/ui/empty-state/empty-state';

/** Página provisional: la reemplaza Grover con la pantalla real. */
@Component({
  selector: 'ut-solicitudes-page',
  imports: [EmptyState],
  templateUrl: './solicitudes-page.html',
  styleUrl: './solicitudes-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitudesPage {}

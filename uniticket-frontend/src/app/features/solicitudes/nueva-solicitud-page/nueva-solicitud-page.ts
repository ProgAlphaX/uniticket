import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EmptyState } from '../../../shared/ui/empty-state/empty-state';

/** Página provisional: la reemplaza Grover con la pantalla real. */
@Component({
  selector: 'ut-nueva-solicitud-page',
  imports: [EmptyState],
  templateUrl: './nueva-solicitud-page.html',
  styleUrl: './nueva-solicitud-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevaSolicitudPage {}

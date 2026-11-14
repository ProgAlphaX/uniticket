import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EmptyState } from '../../../shared/ui/empty-state/empty-state';

/** Página provisional: la reemplaza Luis con la pantalla real. */
@Component({
  selector: 'ut-usuarios-page',
  imports: [EmptyState],
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosPage {}

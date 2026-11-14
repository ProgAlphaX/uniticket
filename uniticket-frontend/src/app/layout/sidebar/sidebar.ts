import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { estaActivo, itemsDeNavegacion } from '../navegacion';
import { urlActual } from '../url-actual';

@Component({
  selector: 'ut-sidebar',
  imports: [RouterLink, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.compacto]': 'compacto()' },
})
export class Sidebar {
  private readonly auth = inject(AuthService);
  private readonly url = urlActual();

  /** En tablet el menú se reduce a un riel de íconos. */
  readonly compacto = input(false);

  protected readonly items = computed(() => itemsDeNavegacion(this.auth.esAdmin()));
  protected readonly activo = estaActivo;
  protected readonly urlActual = this.url;

  protected salir(): void {
    this.auth.cerrarSesion();
  }
}

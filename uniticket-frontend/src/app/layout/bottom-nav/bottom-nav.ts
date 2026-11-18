import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { estaActivo, itemsDeNavegacion } from '../navegacion';
import { urlActual } from '../url-actual';

@Component({
  selector: 'ut-bottom-nav',
  imports: [RouterLink, MatIconModule],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNav {
  private readonly auth = inject(AuthService);
  protected readonly urlActual = urlActual();
  protected readonly items = computed(() => itemsDeNavegacion(this.auth.esAdmin()));
  protected readonly activo = estaActivo;
}

import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { NotificationBell } from '../../features/notificaciones/notification-bell/notification-bell';

import { ROLES } from '../../core/config/catalogos';
import { AuthService } from '../../core/services/auth.service';
import { Avatar } from '../../shared/ui/avatar/avatar';

interface DatosRuta {
  titulo?: string;
  volver?: string;
}

@Component({
  selector: 'ut-topbar',
  imports: [RouterLink, MatButtonModule, MatIconModule, Avatar, NotificationBell],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Topbar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  /** En celular no hay menú lateral, así que el botón de salir va aquí. */
  readonly esMovil = input(false);
  /** Lo emite la campanita de notificaciones para abrir el panel lateral. */
  readonly abrirAvisos = output<void>();

  protected readonly usuario = this.auth.usuario;
  protected readonly rol = computed(() => {
    const usuario = this.usuario();
    return usuario ? ROLES[usuario.sRol] : '';
  });
  protected readonly nombreCorto = computed(() => {
    const usuario = this.usuario();
    return usuario ? `${usuario.sNombres.split(' ')[0]} ${usuario.sApellidos.split(' ')[0]}` : '';
  });

  protected readonly datos = toSignal(
    this.router.events.pipe(
      filter(evento => evento instanceof NavigationEnd),
      map(() => this.datosDeRuta()),
    ),
    { initialValue: this.datosDeRuta() },
  );

  protected salir(): void {
    this.auth.cerrarSesion();
  }

  private datosDeRuta(): DatosRuta {
    let actual = this.ruta.snapshot;
    while (actual.firstChild) {
      actual = actual.firstChild;
    }
    return actual.data as DatosRuta;
  }
}

import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

import { BottomNav } from '../bottom-nav/bottom-nav';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

/** Estructura de las pantallas privadas: menú, barra superior, contenido y panel de avisos a la derecha. */
@Component({
  selector: 'ut-app-shell',
  imports: [MatSidenavModule, RouterOutlet, Sidebar, BottomNav, Topbar],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  private readonly breakpoints = inject(BreakpointObserver);

  protected readonly esMovil = toSignal(
    this.breakpoints.observe('(max-width: 639.98px)').pipe(map(estado => estado.matches)),
    { initialValue: false },
  );
  protected readonly esTablet = toSignal(
    this.breakpoints.observe('(min-width: 640px) and (max-width: 1023.98px)').pipe(map(estado => estado.matches)),
    { initialValue: false },
  );
}

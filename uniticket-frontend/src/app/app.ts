import { Component, isDevMode } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NetworkPanel } from './shared/ui/network-panel/network-panel';

@Component({
  selector: 'ut-root',
  imports: [RouterOutlet, NetworkPanel],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly modoDesarrollo = isDevMode();
}

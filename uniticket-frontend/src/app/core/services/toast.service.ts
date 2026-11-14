import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private snackBar = inject(MatSnackBar);

  ok(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 4000, panelClass: 'ut-toast-ok' });
  }

  error(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 6000, panelClass: 'ut-toast-error' });
  }
}

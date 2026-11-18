import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, catchError, of, switchMap, timer } from 'rxjs';

import { API_URL } from '../../../core/config/api';
import { Notificacion } from '../../../core/models/notificacion';
import { AuthService } from '../../../core/services/auth.service';

export const INTERVALO_AVISOS = 30_000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/notificaciones`;

  readonly items = signal<Notificacion[]>([]);
  readonly noLeidasItems = computed(() => this.items().filter(item => !item.bLeida));
  readonly noLeidas = computed(() => this.noLeidasItems().length);

  constructor() {
    toObservable(inject(AuthService).usuario)
      .pipe(
        switchMap(usuario =>
          usuario ? timer(0, INTERVALO_AVISOS).pipe(switchMap(() => this.pedir())) : of([]),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(items => this.items.set(items));
  }

  cargar(): void {
    this.pedir().subscribe(items => this.items.set(items));
  }

  marcarLeida(id: number): void {
    this.items.update(items => items.map(item => (item.nId_Notificacion === id ? { ...item, bLeida: true } : item)));
    this.http.put<void>(`${this.url}/${id}/leida`, {}).subscribe({ error: () => this.cargar() });
  }

  marcarTodasLeidas(): void {
    this.items.update(items => items.map(item => ({ ...item, bLeida: true })));
    this.http.put<void>(`${this.url}/leidas`, {}).subscribe({ error: () => this.cargar() });
  }

  private pedir(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.url).pipe(catchError(() => EMPTY));
  }
}

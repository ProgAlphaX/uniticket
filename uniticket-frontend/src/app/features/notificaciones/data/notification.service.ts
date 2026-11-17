import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';

import { API_URL } from '../../../core/config/api';
import { Notificacion } from '../../../core/models/notificacion';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private http = inject(HttpClient);

    private readonly apiUrl = `${API_URL}/notificaciones`;

    readonly items = signal<Notificacion[]>([]);

    readonly noLeidasItems = computed(() =>
        this.items().filter(item => !item.bLeida)
    );

    readonly noLeidas = computed(() =>
        this.noLeidasItems().length
    );

    constructor() {
        this.cargar();

        interval(30000).subscribe(() => {
            this.cargar();
        });
    }

    cargar(): void {
        this.http
            .get<Notificacion[]>(this.apiUrl)
            .subscribe({
                next: (data) => this.items.set(data),
                error: (error) => console.error('Error cargando notificaciones', error)
            });
    }

    marcarLeida(id: number): void {
        this.http
            .put<void>(`${this.apiUrl}/${id}/leida`, {})
            .subscribe({
                next: () => {
                    this.items.update(items =>
                        items.map(item =>
                            item.nId_Notificacion === id
                                ? { ...item, bLeida: true }
                                : item
                        )
                    );
                },
                error: (error) => console.error('Error marcando notificación', error)
            });
    }

    marcarTodasLeidas(): void {
        this.http
            .put<void>(`${this.apiUrl}/leidas`, {})
            .subscribe({
                next: () => {
                    this.items.update(items =>
                        items.map(item => ({
                            ...item,
                            bLeida: true
                        }))
                    );
                },
                error: (error) => console.error('Error marcando todas las notificaciones', error)
            });
    }
}
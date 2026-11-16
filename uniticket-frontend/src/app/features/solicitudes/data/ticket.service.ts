import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comentario, TicketDetalle, TicketEstado } from '../../../core/models/ticket';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);
  // Base API configurada según la arquitectura del proyecto
  private apiUrl = 'http://localhost:8080/api/tickets';

  // Operación 08: Listar solicitudes (permite filtros opcionales de estado y tipo)
  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Operación 09: Obtener el detalle de una solicitud por su ID (incluye seguimiento)
  obtener(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Operación 07: Registrar una nueva solicitud
  crear(ticket: { nId_Usuario: number; sTipo: string; sAsunto: string; sDescripcion: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, ticket);
  }

  // ===== Alexander · gestión de la solicitud (ops 10–11) =====

  // Operación 10: Cambiar estado (Atender, Observar, Procede, No procede). Solo admin.
  cambiarEstado(id: number, body: TicketEstado): Observable<TicketDetalle> {
    return this.http.put<TicketDetalle>(`${this.apiUrl}/${id}/estado`, body);
  }

  // Operación 11: El estudiante responde una observación (vuelve a EN_PROCESO).
  responder(id: number, body: Comentario): Observable<TicketDetalle> {
    return this.http.post<TicketDetalle>(`${this.apiUrl}/${id}/comentarios`, body);
  }
}
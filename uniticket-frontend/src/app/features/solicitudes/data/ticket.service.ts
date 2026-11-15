import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}
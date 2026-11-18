import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api';
import { EstadoTicket, TipoTicket } from '../../../core/config/catalogos';
import { Comentario, Ticket, TicketCreate, TicketDetalle, TicketEstado } from '../../../core/models/ticket';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  private url = `${API_URL}/tickets`;

  listar(filtros: { estado?: EstadoTicket; tipo?: TipoTicket } = {}): Observable<Ticket[]> {
    let params = new HttpParams();
    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }
    if (filtros.tipo) {
      params = params.set('tipo', filtros.tipo);
    }
    return this.http.get<Ticket[]>(this.url, { params });
  }

  obtener(id: number): Observable<TicketDetalle> {
    return this.http.get<TicketDetalle>(`${this.url}/${id}`);
  }

  crear(ticket: TicketCreate): Observable<Ticket> {
    return this.http.post<Ticket>(this.url, ticket);
  }

  cambiarEstado(id: number, cambio: TicketEstado): Observable<TicketDetalle> {
    return this.http.put<TicketDetalle>(`${this.url}/${id}/estado`, cambio);
  }

  responder(id: number, comentario: Comentario): Observable<TicketDetalle> {
    return this.http.post<TicketDetalle>(`${this.url}/${id}/comentarios`, comentario);
  }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api';
import { EstadoUsuario } from '../../../core/config/catalogos';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../../../core/models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/usuarios`;

  getUsuarios(estado?: EstadoUsuario): Observable<Usuario[]> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<Usuario[]>(this.url, { params });
  }

  buscar(nombre: string): Observable<Usuario[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<Usuario[]>(`${this.url}/buscar`, { params });
  }

  crearUsuario(datos: UsuarioCreate): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, datos);
  }

  actualizar(id: number, datos: UsuarioUpdate): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}`, datos);
  }

  cambiarEstado(id: number, estado: EstadoUsuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}/estado`, { sEstado: estado });
  }
}

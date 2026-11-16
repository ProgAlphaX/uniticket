import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api';
import { EstadoUsuario } from '../../../core/config/catalogos';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../../../core/models/usuario';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private http = inject(HttpClient);
    private apiUrl = `${API_URL}/usuarios`;

    // Listar usuarios con filtro opcional por estado
    getUsuarios(estado?: EstadoUsuario): Observable<Usuario[]> {
        let params = new HttpParams();
        if (estado) {
            params = params.set('estado', estado);
        }
        return this.http.get<Usuario[]>(this.apiUrl, { params });
    }

    // Buscar usuarios por nombre
    buscar(nombre: string): Observable<Usuario[]> {
        const params = new HttpParams().set('nombre', nombre);
        return this.http.get<Usuario[]>(`${this.apiUrl}/buscar`, { params });
    }

    // Crear usuario
    crearUsuario(data: UsuarioCreate): Observable<Usuario> {
        return this.http.post<Usuario>(this.apiUrl, data);
    }

    // Actualizar usuario
    actualizar(id: number, data: UsuarioUpdate): Observable<Usuario> {
        return this.http.put<Usuario>(`${this.apiUrl}/${id}`, data);
    }

    // Cambiar estado del usuario (Activar / Desactivar)
    cambiarEstado(id: number, estado: EstadoUsuario): Observable<Usuario> {
        return this.http.put<Usuario>(`${this.apiUrl}/${id}/estado`, { sEstado: estado });
    }
}
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, switchMap, tap } from 'rxjs';

import { API_URL } from '../config/api';
import { LoginRequest, Usuario } from '../models/usuario';

const PERFIL_KEY = 'perfil';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly TOKEN_KEY = 'access_token';

  readonly usuario = signal<Usuario | null>(this.leerPerfil());
  readonly esAdmin = computed(() => this.usuario()?.sRol === 'ADMIN');

  getToken(credenciales: LoginRequest): Observable<string> {
    return this.http.post(`${API_URL}/auth/login`, credenciales, { responseType: 'text' });
  }

  guardarToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  obtenerToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  cerrarSesion(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(PERFIL_KEY);
    this.usuario.set(null);
    this.router.navigate(['/login']);
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    if (!token) {
      return false;
    }
    const exp = this.leerPayload(token)?.exp;
    return typeof exp !== 'number' || exp * 1000 > Date.now();
  }

  iniciarSesion(credenciales: LoginRequest): Observable<Usuario> {
    return this.getToken(credenciales).pipe(
      tap(token => this.guardarToken(token)),
      switchMap(() => this.cargarPerfil()),
    );
  }

  cargarPerfil(): Observable<Usuario> {
    const email = this.emailDelToken();
    return this.http.get<Usuario[]>(`${API_URL}/usuarios`).pipe(
      map(usuarios => {
        const perfil = usuarios.find(u => u.sEmail.toLowerCase() === email?.toLowerCase());
        if (!perfil) {
          throw new Error('No se encontró el perfil del usuario autenticado');
        }
        return perfil;
      }),
      tap(perfil => {
        sessionStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
        this.usuario.set(perfil);
      }),
    );
  }

  emailDelToken(): string | null {
    const token = this.obtenerToken();
    return token ? (this.leerPayload(token)?.sub ?? null) : null;
  }

  private leerPayload(token: string): { sub?: string; exp?: number } | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }

  private leerPerfil(): Usuario | null {
    try {
      const perfil = sessionStorage.getItem(PERFIL_KEY);
      return perfil ? (JSON.parse(perfil) as Usuario) : null;
    } catch {
      return null;
    }
  }
}

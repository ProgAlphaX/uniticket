import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { API_URL } from '../config/api';
import { Usuario } from '../models/usuario';
import { AuthService } from './auth.service';

/** Genera un JWT falso (sin firma válida) con el email y la expiración indicados. */
export function crearToken(email: string, expiraEnSegundos = 3600): string {
  const payload = btoa(JSON.stringify({ sub: email, exp: Math.floor(Date.now() / 1000) + expiraEnSegundos }));
  return `cabecera.${payload}.firma`;
}

export const ADMIN: Usuario = {
  nId_Usuario: 1, sNombres: 'Julio', sApellidos: 'Admin', sNombreCompleto: 'Julio Admin',
  sEmail: 'julio.admin@utp.edu.pe', sDni: '70123456', sTelefono: null, sRol: 'ADMIN', sEstado: 'ACTIVO',
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const router = jasmine.createSpyObj<Router>('Router', ['navigate']);

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: Router, useValue: router }],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('guarda y obtiene el token en sessionStorage con la clave access_token', () => {
    service.guardarToken('abc');
    expect(service.obtenerToken()).toBe('abc');
    expect(sessionStorage.getItem('access_token')).toBe('abc');
  });

  it('estaAutenticado es falso sin token o con token vencido', () => {
    expect(service.estaAutenticado()).toBeFalse();
    service.guardarToken(crearToken('a@utp.edu.pe', -10));
    expect(service.estaAutenticado()).toBeFalse();
    service.guardarToken(crearToken('a@utp.edu.pe'));
    expect(service.estaAutenticado()).toBeTrue();
  });

  it('getToken hace POST a /auth/login y recibe el token como texto', () => {
    service.getToken({ sEmail: 'a@utp.edu.pe', sPassword: '123456' }).subscribe(t => expect(t).toBe('token'));
    const req = http.expectOne(`${API_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.responseType).toBe('text');
    req.flush('token');
  });

  it('iniciarSesion guarda el token y carga el perfil del email del token', () => {
    const token = crearToken(ADMIN.sEmail);
    let perfil: Usuario | undefined;
    service.iniciarSesion({ sEmail: ADMIN.sEmail, sPassword: '123456' }).subscribe(u => (perfil = u));

    http.expectOne(`${API_URL}/auth/login`).flush(token);
    http.expectOne(`${API_URL}/usuarios`).flush([ADMIN]);

    expect(perfil).toEqual(ADMIN);
    expect(service.usuario()).toEqual(ADMIN);
    expect(service.esAdmin()).toBeTrue();
    expect(service.obtenerToken()).toBe(token);
  });

  it('cerrarSesion borra el token, el perfil y vuelve al login', () => {
    service.guardarToken(crearToken(ADMIN.sEmail));
    service.usuario.set(ADMIN);
    service.cerrarSesion();
    expect(service.obtenerToken()).toBeNull();
    expect(service.usuario()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});

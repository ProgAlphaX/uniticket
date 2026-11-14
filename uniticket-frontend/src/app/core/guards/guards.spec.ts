import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';

import { Usuario } from '../models/usuario';
import { AuthService } from '../services/auth.service';
import { adminGuard } from './admin.guard';
import { authGuard } from './auth.guard';
import { estudianteGuard } from './estudiante.guard';
import { guestGuard } from './guest.guard';

describe('Guards', () => {
  const usuario = signal<Usuario | null>(null);
  const esAdmin = signal(false);
  let autenticado = false;

  const ejecutar = (guard: typeof authGuard) =>
    TestBed.runInInjectionContext(() => guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
  const ruta = (resultado: unknown) => TestBed.inject(Router).serializeUrl(resultado as UrlTree);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { usuario, esAdmin, estaAutenticado: () => autenticado } },
      ],
    });
  });

  it('authGuard redirige a /login sin sesión', () => {
    autenticado = false;
    usuario.set(null);
    expect(ruta(ejecutar(authGuard))).toBe('/login');
  });

  it('authGuard deja pasar con sesión y perfil cargado', () => {
    autenticado = true;
    usuario.set({ nId_Usuario: 2 } as Usuario);
    expect(ejecutar(authGuard)).toBeTrue();
  });

  it('guestGuard manda al inicio si ya hay sesión', () => {
    autenticado = true;
    usuario.set({ nId_Usuario: 2 } as Usuario);
    expect(ruta(ejecutar(guestGuard))).toBe('/inicio');
  });

  it('adminGuard bloquea a un estudiante', () => {
    esAdmin.set(false);
    expect(ruta(ejecutar(adminGuard))).toBe('/inicio');
  });

  it('adminGuard deja pasar a un administrador', () => {
    esAdmin.set(true);
    expect(ejecutar(adminGuard)).toBeTrue();
  });

  it('estudianteGuard manda al admin a su bandeja', () => {
    esAdmin.set(true);
    expect(ruta(ejecutar(estudianteGuard))).toBe('/admin/solicitudes');
  });
});

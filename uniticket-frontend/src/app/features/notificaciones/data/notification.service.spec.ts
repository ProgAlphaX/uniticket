import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WritableSignal, signal } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { API_URL } from '../../../core/config/api';
import { Notificacion } from '../../../core/models/notificacion';
import { Usuario } from '../../../core/models/usuario';
import { AuthService } from '../../../core/services/auth.service';
import { ESTUDIANTE } from '../../solicitudes/testing-data';
import { INTERVALO_AVISOS, NotificationService } from './notification.service';

export const AVISOS: Notificacion[] = [
  {
    nId_Notificacion: 1, nId_Ticket: 2, sNum_Ticket: 'SOL-0002', sAsunto: 'Pago duplicado',
    sTipo: 'OBSERVADO', sMensaje: 'Tu solicitud fue observada', bLeida: false, dFecha: new Date().toISOString(),
  },
  {
    nId_Notificacion: 2, nId_Ticket: 1, sNum_Ticket: 'SOL-0001', sAsunto: 'Constancia de matrícula',
    sTipo: 'EN_PROCESO', sMensaje: 'Tu solicitud está en proceso', bLeida: true, dFecha: '2026-11-10T09:00:00',
  },
];

describe('NotificationService', () => {
  let http: HttpTestingController;
  let usuario: WritableSignal<Usuario | null>;
  let servicio: NotificationService;
  const url = `${API_URL}/notificaciones`;

  beforeEach(() => {
    usuario = signal<Usuario | null>(ESTUDIANTE);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: AuthService, useValue: { usuario } }],
    });
    http = TestBed.inject(HttpTestingController);
    servicio = TestBed.inject(NotificationService);
  });

  afterEach(() => http.verify());

  it('carga los avisos al iniciar sesión y los vuelve a pedir cada cierto tiempo', fakeAsync(() => {
    TestBed.tick();
    tick();
    http.expectOne(url).flush(AVISOS);
    expect(servicio.noLeidas()).toBe(1);

    tick(INTERVALO_AVISOS);
    http.expectOne(url).flush([AVISOS[1]]);
    expect(servicio.noLeidas()).toBe(0);

    usuario.set(null);
    TestBed.tick();
    tick();
  }));

  it('deja de pedir avisos y limpia la lista al cerrar sesión', fakeAsync(() => {
    TestBed.tick();
    tick();
    http.expectOne(url).flush(AVISOS);

    usuario.set(null);
    TestBed.tick();
    tick(INTERVALO_AVISOS);
    http.expectNone(url);
    expect(servicio.items()).toEqual([]);
  }));

  it('marca un aviso como leído sin esperar al servidor', () => {
    servicio.items.set(AVISOS);
    servicio.marcarLeida(1);

    expect(servicio.noLeidas()).toBe(0);
    const peticion = http.expectOne(`${url}/1/leida`);
    expect(peticion.request.method).toBe('PUT');
    peticion.flush(null);
  });

  it('marca todos los avisos como leídos', () => {
    servicio.items.set(AVISOS.map(aviso => ({ ...aviso, bLeida: false })));
    servicio.marcarTodasLeidas();

    expect(servicio.noLeidas()).toBe(0);
    http.expectOne(`${url}/leidas`).flush(null);
  });
});

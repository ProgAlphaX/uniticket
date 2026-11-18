import { BreakpointObserver } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Usuario } from '../../../core/models/usuario';
import { AuthService } from '../../../core/services/auth.service';
import { TicketService } from '../../solicitudes/data/ticket.service';
import { ADMIN, ESTUDIANTE, TICKETS } from '../../solicitudes/testing-data';
import { InicioPage } from './inicio-page';

describe('InicioPage', () => {
  const crear = (usuario: Usuario, movil = false) => {
    TestBed.configureTestingModule({
      imports: [InicioPage],
      providers: [
        provideRouter([]),
        { provide: TicketService, useValue: { listar: () => of(TICKETS) } },
        { provide: HttpClient, useValue: { get: () => of([ADMIN, ESTUDIANTE, { ...ESTUDIANTE, nId_Usuario: 9, sEstado: 'INACTIVO' }]) } },
        { provide: AuthService, useValue: { usuario: signal(usuario), esAdmin: signal(usuario.sRol === 'ADMIN') } },
        { provide: BreakpointObserver, useValue: { observe: () => of({ matches: movil, breakpoints: {} }), isMatched: () => movil } },
      ],
    });
    spyOn(console, 'log');
    const fixture = TestBed.createComponent(InicioPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  const valores = (el: HTMLElement) =>
    Array.from(el.querySelectorAll('ut-stat-card')).map(c => [
      c.querySelector('.etiqueta')!.textContent!.trim(),
      Number(c.querySelector('.valor')!.textContent),
    ]);

  it('el estudiante ve sus 5 contadores y el aviso de la solicitud observada', () => {
    const el = crear(ESTUDIANTE);
    expect(valores(el)).toEqual([
      ['Pendientes', 1], ['En proceso', 0], ['Observadas', 1], ['Procede', 0], ['No procede', 0],
    ]);
    expect(el.textContent).toContain('Una solicitud espera tu respuesta');
    expect(el.querySelector('ut-bar-chart')).toBeNull();
  });

  it('el administrador ve los contadores globales, los usuarios activos y el gráfico', () => {
    const el = crear(ADMIN);
    expect(valores(el)).toEqual([
      ['Pendientes', 2], ['En proceso', 0], ['Observadas', 1], ['Procede', 1], ['No procede', 0], ['Usuarios activos', 2],
    ]);
    expect(el.querySelector('ut-bar-chart')).not.toBeNull();
    expect(el.textContent).toContain('Por atender');
  });

  it('el estudiante tiene el botón de nueva solicitud en escritorio', () => {
    expect(crear(ESTUDIANTE).querySelector('a[href="/solicitudes/nueva"]')).not.toBeNull();
  });

  it('en móvil no repite el botón de nueva solicitud porque está en la barra inferior', () => {
    expect(crear(ESTUDIANTE, true).querySelector('a[href="/solicitudes/nueva"]')).toBeNull();
  });

  it('el administrador no tiene el botón de nueva solicitud', () => {
    expect(crear(ADMIN).querySelector('a[href="/solicitudes/nueva"]')).toBeNull();
  });
});

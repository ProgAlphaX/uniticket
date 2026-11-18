import { BreakpointObserver } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Usuario } from '../../../core/models/usuario';
import { AuthService } from '../../../core/services/auth.service';
import { TicketService } from '../data/ticket.service';
import { ADMIN, ESTUDIANTE, TICKETS } from '../testing-data';
import { SolicitudesPage } from './solicitudes-page';

interface PaginaPrueba {
  filtrados: () => { sNum_Ticket: string }[];
  buscar: (texto: string) => void;
  cambiarEstados: (estados: string[]) => void;
  limpiarFiltros: () => void;
}

describe('SolicitudesPage', () => {
  let vista: HTMLElement;

  const crear = (usuario: Usuario, filtros: { estado?: string; tipo?: string } = {}, movil = false) => {
    TestBed.configureTestingModule({
      imports: [SolicitudesPage],
      providers: [
        provideRouter([]),
        { provide: TicketService, useValue: { listar: () => of(TICKETS) } },
        { provide: HttpClient, useValue: { get: () => of([ADMIN, ESTUDIANTE]) } },
        { provide: AuthService, useValue: { usuario: signal(usuario), esAdmin: signal(usuario.sRol === 'ADMIN') } },
        { provide: BreakpointObserver, useValue: { observe: () => of({ matches: movil, breakpoints: {} }), isMatched: () => movil } },
      ],
    });
    spyOn(console, 'log');
    const fixture = TestBed.createComponent(SolicitudesPage);
    if (filtros.estado) fixture.componentRef.setInput('estado', filtros.estado);
    if (filtros.tipo) fixture.componentRef.setInput('tipo', filtros.tipo);
    fixture.detectChanges();
    vista = fixture.nativeElement;
    return fixture.componentInstance as unknown as PaginaPrueba;
  };

  const numeros = (pagina: PaginaPrueba) => pagina.filtrados().map(t => t.sNum_Ticket);

  it('el estudiante solo ve sus propias solicitudes', () => {
    expect(numeros(crear(ESTUDIANTE))).toEqual(['SOL-0001', 'SOL-0002']);
  });

  it('el administrador ve todas', () => {
    expect(numeros(crear(ADMIN)).length).toBe(4);
  });

  it('aplica el estado que llega por la URL', () => {
    expect(numeros(crear(ADMIN, { estado: 'PENDIENTE' }))).toEqual(['SOL-0001', 'SOL-0003']);
  });

  it('aplica la categoría que llega por la URL', () => {
    expect(numeros(crear(ADMIN, { tipo: 'DOCUMENTOS' }))).toEqual(['SOL-0004']);
  });

  it('busca por asunto sin importar tildes ni mayúsculas', () => {
    const pagina = crear(ADMIN);
    pagina.buscar('DUPLICADO');
    expect(numeros(pagina)).toEqual(['SOL-0002', 'SOL-0004']);
  });

  it('busca por DNI del estudiante y limpia los filtros', () => {
    const pagina = crear(ADMIN);
    pagina.buscar('72345678');
    expect(numeros(pagina)).toEqual(['SOL-0001', 'SOL-0002']);
    pagina.cambiarEstados(['OBSERVADO']);
    expect(numeros(pagina)).toEqual(['SOL-0002']);
    pagina.limpiarFiltros();
    expect(numeros(pagina).length).toBe(4);
  });

  it('el estudiante tiene el botón de nueva solicitud en escritorio', () => {
    crear(ESTUDIANTE);
    expect(vista.querySelector('a[href="/solicitudes/nueva"]')).not.toBeNull();
  });

  it('en móvil no repite el botón de nueva solicitud porque está en la barra inferior', () => {
    crear(ESTUDIANTE, {}, true);
    expect(vista.querySelector('a[href="/solicitudes/nueva"]')).toBeNull();
  });

  it('el administrador no tiene el botón de nueva solicitud', () => {
    crear(ADMIN);
    expect(vista.querySelector('a[href="/solicitudes/nueva"]')).toBeNull();
  });
});

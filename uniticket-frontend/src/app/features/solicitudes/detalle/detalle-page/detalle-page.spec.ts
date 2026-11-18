import { HttpErrorResponse } from '@angular/common/http';
import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Usuario } from '../../../../core/models/usuario';
import { AuthService } from '../../../../core/services/auth.service';
import { UsuarioService } from '../../../usuarios/data/usuario.service';
import { TicketService } from '../../data/ticket.service';
import { ADMIN, ESTUDIANTE, TICKETS, detalle } from '../../testing-data';
import { DetallePage } from './detalle-page';

describe('DetallePage', () => {
  let tickets: jasmine.SpyObj<TicketService>;
  let usuarios: jasmine.SpyObj<UsuarioService>;
  let fixture: ComponentFixture<DetallePage>;

  function crear(usuario: Usuario, id: number): HTMLElement {
    const actual = signal(usuario);
    TestBed.configureTestingModule({
      imports: [DetallePage],
      providers: [
        { provide: TicketService, useValue: tickets },
        { provide: UsuarioService, useValue: usuarios },
        { provide: AuthService, useValue: { usuario: actual, esAdmin: computed(() => actual().sRol === 'ADMIN') } },
      ],
    });
    fixture = TestBed.createComponent(DetallePage);
    fixture.componentRef.setInput('id', String(id));
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  beforeEach(() => {
    tickets = jasmine.createSpyObj<TicketService>('TicketService', ['obtener', 'cambiarEstado', 'responder']);
    usuarios = jasmine.createSpyObj<UsuarioService>('UsuarioService', ['getUsuarios']);
    usuarios.getUsuarios.and.returnValue(of([ESTUDIANTE]));
  });

  it('muestra al estudiante su solicitud y el formulario para responder la observación', () => {
    tickets.obtener.and.returnValue(of(detalle(TICKETS[1], ['REGISTRO', 'EN_PROCESO', 'OBSERVADO'])));
    const vista = crear(ESTUDIANTE, 2);

    expect(tickets.obtener).toHaveBeenCalledWith(2);
    expect(vista.querySelector('h2')?.textContent).toContain('Pago duplicado');
    expect(vista.querySelector('ut-respuesta-form')).not.toBeNull();
    expect(vista.querySelector('ut-acciones-panel')).toBeNull();
    expect(usuarios.getUsuarios).not.toHaveBeenCalled();
  });

  it('no muestra al estudiante una solicitud de otra persona', () => {
    tickets.obtener.and.returnValue(of(detalle(TICKETS[2])));
    const vista = crear(ESTUDIANTE, 3);

    expect(vista.querySelector('[role="alert"]')?.textContent).toContain('Solicitud no encontrada');
    expect(vista.querySelector('h2')).toBeNull();
  });

  it('muestra al admin las acciones y la ficha del estudiante', () => {
    tickets.obtener.and.returnValue(of(detalle(TICKETS[0])));
    const vista = crear(ADMIN, 1);

    expect(vista.querySelector('ut-acciones-panel')).not.toBeNull();
    expect(usuarios.getUsuarios).toHaveBeenCalled();
    expect(vista.textContent).toContain(ESTUDIANTE.sEmail);
  });

  it('avisa cuando la solicitud no existe', () => {
    tickets.obtener.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const vista = crear(ADMIN, 99);

    expect(vista.querySelector('[role="alert"]')?.textContent).toContain('Solicitud no encontrada');
  });
});

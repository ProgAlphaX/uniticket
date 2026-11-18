import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { AccionSeguimiento } from '../../../../core/models/seguimiento';
import { Ticket } from '../../../../core/models/ticket';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TicketService } from '../../data/ticket.service';
import { ADMIN, TICKETS, detalle } from '../../testing-data';
import { AccionesPanel } from './acciones-panel';

describe('AccionesPanel', () => {
  let tickets: jasmine.SpyObj<TicketService>;
  let dialogo: { open: jasmine.Spy };
  let fixture: ComponentFixture<AccionesPanel>;

  function crear(estado: Ticket['sEstado'], acciones: AccionSeguimiento[] = ['REGISTRO']): HTMLElement {
    fixture = TestBed.createComponent(AccionesPanel);
    fixture.componentRef.setInput('ticket', detalle({ ...TICKETS[0], sEstado: estado }, acciones));
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  function botones(vista: HTMLElement): string[] {
    return Array.from(vista.querySelectorAll('button')).map(b => b.textContent!.trim());
  }

  beforeEach(() => {
    tickets = jasmine.createSpyObj<TicketService>('TicketService', ['cambiarEstado']);
    dialogo = { open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) }) };
    TestBed.configureTestingModule({
      imports: [AccionesPanel],
      providers: [
        { provide: TicketService, useValue: tickets },
        { provide: MatDialog, useValue: dialogo },
        { provide: AuthService, useValue: { usuario: signal(ADMIN) } },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['ok', 'error']) },
      ],
    });
  });

  it('atiende una solicitud pendiente tras confirmar', () => {
    const actualizado = detalle({ ...TICKETS[0], sEstado: 'EN_PROCESO' }, ['REGISTRO', 'EN_PROCESO']);
    tickets.cambiarEstado.and.returnValue(of(actualizado));
    const vista = crear('PENDIENTE');
    const emitidos: unknown[] = [];
    fixture.componentInstance.actualizado.subscribe(d => emitidos.push(d));

    vista.querySelector('button')!.click();

    expect(tickets.cambiarEstado).toHaveBeenCalledWith(1, { sEstado: 'EN_PROCESO', sComentario: null });
    expect(emitidos).toEqual([actualizado]);
  });

  it('en proceso ofrece procede, observar y no procede', () => {
    const vista = crear('EN_PROCESO', ['REGISTRO', 'EN_PROCESO']);

    expect(botones(vista).join('|')).toMatch(/Procede.*Observar \(1 de 2\).*No procede/);
  });

  it('oculta observar cuando ya se usaron las dos observaciones', () => {
    const vista = crear('EN_PROCESO', ['REGISTRO', 'EN_PROCESO', 'OBSERVADO', 'RESPUESTA', 'OBSERVADO', 'RESPUESTA']);

    expect(botones(vista).some(b => b.includes('Observar'))).toBeFalse();
    expect(vista.textContent).toContain('Límite de observaciones alcanzado');
  });

  it('una solicitud cerrada no tiene acciones', () => {
    const vista = crear('PROCEDE', ['REGISTRO', 'EN_PROCESO', 'PROCEDE']);

    expect(botones(vista)).toEqual([]);
    expect(vista.textContent).toContain('Ya no admite cambios');
  });
});

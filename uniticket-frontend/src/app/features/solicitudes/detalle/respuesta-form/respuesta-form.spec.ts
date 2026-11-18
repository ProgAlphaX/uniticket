import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TicketService } from '../../data/ticket.service';
import { ESTUDIANTE, TICKETS, detalle } from '../../testing-data';
import { RespuestaForm } from './respuesta-form';

describe('RespuestaForm', () => {
  let tickets: jasmine.SpyObj<TicketService>;
  let fixture: ComponentFixture<RespuestaForm>;

  beforeEach(() => {
    tickets = jasmine.createSpyObj<TicketService>('TicketService', ['responder']);
    TestBed.configureTestingModule({
      imports: [RespuestaForm],
      providers: [
        { provide: TicketService, useValue: tickets },
        { provide: AuthService, useValue: { usuario: signal(ESTUDIANTE) } },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['ok', 'error']) },
      ],
    });
    fixture = TestBed.createComponent(RespuestaForm);
    fixture.componentRef.setInput('ticket', detalle(TICKETS[1], ['REGISTRO', 'EN_PROCESO', 'OBSERVADO']));
    fixture.componentRef.setInput('observaciones', 1);
    fixture.detectChanges();
  });

  function escribir(texto: string): void {
    const area: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    area.value = texto;
    area.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('no envía una respuesta demasiado corta', () => {
    escribir('Ok');

    expect(tickets.responder).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('al menos 10 caracteres');
  });

  it('envía la respuesta del estudiante y emite el detalle actualizado', () => {
    const actualizado = detalle({ ...TICKETS[1], sEstado: 'EN_PROCESO' }, ['REGISTRO', 'EN_PROCESO', 'OBSERVADO', 'RESPUESTA']);
    tickets.responder.and.returnValue(of(actualizado));
    const emitidos: unknown[] = [];
    fixture.componentInstance.enviado.subscribe(d => emitidos.push(d));

    escribir('  Adjunto el voucher del pago duplicado.  ');

    expect(tickets.responder).toHaveBeenCalledWith(2, {
      nId_Usuario: ESTUDIANTE.nId_Usuario,
      sComentario: 'Adjunto el voucher del pago duplicado.',
    });
    expect(emitidos).toEqual([actualizado]);
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Ticket } from '../../../core/models/ticket';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { TicketService } from '../data/ticket.service';
import { ESTUDIANTE } from '../testing-data';
import { NuevaSolicitudPage } from './nueva-solicitud-page';

describe('NuevaSolicitudPage', () => {
  let tickets: jasmine.SpyObj<TicketService>;
  let router: Router;

  beforeEach(() => {
    tickets = jasmine.createSpyObj<TicketService>('TicketService', ['crear']);
    TestBed.configureTestingModule({
      imports: [NuevaSolicitudPage],
      providers: [
        provideRouter([]),
        { provide: TicketService, useValue: tickets },
        { provide: AuthService, useValue: { usuario: signal(ESTUDIANTE) } },
        { provide: ToastService, useValue: jasmine.createSpyObj<ToastService>('ToastService', ['ok']) },
      ],
    });
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    spyOn(console, 'log');
    spyOn(console, 'error');
  });

  const crear = () => {
    const fixture = TestBed.createComponent(NuevaSolicitudPage);
    fixture.detectChanges();
    return fixture;
  };

  const llenar = (el: HTMLElement) => {
    el.querySelector<HTMLInputElement>('input[value=PENSION]')!.click();
    const asunto = el.querySelector<HTMLInputElement>('input[formcontrolname=sAsunto]')!;
    asunto.value = 'Boleta no recibida';
    asunto.dispatchEvent(new Event('input'));
    const descripcion = el.querySelector<HTMLTextAreaElement>('textarea')!;
    descripcion.value = 'No me llegó la boleta electrónica de la cuota 4';
    descripcion.dispatchEvent(new Event('input'));
  };

  it('no envía si falta la categoría y muestra los errores', () => {
    const fixture = crear();
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(tickets.crear).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Elige una categoría');
  });

  it('envía con el id del usuario autenticado y abre el detalle', () => {
    tickets.crear.and.returnValue(of({ nId_Ticket: 15, sNum_Ticket: 'SOL-0015' } as Ticket));
    const fixture = crear();
    const el = fixture.nativeElement as HTMLElement;
    llenar(el);
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    expect(tickets.crear).toHaveBeenCalledWith({
      sTipo: 'PENSION',
      sAsunto: 'Boleta no recibida',
      sDescripcion: 'No me llegó la boleta electrónica de la cuota 4',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/solicitudes', 15]);
  });

  it('muestra el mensaje del backend si falla', () => {
    tickets.crear.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'Tipo de ticket no válido: X' } })),
    );
    const fixture = crear();
    const el = fixture.nativeElement as HTMLElement;
    llenar(el);
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('Tipo de ticket no válido');
  });
});

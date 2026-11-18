import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../../../core/config/api';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
  let service: TicketService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(TicketService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista sin filtros', () => {
    service.listar().subscribe();
    const req = http.expectOne(`${API_URL}/tickets`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('envía estado y tipo como query params', () => {
    service.listar({ estado: 'PENDIENTE', tipo: 'PENSION' }).subscribe();
    http.expectOne(`${API_URL}/tickets?estado=PENDIENTE&tipo=PENSION`).flush([]);
  });

  it('obtiene el detalle por id', () => {
    service.obtener(15).subscribe();
    http.expectOne(`${API_URL}/tickets/15`).flush({});
  });

  it('crea una solicitud con POST', () => {
    const nueva = { nId_Usuario: 2, sTipo: 'CERTIFICADO' as const, sAsunto: 'Constancia', sDescripcion: 'Necesito mi constancia de matrícula' };
    service.crear(nueva).subscribe();
    const req = http.expectOne(`${API_URL}/tickets`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nueva);
    req.flush({});
  });
});

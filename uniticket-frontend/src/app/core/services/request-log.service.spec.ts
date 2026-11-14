import { HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { RequestLogService } from './request-log.service';

describe('RequestLogService', () => {
  let service: RequestLogService;

  beforeEach(() => {
    service = TestBed.inject(RequestLogService);
  });

  it('registra la petición más reciente primero', () => {
    service.agregar(new HttpRequest('GET', '/api/tickets'), 200, [], 120);
    service.agregar(new HttpRequest('GET', '/api/usuarios'), 200, [], 80);
    expect(service.entradas().map(e => e.url)).toEqual(['/api/usuarios', '/api/tickets']);
  });

  it('nunca guarda la contraseña en texto plano', () => {
    service.agregar(new HttpRequest('POST', '/api/auth/login', { sEmail: 'a@utp.edu.pe', sPassword: '123456' }), 200, 'token', 50);
    expect(service.entradas()[0].enviado).toEqual({ sEmail: 'a@utp.edu.pe', sPassword: '••••••' });
  });
});

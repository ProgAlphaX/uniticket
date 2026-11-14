import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['obtenerToken', 'cerrarSesion']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('agrega Authorization: Bearer cuando hay token', () => {
    auth.obtenerToken.and.returnValue('mi-token');
    http.get('/api/tickets').subscribe();
    const req = backend.expectOne('/api/tickets');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mi-token');
    req.flush([]);
  });

  it('no agrega cabecera cuando no hay token', () => {
    auth.obtenerToken.and.returnValue(null);
    http.post('/api/auth/login', {}).subscribe();
    const req = backend.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush('token');
  });

  it('cierra la sesión si el backend rechaza el token con 403', () => {
    auth.obtenerToken.and.returnValue('vencido');
    http.get('/api/tickets').subscribe({ error: () => undefined });
    backend.expectOne('/api/tickets').flush('', { status: 403, statusText: 'Forbidden' });
    expect(auth.cerrarSesion).toHaveBeenCalled();
  });

  it('no cierra la sesión por un error de validación (400)', () => {
    auth.obtenerToken.and.returnValue('valido');
    http.post('/api/usuarios', {}).subscribe({ error: () => undefined });
    backend.expectOne('/api/usuarios').flush({ message: 'x' }, { status: 400, statusText: 'Bad Request' });
    expect(auth.cerrarSesion).not.toHaveBeenCalled();
  });
});

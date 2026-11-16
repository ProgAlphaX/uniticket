import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { API_URL } from '../../../core/config/api';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../../../core/models/usuario';
import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let http: HttpTestingController;

  const usuario: Usuario = {
    nId_Usuario: 23,
    sNombres: 'Ana',
    sApellidos: 'Torres',
    sNombreCompleto: 'Ana Torres',
    sEmail: 'ana@utp.edu.pe',
    sDni: '12345678',
    sTelefono: '987654321',
    sRol: 'ESTANDAR',
    sEstado: 'ACTIVO',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsuarioService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista usuarios enviando el filtro de estado', () => {
    service.getUsuarios('INACTIVO').subscribe((usuarios) => {
      expect(usuarios).toEqual([usuario]);
    });

    const request = http.expectOne(
      (req) => req.url === `${API_URL}/usuarios` && req.params.get('estado') === 'INACTIVO',
    );
    expect(request.request.method).toBe('GET');
    request.flush([usuario]);
  });

  it('busca por nombre usando el parámetro esperado', () => {
    service.buscar('Ana Torres').subscribe((usuarios) => {
      expect(usuarios).toEqual([usuario]);
    });

    const request = http.expectOne(
      (req) => req.url === `${API_URL}/usuarios/buscar` && req.params.get('nombre') === 'Ana Torres',
    );
    expect(request.request.method).toBe('GET');
    request.flush([usuario]);
  });

  it('crea usuarios con el contrato POST', () => {
    const datos: UsuarioCreate = {
      sNombres: 'Ana',
      sApellidos: 'Torres',
      sEmail: 'ana@utp.edu.pe',
      sDni: '12345678',
      sTelefono: '987654321',
      sRol: 'ESTANDAR',
      sPassword: 'secreto1',
    };

    service.crearUsuario(datos).subscribe((respuesta) => {
      expect(respuesta).toEqual(usuario);
    });

    const request = http.expectOne(`${API_URL}/usuarios`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(datos);
    request.flush(usuario);
  });

  it('actualiza solo en el endpoint del ID indicado', () => {
    const datos: UsuarioUpdate = {
      sNombres: 'Ana María',
      sApellidos: 'Torres',
      sEmail: 'ana@utp.edu.pe',
      sTelefono: '',
    };

    service.actualizar(usuario.nId_Usuario, datos).subscribe((respuesta) => {
      expect(respuesta).toEqual(usuario);
    });

    const request = http.expectOne(`${API_URL}/usuarios/23`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(datos);
    request.flush(usuario);
  });

  it('envía el estado nuevo en el cuerpo del PUT', () => {
    service.cambiarEstado(usuario.nId_Usuario, 'INACTIVO').subscribe((respuesta) => {
      expect(respuesta.sEstado).toBe('INACTIVO');
    });

    const request = http.expectOne(`${API_URL}/usuarios/23/estado`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ sEstado: 'INACTIVO' });
    request.flush({ ...usuario, sEstado: 'INACTIVO' });
  });
});

import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { Usuario } from '../../../core/models/usuario';
import { ToastService } from '../../../core/services/toast.service';
import { UsuarioService } from '../data/usuario.service';
import { UsuariosPage } from './usuarios-page';

describe('UsuariosPage', () => {
  const usuario: Usuario = {
    nId_Usuario: 1,
    sNombres: 'Ana',
    sApellidos: 'Torres',
    sNombreCompleto: 'Ana Torres',
    sEmail: 'ana@utp.edu.pe',
    sDni: '12345678',
    sTelefono: '987654321',
    sRol: 'ESTANDAR',
    sEstado: 'ACTIVO',
  };

  it('combina el filtro de nombre con el estado seleccionado', () => {
    const resultados: Usuario[] = [
      {
        nId_Usuario: 1,
        sNombres: 'Ana',
        sApellidos: 'Torres',
        sNombreCompleto: 'Ana Torres',
        sEmail: 'ana.activa@utp.edu.pe',
        sDni: '12345678',
        sTelefono: null,
        sRol: 'ESTANDAR',
        sEstado: 'ACTIVO',
      },
      {
        nId_Usuario: 2,
        sNombres: 'Ana',
        sApellidos: 'Pérez',
        sNombreCompleto: 'Ana Pérez',
        sEmail: 'ana.inactiva@utp.edu.pe',
        sDni: '87654321',
        sTelefono: null,
        sRol: 'ESTANDAR',
        sEstado: 'INACTIVO',
      },
    ];
    const usuarioService = jasmine.createSpyObj<UsuarioService>('UsuarioService', [
      'getUsuarios',
      'buscar',
      'crearUsuario',
      'actualizar',
      'cambiarEstado',
    ]);
    usuarioService.buscar.and.returnValue(of(resultados));
    usuarioService.getUsuarios.and.returnValue(of(resultados));

    TestBed.configureTestingModule({
      imports: [UsuariosPage],
      providers: [
        { provide: UsuarioService, useValue: usuarioService },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } },
        { provide: ToastService, useValue: { ok: jasmine.createSpy('ok'), error: jasmine.createSpy('error') } },
      ],
    });

    const page = TestBed.createComponent(UsuariosPage).componentInstance;
    page.filtroForm.setValue({ nombre: ' Ana ', estado: 'INACTIVO' }, { emitEvent: false });
    page.aplicarFiltros();

    expect(usuarioService.buscar).toHaveBeenCalledWith('Ana');
    expect(page.usuarios().map((usuario) => usuario.nId_Usuario)).toEqual([2]);
  });

  it('muestra el estado y los botones con el estilo del prototipo', () => {
    const usuarioService = jasmine.createSpyObj<UsuarioService>('UsuarioService', [
      'getUsuarios',
      'buscar',
      'crearUsuario',
      'actualizar',
      'cambiarEstado',
    ]);
    usuarioService.getUsuarios.and.returnValue(of([usuario]));
    usuarioService.buscar.and.returnValue(of([usuario]));

    TestBed.configureTestingModule({
      imports: [UsuariosPage],
      providers: [
        { provide: UsuarioService, useValue: usuarioService },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } },
        { provide: ToastService, useValue: { ok: jasmine.createSpy('ok'), error: jasmine.createSpy('error') } },
      ],
    });

    const fixture = TestBed.createComponent(UsuariosPage);
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('.user-row') as HTMLTableRowElement;
    expect(row.querySelector('.btn-out')?.textContent).toContain('Editar');
    expect(row.querySelector('.btn-no')?.textContent).toContain('Desactivar');
    expect(row.querySelector('ut-status-pill')?.textContent).toContain('Activo');
  });
});

import { BreakpointObserver } from '@angular/cdk/layout';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { Usuario } from '../../../core/models/usuario';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { UsuarioService } from '../data/usuario.service';
import { UsuariosPage } from './usuarios-page';

const ADMIN: Usuario = {
  nId_Usuario: 1, sNombres: 'Julio', sApellidos: 'Admin', sNombreCompleto: 'Julio Admin',
  sEmail: 'julio.admin@utp.edu.pe', sDni: '70123456', sTelefono: null, sRol: 'ADMIN', sEstado: 'ACTIVO',
};
const ACTIVA: Usuario = {
  nId_Usuario: 2, sNombres: 'Ana', sApellidos: 'Torres', sNombreCompleto: 'Ana Torres',
  sEmail: 'ana@utp.edu.pe', sDni: '12345678', sTelefono: '987654321', sRol: 'ESTANDAR', sEstado: 'ACTIVO',
};
const INACTIVA: Usuario = {
  nId_Usuario: 3, sNombres: 'Ana', sApellidos: 'Pérez', sNombreCompleto: 'Ana Pérez',
  sEmail: 'ana.perez@utp.edu.pe', sDni: '87654321', sTelefono: null, sRol: 'ESTANDAR', sEstado: 'INACTIVO',
};

describe('UsuariosPage', () => {
  let servicio: jasmine.SpyObj<UsuarioService>;
  let dialogo: { open: jasmine.Spy };
  let fixture: ComponentFixture<UsuariosPage>;

  beforeEach(() => {
    servicio = jasmine.createSpyObj<UsuarioService>('UsuarioService', [
      'getUsuarios', 'buscar', 'crearUsuario', 'actualizar', 'cambiarEstado',
    ]);
    servicio.getUsuarios.and.returnValue(of([ADMIN, ACTIVA, INACTIVA]));
    servicio.buscar.and.returnValue(of([ACTIVA, INACTIVA]));
    servicio.cambiarEstado.and.returnValue(of({ ...ACTIVA, sEstado: 'INACTIVO' }));
    dialogo = { open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) }) };

    TestBed.configureTestingModule({
      imports: [UsuariosPage],
      providers: [
        { provide: UsuarioService, useValue: servicio },
        { provide: MatDialog, useValue: dialogo },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['ok', 'error']) },
        { provide: AuthService, useValue: { usuario: signal(ADMIN) } },
        { provide: BreakpointObserver, useValue: { observe: () => of({ matches: false, breakpoints: {} }) } },
      ],
    });
    fixture = TestBed.createComponent(UsuariosPage);
    fixture.detectChanges();
  });

  function filas(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row'));
  }

  it('lista los usuarios con su estado y los contadores', () => {
    expect(servicio.getUsuarios).toHaveBeenCalledWith(undefined);
    expect(filas().length).toBe(3);
    expect(filas()[1].querySelector('ut-status-pill')?.textContent).toContain('Activo');
    expect(fixture.nativeElement.querySelector('.resumen').textContent).toContain('Activos 2');
    expect(fixture.nativeElement.querySelector('.resumen').textContent).toContain('Inactivos 1');
  });

  it('combina la búsqueda por nombre con el filtro de estado', () => {
    fixture.componentInstance.filtroForm.setValue({ nombre: ' Ana ', estado: 'INACTIVO' });
    fixture.componentInstance.aplicarFiltros();

    expect(servicio.buscar).toHaveBeenCalledWith('Ana');
    expect(fixture.componentInstance.usuarios().map(u => u.nId_Usuario)).toEqual([3]);
  });

  it('no permite desactivar la cuenta propia', () => {
    const propia = filas()[0];
    expect(propia.textContent).toContain('Tu cuenta');
    expect(propia.textContent).not.toContain('Desactivar');
    expect(filas()[1].textContent).toContain('Desactivar');
    expect(filas()[2].textContent).toContain('Activar');
  });

  it('desactiva un usuario tras confirmar', () => {
    const boton = Array.from(filas()[1].querySelectorAll('button')).find(b => b.textContent?.includes('Desactivar'))!;
    boton.click();

    expect(dialogo.open).toHaveBeenCalled();
    expect(servicio.cambiarEstado).toHaveBeenCalledWith(2, 'INACTIVO');
  });
});

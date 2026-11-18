import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Usuario } from '../../../core/models/usuario';
import { UsuarioDialog } from './usuario-dialog';

describe('UsuarioDialog', () => {
  let closeDialog: jasmine.Spy;

  function crearComponente(data: Usuario | null = null) {
    closeDialog = jasmine.createSpy('close');
    TestBed.configureTestingModule({
      imports: [UsuarioDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: closeDialog } },
      ],
    });

    return TestBed.createComponent(UsuarioDialog);
  }

  it('permite omitir el celular y exige un rol al crear un usuario', () => {
    const fixture = crearComponente();
    const component = fixture.componentInstance;

    component.form.patchValue({
      sNombres: 'Ana',
      sApellidos: 'Torres',
      sEmail: 'ana@utp.edu.pe',
      sDni: '12345678',
      sTelefono: '',
      sPassword: 'secreto1',
    });

    expect(component.form.controls.sTelefono.valid).toBeTrue();
    expect(component.form.controls.sRol.hasError('required')).toBeTrue();

    component.form.controls.sRol.setValue('ESTANDAR');
    expect(component.form.valid).toBeTrue();

    component.guardar();

    expect(closeDialog).toHaveBeenCalledWith({
      sNombres: 'Ana',
      sApellidos: 'Torres',
      sEmail: 'ana@utp.edu.pe',
      sTelefono: '',
      sDni: '12345678',
      sRol: 'ESTANDAR',
      sPassword: 'secreto1',
    });
  });

  it('en edición solo devuelve los campos editables', () => {
    const usuario: Usuario = {
      nId_Usuario: 7,
      sNombres: 'Ana',
      sApellidos: 'Torres',
      sNombreCompleto: 'Ana Torres',
      sEmail: 'ana@utp.edu.pe',
      sDni: '12345678',
      sTelefono: null,
      sRol: 'ESTANDAR',
      sEstado: 'ACTIVO',
    };
    const fixture = crearComponente(usuario);
    const component = fixture.componentInstance;

    component.form.patchValue({ sNombres: 'Ana María', sTelefono: '' });
    component.guardar();

    expect(closeDialog).toHaveBeenCalledWith({
      sNombres: 'Ana María',
      sApellidos: 'Torres',
      sEmail: 'ana@utp.edu.pe',
      sTelefono: '',
    });
  });

  it('valida que un celular informado tenga 9 dígitos y empiece con 9', () => {
    const fixture = crearComponente();
    const telefono = fixture.componentInstance.form.controls.sTelefono;

    telefono.setValue('123456789');
    expect(telefono.hasError('pattern')).toBeTrue();

    telefono.setValue('987654321');
    expect(telefono.valid).toBeTrue();
  });
});

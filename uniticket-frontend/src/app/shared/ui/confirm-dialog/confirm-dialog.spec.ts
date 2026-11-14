import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('muestra el título, el mensaje y el texto del botón de confirmación', () => {
    const data: ConfirmDialogData = {
      titulo: '¿Estás seguro de que quieres desactivar a Ana Torres?',
      mensaje: 'No podrá iniciar sesión.',
      confirmar: 'Sí, desactivar',
      peligro: true,
    };
    TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: data }, { provide: MatDialogRef, useValue: {} }],
    });
    const fixture = TestBed.createComponent(ConfirmDialog);
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('desactivar a Ana Torres');
    expect(texto).toContain('No podrá iniciar sesión.');
    expect(texto).toContain('Sí, desactivar');
  });
});

import { TestBed } from '@angular/core/testing';

import { StatusPill } from './status-pill';

describe('StatusPill', () => {
  const crear = (estado: string) => {
    const fixture = TestBed.createComponent(StatusPill);
    fixture.componentRef.setInput('estado', estado);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  it('muestra la etiqueta y la clase de un estado de solicitud', () => {
    const el = crear('NO_PROCEDE');
    expect(el.textContent?.trim()).toBe('No procede');
    expect(el.classList).toContain('pill--NO_PROCEDE');
  });

  it('muestra la etiqueta de un estado de usuario', () => {
    expect(crear('INACTIVO').textContent?.trim()).toBe('Inactivo');
  });
});
